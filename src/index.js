const express = require('express');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');
const sequelize = require('./services/database');
const authController = require('./controllers/authController');
const { requireAuth } = require('./middleware/auth');
const app = express();

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

// Rotas de autenticação
app.post('/register', authController.register);
app.post('/login', authController.login);
app.get('/logout', authController.logout);

app.get('/password-reset', (req, res) => {
    res.render('password-reset');
});

app.get('/main-page', requireAuth, (req, res) => {
    res.render('main-page');
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
