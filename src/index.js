const express = require('express');
const { engine } = require('express-handlebars');
const sequelize = require('./services/database');
const app = express();

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/password-reset', (req, res) => {
    res.render('password-reset');
});

app.get('/main-page', (req, res) => {
    res.render('main-page');
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
