const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Residuo = sequelize.define('Residuo', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    icone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    corCategoria: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pontosPorKg: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0,
        comment: 'Pontos atribuídos por kg/unidade do resíduo',
    },
}, {
    timestamps: true,
});

module.exports = Residuo;
