require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");

var app = express();

// Tell the app to use Pug for pages
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Allow the app to read form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add static files location
app.use(express.static(path.join(__dirname, "../static")));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'recipehub-dev-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Make user available to ALL pages automatically
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Get the database
const db = require('./services/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');

// Use routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', recipeRoutes);

// Home route
app.get("/", function(req, res) {
    res.render('index', { user: res.locals.user });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { user: res.locals.user });
});

// Generic Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: err.message || 'Something went wrong.',
        user: res.locals.user
    });
});

// Start the server
app.listen(3000, function() {
    console.log("Server running on port 3000");
});

module.exports = app;