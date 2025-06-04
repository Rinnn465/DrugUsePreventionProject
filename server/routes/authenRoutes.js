const express = require('express');
const router = express.Router();
const authenController = require('../controllers/authenController');

// router.get('/register', (req, res) => res.render('register'));
router.post('/register', authenController.register);

// router.get('/login', (req, res) => res.render('login'));
router.post('/login', authenController.login);

router.post('/logout', authenController.logout);

// New forgot password routes
router.get('/forgot-password', authenController.showForgotPasswordForm);
router.post('/forgot-password', authenController.forgotPassword);
router.get('/reset-password/:token', authenController.showResetPasswordForm);
router.post('/reset-password/:token', authenController.resetPassword);

module.exports = router;