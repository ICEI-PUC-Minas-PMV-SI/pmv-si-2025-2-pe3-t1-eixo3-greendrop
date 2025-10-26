const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;

async function requireAdmin(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).send(`
                <html>
                <head>
                    <title>Acesso Negado</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="bg-gray-100 flex items-center justify-center min-h-screen">
                    <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                        <h1 class="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
                        <p class="text-gray-700 mb-6">Você não tem permissão para acessar esta área. Apenas administradores podem acessar.</p>
                        <a href="/" class="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Voltar para Home</a>
                    </div>
                </body>
                </html>
            `);
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token inválido:', error);
        res.clearCookie('token');
        res.redirect('/login');
    }
}

module.exports = { requireAdmin };
