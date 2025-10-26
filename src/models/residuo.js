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
}, {
    timestamps: true,
});

module.exports = Residuo;
