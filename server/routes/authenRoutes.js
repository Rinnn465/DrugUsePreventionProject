const express = require('express');
const router = express.Router();
const authenController = require('../controllers/authenController');

// router.get('/register', (req, res) => res.render('register'));
router.post('/register', authenController.register);

// router.get('/login', (req, res) => res.render('login'));
router.post('/login', authenController.login);

router.post('/logout', authenController.logout);

module.exports = router;