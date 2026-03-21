require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

var app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../static")));

const sessionStore = new MySQLStore({
    host: process.env.DB_CONTAINER,
    port: process.env.DB_PORT,
    user: process.env.MYSQL_ROOT_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    clearExpired: true,
    checkExpirationInterval: 900000,  // check every 15 min
    expiration: 86400000,             // sessions expire after 24 hours
    createDatabaseTable: true,        // auto-creates `sessions` table if missing
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'recipehub-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: false,       // set true if using HTTPS
        maxAge: 86400000     // 24 hours in ms
    }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const db = require('./services/db');

const authRoutes = require('../routes/auth');
const recipeRoutes = require('../routes/recipes');
const userRoutes = require('../routes/users');
const reviewRoutes = require('../routes/reviews');

app.use('/', authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/users', userRoutes);
app.use('/reviews', reviewRoutes);

app.get("/", async function(req, res) {
    try {
        const Recipe = require('../models/recipe');
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
        const ingredients = await db.query(
            'SELECT ingredient_id AS id, name FROM ingredients ORDER BY name ASC'
        );
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
