const User = require('../models/user');
const PontoColeta = require('../models/pontoColeta');
const Residuo = require('../models/residuo');
const Descarte = require('../models/descarte');
const { Op } = require('sequelize');

// Listar usuários (para busca no admin)
async function listarUsuarios(req, res) {
    try {
        const { busca } = req.query;
        const where = {
            role: 'user'
        };

        if (busca) {
            where[Op.or] = [
                { name: { [Op.like]: `%${busca}%` } },
                { email: { [Op.like]: `%${busca}%` } }
            ];
        }

        const usuarios = await User.findAll({
            where,
            attributes: ['id', 'name', 'email', 'pontos'],
            limit: 20,
            order: [['name', 'ASC']]
        });

        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
}

// Listar resíduos/materiais
async function listarResiduos(req, res) {
    try {
        const residuos = await Residuo.findAll({
            attributes: ['id', 'nome', 'categoria', 'pontosPorKg', 'icone', 'corCategoria'],
            order: [['nome', 'ASC']]
        });

        res.json(residuos);
    } catch (error) {
        console.error('Erro ao listar resíduos:', error);
        res.status(500).json({ error: 'Erro ao buscar resíduos' });
    }
}

// Criar descarte (admin lança pontos para usuário)
async function criarDescarte(req, res) {
    try {
        const { userId, residuoId, quantidade, unidade } = req.body;
        const adminUser = req.user;

        if (!userId || !residuoId || !quantidade) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        const pontoColeta = await PontoColeta.findOne({
            where: { adminId: adminUser.id }
        });

        if (!pontoColeta) {
            return res.status(404).json({ error: 'Ponto de coleta não encontrado para este admin' });
        }

        const residuo = await Residuo.findByPk(residuoId);
        if (!residuo) {
            return res.status(404).json({ error: 'Resíduo não encontrado' });
        }

        const pontosAtribuidos = parseFloat(quantidade) * parseFloat(residuo.pontosPorKg);

        const descarte = await Descarte.create({
            userId,
            pontoColetaId: pontoColeta.id,
            residuoId,
            quantidade: parseFloat(quantidade),
            unidade: unidade || 'kg',
            pontosAtribuidos: Math.round(pontosAtribuidos),
            status: 'aprovado'
        });

        const usuario = await User.findByPk(userId);
        if (usuario) {
            await usuario.update({
                pontos: usuario.pontos + Math.round(pontosAtribuidos)
            });
        }

        const descarteCompleto = await Descarte.findByPk(descarte.id, {
            include: [
                { model: User, as: 'usuario', attributes: ['id', 'name', 'email'] },
                { model: Residuo, as: 'residuo', attributes: ['id', 'nome', 'categoria'] },
                { model: PontoColeta, as: 'pontoColeta', attributes: ['id', 'nome'] }
            ]
        });

        res.json({
            success: true,
            message: 'Descarte registrado com sucesso!',
            descarte: descarteCompleto
        });

    } catch (error) {
        console.error('Erro ao criar descarte:', error);
        res.status(500).json({ error: 'Erro ao registrar descarte' });
    }
}

// Listar descartes por usuário
async function listarDescartesPorUsuario(req, res) {
    try {
        const { userId } = req.params;

        const descartes = await Descarte.findAll({
            where: { userId },
            include: [
                { model: Residuo, as: 'residuo', attributes: ['nome', 'categoria', 'icone'] },
                { model: PontoColeta, as: 'pontoColeta', attributes: ['nome', 'endereco'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(descartes);
    } catch (error) {
        console.error('Erro ao listar descartes do usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
}

// Listar descartes do ponto de coleta (admin)
async function listarDescartesPorPontoColeta(req, res) {
    try {
        const adminUser = req.user;

        const pontoColeta = await PontoColeta.findOne({
            where: { adminId: adminUser.id }
        });

        if (!pontoColeta) {
            return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
        }

        const descartes = await Descarte.findAll({
            where: { pontoColetaId: pontoColeta.id },
            include: [
                { model: User, as: 'usuario', attributes: ['name', 'email'] },
                { model: Residuo, as: 'residuo', attributes: ['nome', 'categoria'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        res.json(descartes);
    } catch (error) {
        console.error('Erro ao listar descartes do ponto:', error);
        res.status(500).json({ error: 'Erro ao buscar descartes' });
    }
}

// Estatísticas para o dashboard admin
async function obterEstatisticas(req, res) {
    try {
        const adminUser = req.user;

        const pontoColeta = await PontoColeta.findOne({
            where: { adminId: adminUser.id }
        });

        if (!pontoColeta) {
            return res.json({
                descartesValidados: 0,
                descartesPendentes: 0,
                pontosAtribuidos: 0
            });
        }

        const descartesValidados = await Descarte.count({
            where: { pontoColetaId: pontoColeta.id, status: 'aprovado' }
        });

        const descartesPendentes = await Descarte.count({
            where: { pontoColetaId: pontoColeta.id, status: 'pendente' }
        });

        const result = await Descarte.findOne({
            where: { pontoColetaId: pontoColeta.id, status: 'aprovado' },
            attributes: [
                [require('sequelize').fn('SUM', require('sequelize').col('pontosAtribuidos')), 'total']
            ],
            raw: true
        });

        res.json({
            descartesValidados,
            descartesPendentes,
            pontosAtribuidos: Math.round(result?.total || 0)
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro ao calcular estatísticas' });
    }
}

module.exports = {
    listarUsuarios,
    listarResiduos,
    criarDescarte,
    listarDescartesPorUsuario,
    listarDescartesPorPontoColeta,
    obterEstatisticas
};
