const express = require('express');
const router = express.Router();
const authenController = require('../controllers/authenController');

router.get('/register', (req, res) => res.render('register'));
router.post('/register', authenController.register);

router.get('/login', (req, res) => res.render('login'));
router.post('/login', authenController.login);

router.get('/logout', authenController.logout);

// New forgot password routes
router.get('/forgot-password', authController.showForgotPasswordForm);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.showResetPasswordForm);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;