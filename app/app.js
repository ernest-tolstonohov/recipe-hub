require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");

var app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../static")));

app.use(session({
    secret: 'recipehub-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const db = require('./services/db');

const authRoutes = require('../routes/auth');
const recipeRoutes = require('../routes/recipes');
const userRoutes = require('../routes/users');

app.use('/', authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/users', userRoutes);

app.get("/", function(req, res) {
    res.render('index', { user: req.session.user });
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
