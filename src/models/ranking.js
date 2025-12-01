const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Ranking = sequelize.define('Ranking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    empresa: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pontos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    materiaisReciclados: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Quantidade em kg'
    },
    mes: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ano: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'rankings',
    timestamps: true
});

module.exports = Ranking;
