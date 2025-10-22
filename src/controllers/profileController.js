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
      earnings: (user.earnings || '1.875,40'),
      earningsDelta: (user.earningsDelta || '12.5%'),
      impactScore: (user.impactScore || '8.9'),
      transactions: { total: (user.txTotal || 238), pending: (user.txPending || 2) }
    },
    activities: [
      { icon:'💸', title:'Venda de Ativo XYZ', subtitle:'Finalizada em 21/10/2025 às 14:30', amount:'+R$ 450,00', amountClass:'positive' },
      { icon:'✅', title:'Conclusão de Desafio "Zero Plástico"', subtitle:'Recompensa de Engajamento | Ontem', amount:'+10 Impact Points', amountClass:'neutral' },
      { icon:'🏦', title:'Depósito de Fundo', subtitle:'Transferência bancária | 2 dias atrás', amount:'R$ 1.000,00', amountClass:'neutral' }
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
