const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');
const User = require('./user');
const PontoColeta = require('./pontoColeta');

const Avaliacao = sequelize.define('Avaliacao', {
    nota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
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
}, {
    timestamps: true,
});

Avaliacao.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Avaliacao.belongsTo(PontoColeta, { foreignKey: 'pontoColetaId', as: 'pontoColeta' });

PontoColeta.hasMany(Avaliacao, { foreignKey: 'pontoColetaId', as: 'avaliacoes' });
User.hasMany(Avaliacao, { foreignKey: 'userId', as: 'avaliacoes' });

module.exports = Avaliacao;
