const express = require('express');
const router = express.Router();
const authenController = require('../controllers/authenController');

router.post('/register', authenController.register);
router.post('/login', authenController.login);
router.post('/logout', authenController.logout);

// New forgot password routes
router.get('/forgot-password', authenController.showForgotPasswordForm);
router.post('/forgot-password', authenController.forgotPassword);
router.get('/reset-password/:token', authenController.showResetPasswordForm);
router.post('/reset-password/:token', authenController.resetPassword);

module.exports = router;