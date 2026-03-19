require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");

var app = express();

// Tell the app to use Pug for pages
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Allow the app to read form data
app.use(express.urlencoded({ extended: true }));

// Add static files location (CSS, images)
app.use(express.static(path.join(__dirname, "../static")));

// Set up sessions (this is how the app remembers who is logged in)
app.use(session({
    secret: 'recipehub-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Get the database
const db = require('./services/db');

// Import routes
const authRoutes = require('./routes/auth');

// Use routes
app.use('/', authRoutes);

// Home route
app.get("/", function(req, res) {
    res.render('index', { user: req.session.user });
});

// Start the server
app.listen(3000, function() {
    console.log("Server running on port 3000");
});

module.exports = app;