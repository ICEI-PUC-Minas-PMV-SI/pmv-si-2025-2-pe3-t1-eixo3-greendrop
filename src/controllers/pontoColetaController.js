const PontoColeta = require('../models/pontoColeta');
const Descarte = require('../models/descarte');
const User = require('../models/user');
const Residuo = require('../models/residuo');

async function renderAdminPage(req, res) {
    try {
        const adminUser = req.user;
        let historico = [];

        const pontoColeta = await PontoColeta.findOne({
            where: { adminId: adminUser.id }
        });

        if (pontoColeta) {
            historico = await Descarte.findAll({
                where: { pontoColetaId: pontoColeta.id },
                include: [
                    {
                        model: User,
                        as: 'usuario',
                        attributes: ['name', 'email']
                    },
                    {
                        model: Residuo,
                        as: 'residuo',
                        attributes: ['nome', 'categoria', 'icone']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 50
            });
        }

        const historicoFormatado = historico.map(d => ({
            usuario: d.usuario.name,
            material: d.residuo.nome,
            quantidade: d.quantidade,
            unidade: d.unidade,
            pontos: d.pontosAtribuidos,
            data: d.createdAt.toLocaleDateString('pt-BR'),
            hora: d.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: d.status,
            statusClass: d.status === 'aprovado' ? 'text-green-600' : d.status === 'negado' ? 'text-red-600' : 'text-yellow-500',
            statusTexto: d.status === 'aprovado' ? 'Aprovado' : d.status === 'negado' ? 'Negado' : 'Pendente'
        }));

        res.render('admin/index', { historico: historicoFormatado });
    } catch (error) {
        console.error('Erro ao carregar painel admin:', error);
        res.render('admin/index', { historico: [], error: 'Erro ao carregar histórico' });
    }
}

module.exports = {
    renderAdminPage
};
