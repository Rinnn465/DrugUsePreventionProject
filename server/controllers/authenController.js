const Account = require('../models/account');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { username, email, password, fullName, dateOfBirth } = req.body; // Bỏ role
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const userId = await Account.create(username, email, hashedPassword, fullName, dateOfBirth);
        res.status(201).json({ message: 'User registered successfully', userId });
        //backend ko handle redirect, chi can tra ve chuoi json, ben frontend se xu ly redirect
    } catch (error) {
        res.status(500).send('Error registering user');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Account.findByEmail(email);
        if (user && await bcrypt.compare(password, user.Password)) {
            req.session.user = user
            res.status(201).json({ message: 'Login successful', user: user });
            // res.redirect('/dashboard');
        } else {
            res.status(401).send('Wrong email or password');
        }
    } catch (error) {
        res.status(500).send('Error logging in');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out' });

    });
};