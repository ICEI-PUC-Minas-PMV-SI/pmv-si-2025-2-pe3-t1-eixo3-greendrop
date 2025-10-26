const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');
const User = require('./user');
const Residuo = require('./residuo');

const PontoColeta = sequelize.define('PontoColeta', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cep: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    endereco: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    horarioFuncionamento: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
}, {
    timestamps: true,
});

PontoColeta.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

PontoColeta.belongsToMany(Residuo, {
    through: 'PontoResiduos',
    as: 'residuos',
    foreignKey: 'pontoColetaId',
});

Residuo.belongsToMany(PontoColeta, {
    through: 'PontoResiduos',
    as: 'pontos',
    foreignKey: 'residuoId',
});

module.exports = PontoColeta;
