module.exports.view = async (req, res) => {
  
  const user = req.user || (req.session && req.session.user) || {};

  const name = user.name || 'Usuário';
  const username = user.username || (user.email ? user.email.split('@')[0] : 'user');
  const initials = (name.match(/\b\w/g) || []).slice(0,2).join('').toUpperCase() || 'US';

  
  return res.render('perfil', {
    layout: 'main', 
    avatarInitials: initials,
    user: {
      name,
      username,
      verified: !!user.verified,
      avatarUrl: user.avatarUrl || '',
      biome: user.biome || 'Mata Atlântica',
      location: user.location || 'Minas Gerais, Brasil',
      level: { number: user.levelNumber || 5, title: user.levelTitle || 'Ecologista', percent: user.levelPercent || 85 }
    },
    metrics: {
      earnings: (user.earnings || '199.875'),
      earningsDelta: (user.earningsDelta || '12.5%'),
      impactScore: (user.impactScore || '375.233'),
      transactions: { total: (user.txTotal || 10), pending: (user.txPending || 1) }
    },
    activities: [
      { icon:'💸', title:'Compra de Créditos de Carbono (45 unidades) ', subtitle:'Finalizada em 21/10/2025 às 14:30', amount:'- 405.000', amountClass:'negative' },
      { icon:'✅', title:'Recebimento de Pontos do Ponto de Coleta XYZ"', subtitle:'Finalizada em 20/09/2025 às 14:30', amount:'+50.000', amountClass:'positive' },
      { icon:'🏦', title:'Auditoria Ambiental Especializada', subtitle:'Finalizada em 11/06/2025 às 14:30', amount:'-500.000', amountClass:'negative' }
    ],
    badges: [
      { emoji:'🏅', title:'Investidor Sênior', description:'Acima de R$ 1.000 investidos.' },
      { emoji:'🌳', title:'Pioneiro Verde', description:'Primeiro investimento no bioma.' },
      { emoji:'🔒', title:'Zero Waste', description:'Conclua 5 desafios de resíduos.', locked:true },
      { emoji:'🤝', title:'Conexão Forte', description:'5+ conexões ativas.' }
    ],
    badgesNext: { title:'Embaixador do Bioma', hint:'Compartilhe 3 projetos' }
  });
};
