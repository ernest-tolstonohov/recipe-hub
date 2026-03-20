require("dotenv").config();
const express = require("express");
const path = require("path");

var app = express();

// Tell the app to use Pug for pages
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Allow the app to read form data
app.use(express.urlencoded({ extended: true }));

// Add static files location (CSS, images)
app.use(express.static(path.join(__dirname, "../static")));

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
    const user = req.session ? req.session.user : null;
    res.render('index', { user: user });
});
// Start the server
app.listen(3000, function() {
    console.log("Server running on port 3000");
});

module.exports = app;
