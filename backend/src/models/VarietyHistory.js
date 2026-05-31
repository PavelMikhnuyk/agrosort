const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const VarietyHistory = sequelize.define('VarietyHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  varietyId: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.ENUM('create', 'update', 'delete'), allowNull: false },
  changedBy: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  changes: { type: DataTypes.JSONB },
  previousData: { type: DataTypes.JSONB }
}, {
  tableName: 'variety_history',
  timestamps: true
});

module.exports = VarietyHistory;