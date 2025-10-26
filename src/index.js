const express = require('express');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');
const sequelize = require('./services/database');
const authController = require('./controllers/authController');
const { requireAuth } = require('./middleware/auth');
const { requireAdmin } = require('./middleware/adminAuth');
const pontoColetaController = require('./controllers/pontoColetaController');
const profileController = require('./controllers/profileController');
const mapController = require('./controllers/mapController');
const app = express();


app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts/',
    helpers: {
        eq: (a, b) => a === b,
        json: (ctx) => JSON.stringify(ctx),
    }
}));
app.set('view engine', '.hbs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/educativo', (req, res) => {
    res.render('educativo');
});

app.get('/mapa', mapController.fullscreen);
app.get('/api/pontos', mapController.api);

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



// ROTAS PÚBLICAS
app.get('/password-reset', (req, res) => {
    res.render('password-reset');
});

// ROTAS AUTENTICADAS
app.get('/perfil', requireAuth, profileController.view);
app.get('/main-page', requireAuth, (req, res) => {
    res.render('main-page');
});


// Rotas administrativas de pontos de coleta
app.get('/admin', requireAuth, requireAdmin, pontoColetaController.renderAdminPage);



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
