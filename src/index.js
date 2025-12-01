require('dotenv').config();

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
const rankingController = require('./controllers/rankingController');
const reviewController = require('./controllers/reviewController');
const descarteController = require('./controllers/descarteController');
// Importar modelos para garantir que sejam sincronizados
require('./models/user');
require('./models/pontoColeta');
require('./models/residuo');
require('./models/avaliacao');
require('./models/descarte');
const app = express();


app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts/',
    helpers: {
        eq: (a, b) => a === b,
        json: (context) => JSON.stringify(context),
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

// Página Metas da ONU
app.get('/ods', (req, res) => {
    res.render('ods');
});

// Página de Notificações
app.get('/notificacoes', (req, res) => {
    const novosPontos = [
        { name: 'Supermercado VerdeVida', address: 'Rua das Árvores, 1001 - Jardim, BH', materials: ['Plástico', 'Papel', 'Vidro'] },
        { name: 'Eco Estação ReciclaMais', address: 'Av. Sustentável, 250 - Centro, Contagem', materials: ['Metal', 'Eletrônicos', 'Óleo'] },
        { name: 'Mercadinho Limpo e Leve', address: 'Praça do Meio Ambiente, 12 - Santa Luzia', materials: ['Plástico', 'Orgânico', 'Pilhas'] }
    ];
    res.render('notificacoes', { pontos: novosPontos });
});

// Página de Ranking
app.get('/ranking', rankingController.renderRankingPage);
app.get('/api/ranking/diretrizes', rankingController.getDiretrizes);
app.get('/api/ranking/empresas', rankingController.getRanking);
app.get('/api/ranking/premios', rankingController.getPremios);

app.get('/mapa', mapController.fullscreen);
app.get('/api/pontos', mapController.api);

// Rotas de avaliações
app.post('/api/reviews', requireAuth, reviewController.createReview);
app.get('/api/reviews/ponto/:pontoColetaId', reviewController.getReviewsByPonto);
app.get('/api/reviews/media/:pontoColetaId', reviewController.getAverageRating);

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

// Rotas de descartes (admin)
app.get('/api/usuarios', requireAuth, requireAdmin, descarteController.listarUsuarios);
app.get('/api/residuos', requireAuth, requireAdmin, descarteController.listarResiduos);
app.post('/api/admin/descartes', requireAuth, requireAdmin, descarteController.criarDescarte);
app.get('/api/admin/descartes', requireAuth, requireAdmin, descarteController.listarDescartesPorPontoColeta);
app.get('/api/admin/estatisticas', requireAuth, requireAdmin, descarteController.obterEstatisticas);

// Rotas de descartes (usuário)
app.get('/api/descartes/usuario/:userId', requireAuth, descarteController.listarDescartesPorUsuario);



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
