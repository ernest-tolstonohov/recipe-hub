require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

var app = express();
const helmet = require("helmet");

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'"],
            "script-src-attr": ["'unsafe-inline'"],
            "img-src": ["'self'", "https://images.unsplash.com"],
        }
    },
    frameguard: {
        action: 'deny'
    }
}));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));

const sessionStore = new MySQLStore({
    host: process.env.DB_CONTAINER,
    port: process.env.DB_PORT,
    user: process.env.MYSQL_ROOT_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    clearExpired: true,
    checkExpirationInterval: 300000,  // check every 5 min
    expiration: 7200000,              // sessions expire after 2 hours
    createDatabaseTable: true,        // auto-creates `sessions` table if missing
});

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',       // set true if using HTTPS
        sameSite: 'strict',
        maxAge: SESSION_TIMEOUT     // 2 hours in ms
    }
}));

// Inactivity timeout middleware
app.use((req, res, next) => {
    if (req.session.user) {
        const now = Date.now();
        if (req.session.lastActivity && (now - req.session.lastActivity) > SESSION_TIMEOUT) {
            return req.session.destroy(() => res.redirect('/login'));
        }
        req.session.lastActivity = now;
    }
    next();
});

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const db = require('./services/db');

db.query("CREATE INDEX idx_recipes_title ON recipes(title)").catch(err => {
    if (err.code !== 'ER_DUP_KEYNAME') console.error('Index creation warning:', err);
});

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/users', userRoutes);
app.use('/reviews', reviewRoutes);
app.use('/system-control', adminRoutes);

app.get('/search/autocomplete', async (req, res) => {
    const q = req.query.q || '';
    if (!q.trim()) return res.json([]);
    
    try {
        const results = await require('./models/recipe').autocomplete(q);
        res.json(results);
    } catch(err) {
        res.status(500).json({ error: 'Failed search' });
    }
});

app.get('/media/:filename', (req, res) => {
    const safePath = path.join(__dirname, '../secure_uploads', path.basename(req.params.filename));
    res.sendFile(safePath, err => {
        if (err) res.status(404).end();
    });
});

app.get("/", async function(req, res) {
    try {
        const Recipe = require('./models/recipe');
        const [recipes, tags, [stats]] = await Promise.all([
            Recipe.findAll(),
            db.query('SELECT tag_id, name, type FROM tags ORDER BY type, name'),
            db.query('SELECT (SELECT COUNT(*) FROM recipes) AS recipe_count, (SELECT COUNT(*) FROM users) AS user_count'),
        ]);
        res.render('index', { user: req.session.user, recipes, tags, stats });
    } catch (err) {
        console.error(err);
        res.render('index', { user: req.session.user, recipes: [], tags: [], stats: { recipe_count: 0, user_count: 0 } });
    }
});

app.get("/ingredients", async function(req, res) {
    try {
        const db = require('./services/db');
        const q = (req.query.q || '').trim();
        const ingredients = q
            ? await db.query(
                "SELECT ingredient_id AS id, name FROM ingredients WHERE LOWER(name) LIKE ? ORDER BY name ASC LIMIT 10",
                [`%${q.toLowerCase()}%`]
              )
            : await db.query('SELECT ingredient_id AS id, name FROM ingredients ORDER BY name ASC');
        res.json(ingredients);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.use((req, res, next) => {
    res.status(404).render('404');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Something went wrong on our end. Please try again later.' 
    });
});

app.listen(3000, function() {
    console.log("Server running on port 3000");
});

module.exports = app;
