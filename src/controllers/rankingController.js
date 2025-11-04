const Ranking = require('../models/ranking');

// Diretrizes de reciclagem
const diretrizes = [
    { material: 'Garrafa PET', pontos: 1, unidade: 'unidade', descricao: 'Garrafas plásticas transparentes' },
    { material: 'Alumínio', pontos: 5, unidade: 'kg', descricao: 'Latas de alumínio, embalagens' },
    { material: 'Papel/Papelão', pontos: 2, unidade: 'kg', descricao: 'Papel limpo e seco, caixas de papelão' },
    { material: 'Vidro', pontos: 3, unidade: 'kg', descricao: 'Garrafas e potes de vidro' },
    { material: 'Plástico Rígido', pontos: 2, unidade: 'kg', descricao: 'Embalagens plásticas rígidas' },
    { material: 'Metal Ferroso', pontos: 4, unidade: 'kg', descricao: 'Latas de aço, tampas metálicas' },
    { material: 'Eletrônicos', pontos: 10, unidade: 'kg', descricao: 'Aparelhos eletrônicos, componentes' },
    { material: 'Óleo de Cozinha', pontos: 8, unidade: 'litro', descricao: 'Óleo vegetal usado' },
    { material: 'Pilhas e Baterias', pontos: 15, unidade: 'kg', descricao: 'Pilhas alcalinas, baterias recarregáveis' },
    { material: 'Lâmpadas Fluorescentes', pontos: 12, unidade: 'unidade', descricao: 'Lâmpadas fluorescentes e LED' }
];

// Prêmios disponíveis
const premios = [
    {
        id: 1,
        nome: 'Auditoria Ambiental Especializada',
        descricao: 'Consultoria completa sobre práticas sustentáveis na empresa',
        pontosNecessarios: 500000,
        icone: 'clipboard'
    },
    {
        id: 2,
        nome: 'Relatório de Impacto Ambiental',
        descricao: 'Análise detalhada do impacto ambiental de novos projetos',
        pontosNecessarios: 100000,
        icone: 'file-text'
    },
    {
        id: 3,
        nome: 'Certificado de Empresa Sustentável',
        descricao: 'Certificação oficial de práticas sustentáveis',
        pontosNecessarios: 50000,
        icone: 'award'
    },
    {
        id: 4,
        nome: 'Workshop de Sustentabilidade',
        descricao: 'Treinamento para equipe sobre práticas sustentáveis',
        pontosNecessarios: 15000,
        icone: 'users'
    },
    {
        id: 5,
        nome: 'Plano de Gestão de Resíduos',
        descricao: 'Desenvolvimento de plano personalizado de gestão de resíduos',
        pontosNecessarios: 15000,
        icone: 'trending-up'
    },
    {
        id: 6,
        nome: '1 crédito de carbono (aproximadamente US 15.00)',
        descricao: 'Selo de reconhecimento para uso em marketing e comunicação',
        pontosNecessarios: 9000,
        icone: 'check-circle'
    }
];

// Empresas fictícias para o ranking
const empresasFicticias = [
    { empresa: 'EcoTech Soluções Ltda', pontos: 2450, materiaisReciclados: 1850.5 },
    { empresa: 'GreenIndustry Brasil', pontos: 2380, materiaisReciclados: 1790.2 },
    { empresa: 'Sustenta Corp', pontos: 2210, materiaisReciclados: 1650.8 },
    { empresa: 'ReciclaMax Indústria', pontos: 2150, materiaisReciclados: 1580.3 },
    { empresa: 'Planeta Verde S.A.', pontos: 2080, materiaisReciclados: 1520.7 },
    { empresa: 'EcoSmart Tecnologia', pontos: 1950, materiaisReciclados: 1450.2 },
    { empresa: 'Natureza Viva Ltda', pontos: 1890, materiaisReciclados: 1390.5 },
    { empresa: 'Reciclagem Moderna', pontos: 1820, materiaisReciclados: 1320.8 },
    { empresa: 'Verde Futuro Ind.', pontos: 1750, materiaisReciclados: 1280.3 },
    { empresa: 'EcoLife Solutions', pontos: 1680, materiaisReciclados: 1210.7 },
    { empresa: 'Sustentável Brasil', pontos: 1620, materiaisReciclados: 1150.2 },
    { empresa: 'GreenWay Indústria', pontos: 1550, materiaisReciclados: 1090.5 },
    { empresa: 'Recicla+ Soluções', pontos: 1480, materiaisReciclados: 1030.8 },
    { empresa: 'EcoMundo Ltda', pontos: 1410, materiaisReciclados: 980.3 },
    { empresa: 'Planeta Limpo S.A.', pontos: 1350, materiaisReciclados: 920.7 },
    { empresa: 'Verde Ação Corp', pontos: 1280, materiaisReciclados: 870.2 },
    { empresa: 'EcoSystem Brasil', pontos: 1210, materiaisReciclados: 810.5 },
    { empresa: 'Natureza First', pontos: 1150, materiaisReciclados: 760.8 },
    { empresa: 'Recicla Bem Ltda', pontos: 1080, materiaisReciclados: 710.3 },
    { empresa: 'GreenPlanet Ind.', pontos: 1020, materiaisReciclados: 650.7 },
    { empresa: 'EcoVida Solutions', pontos: 950, materiaisReciclados: 600.2 },
    { empresa: 'Sustenta+ Brasil', pontos: 890, materiaisReciclados: 550.5 },
    { empresa: 'Verde Total S.A.', pontos: 820, materiaisReciclados: 500.8 },
    { empresa: 'EcoForce Ltda', pontos: 760, materiaisReciclados: 450.3 },
    { empresa: 'Planeta Verde+', pontos: 700, materiaisReciclados: 400.7 }
];

exports.renderRankingPage = (req, res) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    res.render('ranking', {
        diretrizes,
        premios,
        empresas: empresasFicticias,
        currentMonth,
        currentYear
    });
};

exports.getDiretrizes = (req, res) => {
    res.json(diretrizes);
};

exports.getRanking = (req, res) => {
    const { periodo } = req.query;
    res.json(empresasFicticias);
};

exports.getPremios = (req, res) => {
    res.json(premios);
};