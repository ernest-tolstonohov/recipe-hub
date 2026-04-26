const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const adminLogger = require('../middleware/adminLogger');
const { getDashboard, toggleUserStatus, deleteRecipe, deleteReview } = require('../controllers/adminController');

router.use(requireAdmin);
router.use(adminLogger);

router.get('/', getDashboard);
router.post('/users/:id/toggle', toggleUserStatus);
router.delete('/recipes/:id', deleteRecipe);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
