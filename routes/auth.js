const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

router.get('/register', AuthController.getRegister);
router.post('/register', AuthController.postRegister);
router.get('/login', AuthController.getLogin);
router.post('/login', AuthController.postLogin);
router.get('/logout', AuthController.logout);
router.post('/logout', AuthController.logout);

module.exports = router;
