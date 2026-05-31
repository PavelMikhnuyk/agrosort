const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'agronomist', 'viewer'), defaultValue: 'viewer' },
  organization: { type: DataTypes.STRING(255) },
  region: { type: DataTypes.STRING(150) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
