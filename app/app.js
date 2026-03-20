require("dotenv").config();
const express = require("express");
const path = require("path");

var app = express();

// Tell the app to use Pug for pages
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Allow the app to read form data
app.use(express.urlencoded({ extended: true }));

// Add static files location
app.use(express.static(path.join(__dirname, "../static")));

// Make user available to ALL pages automatically
app.use((req, res, next) => {
    res.locals.user = req.session ? req.session.user || null : null;
    next();
});

// Get the database
const db = require('./services/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Use routes
app.use('/', authRoutes);
app.use('/', userRoutes);

// Home route
app.get("/", function(req, res) {
    res.render('index', { user: res.locals.user });
});

// Start the server
app.listen(3000, function() {
    console.log("Server running on port 3000");
});

module.exports = app;