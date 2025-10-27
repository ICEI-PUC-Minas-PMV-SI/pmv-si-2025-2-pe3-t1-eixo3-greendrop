module.exports.fullscreen = async (req, res) => {
  // trocar por busca real no DB
  const points = [
    { id: 5,   name:'Parque Municipal', address:'Av. Afonso Pena, 1377 - Centro, BH',
      lat:-19.9191, lng:-43.9386, materials:['papel','metal','plastico','isopor','vidro'],
      horario:'Seg–Sex 09:00–18:00; Sáb 09:00–13:00' },
    { id: 14,  name:'Savassi – GV x Inconfidentes', address:'Savassi, BH',
      lat:-19.9367, lng:-43.9332, materials:['vidro'],
      horario:'Diariamente 08:00–20:00' },
    { id: 31,  name:'URPV Pindorama', address:'Av. Amintas Jacques de Moraes, 2500 - BH',
      lat:-19.975, lng:-44.0125, materials:['papel','metal','plastico','isopor','vidro'],
      horario:'Seg–Sex 08:00–17:00' },
    { id: 49,  name:'UFMG – Portaria 6', address:'Av. Pres. Carlos Luz, BH',
      lat:-19.8702, lng:-43.9675, materials:['papel','metal','plastico','isopor','vidro'],
      horario:'Seg–Sex 07:00–19:00' },
    { id: 57,  name:'Zoológico (região)', address:'Av. Otacílio Negrão de Lima, 8000 - BH',
      lat:-19.8653, lng:-43.9712, materials:['papel','metal','plastico','isopor','vidro'],
      horario:'Qua–Dom 09:00–16:00' },
    { id: 101, name:'E-Mile – Sion', address:'Rua Montreal, 232 - BH',
      lat:-19.9528, lng:-43.9279, materials:['eletronicos','baterias'],
      horario:'Seg–Sex 10:00–18:00' },
    { id: 102, name:'E-Mile – Savassi', address:'Rua Fernandes Tourinho, 500 - BH',
      lat:-19.9369, lng:-43.9350, materials:['eletronicos','pilhas','baterias'],
      horario:'Seg–Sáb 10:00–19:00' },
    { id: 103, name:'E-Mile – Pampulha', address:'Av. Antônio Carlos, 8000 - BH',
      lat:-19.8641, lng:-43.9718, materials:['eletronicos','baterias','plastico'],
      horario:'Seg–Sex 09:00–17:30' },
    { id: 104, name:'E-Mile – Barreiro', address:'Av. Afonso Vaz de Melo, 640 - BH',
      lat:-19.9776, lng:-44.0102, materials:['eletronicos','baterias'],
      horario:'Seg–Sex 09:00–18:00' },
  ];

  
  res.render('mapa', { layout: false, points, MAPTILER_KEY: process.env.MAPTILER_KEY || '', });
};

module.exports.api = async (req, res) => {
  // trocar por DB
  const points = [
    { id: 5,   name:'Parque Municipal', address:'Av. Afonso Pena, 1377 - Centro, BH',
      lat:-19.9191, lng:-43.9386, materials:['papel','metal','plastico','isopor','vidro'],
      horario:'Seg–Sex 09:00–18:00; Sáb 09:00–13:00' },
    { id: 14,  name:'Savassi – GV x Inconfidentes', address:'Savassi, BH',
      lat:-19.9367, lng:-43.9332, materials:['vidro'],
      horario:'Diariamente 08:00–20:00' },
    { id: 31,  name:'URPV Pindorama', address:'Av. Amintas Jacques de Moraes, 2500 - BH',
      lat:-19.975, lng:-44.0125, materials:['papel','metal','plastico','isopor','vidro'],
      horario:'Seg–Sex 08:00–17:00' },
    { id: 49,  name:'UFMG – Portaria 6', address:'Av. Pres. Carlos Luz, BH',
      lat:-19.8702, lng:-43.9675, materials:['papel','metal','plastico','isopor','vidro'],
      horario:'Seg–Sex 07:00–19:00' },
    { id: 57,  name:'Zoológico (região)', address:'Av. Otacílio Negrão de Lima, 8000 - BH',
      lat:-19.8653, lng:-43.9712, materials:['papel','metal','plastico','isopor','vidro'],
      horario:'Qua–Dom 09:00–16:00' },
    { id: 101, name:'E-Mile – Sion', address:'Rua Montreal, 232 - BH',
      lat:-19.9528, lng:-43.9279, materials:['eletronicos','baterias'],
      horario:'Seg–Sex 10:00–18:00' },
    { id: 102, name:'E-Mile – Savassi', address:'Rua Fernandes Tourinho, 500 - BH',
      lat:-19.9369, lng:-43.9350, materials:['eletronicos','pilhas','baterias'],
      horario:'Seg–Sáb 10:00–19:00' },
    { id: 103, name:'E-Mile – Pampulha', address:'Av. Antônio Carlos, 8000 - BH',
      lat:-19.8641, lng:-43.9718, materials:['eletronicos','baterias','plastico'],
      horario:'Seg–Sex 09:00–17:30' },
    { id: 104, name:'E-Mile – Barreiro', address:'Av. Afonso Vaz de Melo, 640 - BH',
      lat:-19.9776, lng:-44.0102, materials:['eletronicos','baterias'],
      horario:'Seg–Sex 09:00–18:00' },
  ]; // [] se preferir injetar pela view
  res.json(points);
};
