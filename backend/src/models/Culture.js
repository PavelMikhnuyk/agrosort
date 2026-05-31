const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Culture = sequelize.define('Culture', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  nameScientific: { type: DataTypes.STRING(255) },
  category: {
    type: DataTypes.ENUM('grain', 'vegetable', 'oilseed', 'fruit', 'forage', 'decorative', 'technical', 'berry'),
    allowNull: false
  },
  description: { type: DataTypes.TEXT },
  icon: { type: DataTypes.STRING(10) }
}, {
  tableName: 'cultures',
  timestamps: true
});

module.exports = Culture;
