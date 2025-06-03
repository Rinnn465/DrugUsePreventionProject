const express = require('express');
const session = require('express-session');
const authenRoutes = require('./routes/authenRoutes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));
app.set('view engine', 'ejs');

app.use('/', authenRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));