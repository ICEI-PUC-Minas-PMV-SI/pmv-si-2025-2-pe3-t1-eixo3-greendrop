const Avaliacao = require('../models/avaliacao');
const User = require('../models/user');
const PontoColeta = require('../models/pontoColeta');
const sequelize = require('../services/database');
const { requireAuth } = require('../middleware/auth');

// Criar nova avaliação
async function createReview(req, res) {
    try {
        const { pontoColetaId, nota, comentario } = req.body;
        const userId = req.user.id;

        if (!pontoColetaId || !nota) {
            return res.status(400).json({ error: 'Ponto de coleta e nota são obrigatórios' });
        }

        if (nota < 1 || nota > 5) {
            return res.status(400).json({ error: 'A nota deve ser entre 1 e 5' });
        }

        // Verificar se o usuário já avaliou este ponto
        const existingReview = await Avaliacao.findOne({
            where: {
                userId,
                pontoColetaId
            }
        });

        if (existingReview) {
            // Atualizar avaliação existente
            existingReview.nota = nota;
            existingReview.comentario = comentario || null;
            await existingReview.save();
            return res.json(existingReview);
        }

        const avaliacao = await Avaliacao.create({
            userId,
            pontoColetaId,
            nota,
            comentario: comentario || null
        });

        const avaliacaoComUser = await Avaliacao.findByPk(avaliacao.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });

        res.json(avaliacaoComUser);
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
}

// Listar avaliações de um ponto de coleta
async function getReviewsByPonto(req, res) {
    try {
        const { pontoColetaId } = req.params;

        const avaliacoes = await Avaliacao.findAll({
            where: { pontoColetaId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(avaliacoes);
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
}

// Calcular média de avaliações de um ponto
async function getAverageRating(req, res) {
    try {
        const { pontoColetaId } = req.params;

        const result = await Avaliacao.findAll({
            where: { pontoColetaId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('nota')), 'media'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'total']
            ],
            raw: true
        });

        const media = result[0]?.media ? parseFloat(result[0].media).toFixed(1) : '0.0';
        const total = result[0]?.total || 0;

        res.json({ media: parseFloat(media), total: parseInt(total) });
    } catch (error) {
        console.error('Erro ao calcular média:', error);
        res.status(500).json({ error: 'Erro ao calcular média' });
    }
}

module.exports = {
    createReview,
    getReviewsByPonto,
    getAverageRating
};
