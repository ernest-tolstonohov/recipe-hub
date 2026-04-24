const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'admin.log');

module.exports = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const user = req.session.user ? req.session.user.username : 'Unknown';
    const method = req.method;
    const url = req.originalUrl;

    const logEntry = `[${timestamp}] User: ${user} | Action: ${method} ${url}\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error('Failed to write to admin log:', err);
    });

    next();
};
