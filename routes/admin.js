const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const adminLogger = require('../middleware/adminLogger');

// Apply strictly enforced admin authorization and logging to all routes under this path
router.use(requireAdmin);
router.use(adminLogger);

router.get('/', (req, res) => {
    res.render('admin', { user: req.session.user });
});

module.exports = router;
