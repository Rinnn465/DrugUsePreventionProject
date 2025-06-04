require('dotenv').config();
const express = require('express');
const session = require('express-session');
const authenRoutes = require('./routes/authenRoutes');
const cors = require('cors');

const app = express();

//tim hieu ve cors policy de cac port localhost giao tiep voi nhau
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

//tra ve json 
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));


app.use('/', authenRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));