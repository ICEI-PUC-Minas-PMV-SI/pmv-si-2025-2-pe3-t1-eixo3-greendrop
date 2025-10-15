const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).render('register', {
                error: 'Email já cadastrado'
            });
        }

        if (password.length < 8) {
            return res.status(400).render('register', {
                error: 'A senha deve ter pelo menos 8 caracteres'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect('/main-page');
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).render('register', {
            error: 'Erro ao criar conta. Tente novamente.'
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).render('login', {
                error: 'Email ou senha inválidos'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).render('login', {
                error: 'Email ou senha inválidos'
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect('/main-page');
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).render('login', {
            error: 'Erro ao fazer login. Tente novamente.'
        });
    }
}

function logout(req, res) {
    res.clearCookie('token');
    res.redirect('/login');
}

module.exports = {
    register,
    login,
    logout,
};
