const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Favorite = sequelize.define('Favorite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  varietyId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'varieties', key: 'id' } },
  note: { type: DataTypes.TEXT }
}, {
  tableName: 'favorites',
  timestamps: true,
  indexes: [{ unique: true, fields: ['userId', 'varietyId'] }]
});

module.exports = Favorite;
