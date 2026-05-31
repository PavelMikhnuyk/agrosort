const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const VarietyOffer = sequelize.define('VarietyOffer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  varietyId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'varieties', key: 'id' } },
  shopName: { type: DataTypes.STRING(200), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  unit: {
    type: DataTypes.ENUM('kg', 'packet', 'seed_unit', 'piece'),
    allowNull: false,
    defaultValue: 'kg'
  },
  url: { type: DataTypes.STRING(500), allowNull: false, validate: { isUrl: true } },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  addedBy: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } }
}, {
  tableName: 'variety_offers',
  timestamps: true,
  indexes: [
    { fields: ['varietyId'] },
    { fields: ['isActive'] }
  ]
});

// Helper для получения отформатированной единицы измерения
VarietyOffer.prototype.getUnitLabel = function() {
  const labels = {
    kg: 'кг',
    packet: 'пакет',
    seed_unit: 'пос.ед',
    piece: 'шт'
  };
  return labels[this.unit] || this.unit;
};

module.exports = VarietyOffer;