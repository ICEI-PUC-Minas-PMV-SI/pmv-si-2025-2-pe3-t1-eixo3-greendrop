const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');
const User = require('./user');
const PontoColeta = require('./pontoColeta');
const Residuo = require('./residuo');

const Descarte = sequelize.define('Descarte', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    pontoColetaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: PontoColeta,
            key: 'id',
        },
    },
    residuoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Residuo,
            key: 'id',
        },
    },
    quantidade: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Quantidade em kg ou unidades',
    },
    unidade: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'kg',
        comment: 'Unidade de medida: kg, unid, L, etc',
    },
    pontosAtribuidos: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Pontos calculados e atribuídos ao usuário',
    },
    status: {
        type: DataTypes.ENUM('pendente', 'aprovado', 'negado'),
        allowNull: false,
        defaultValue: 'aprovado',
    },
}, {
    timestamps: true,
});

// Associações
Descarte.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });
Descarte.belongsTo(PontoColeta, { foreignKey: 'pontoColetaId', as: 'pontoColeta' });
Descarte.belongsTo(Residuo, { foreignKey: 'residuoId', as: 'residuo' });

User.hasMany(Descarte, { foreignKey: 'userId', as: 'descartes' });
PontoColeta.hasMany(Descarte, { foreignKey: 'pontoColetaId', as: 'descartes' });
Residuo.hasMany(Descarte, { foreignKey: 'residuoId', as: 'descartes' });

module.exports = Descarte;
