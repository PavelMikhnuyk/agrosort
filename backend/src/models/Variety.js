const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Variety = sequelize.define('Variety', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  cultureId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'cultures', key: 'id' } },
  registrationNumber: { type: DataTypes.STRING(50), unique: true },
  yearRegistered: { type: DataTypes.INTEGER },
  yearExcluded: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.ENUM('active', 'excluded', 'pending'),
    defaultValue: 'active'
  },
  breeder: { type: DataTypes.STRING(300) },
  originCountry: { type: DataTypes.STRING(100), defaultValue: 'Россия' },
  // Агрономические характеристики
  yieldMin: { type: DataTypes.DECIMAL(6, 2) },
  yieldMax: { type: DataTypes.DECIMAL(6, 2) },
  yieldUnit: { type: DataTypes.STRING(20), defaultValue: 'т/га' },
  vegetationDays: { type: DataTypes.INTEGER },
  frostResistance: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  droughtResistance: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  diseaseResistance: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  // Допуски по регионам
  admittedRegions: { type: DataTypes.ARRAY(DataTypes.STRING) },
  // Описание
  description: { type: DataTypes.TEXT },
  characteristics: { type: DataTypes.JSONB },
  // Изображение
  image: { type: DataTypes.STRING(500) },
  // Метаданные
  addedBy: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'varieties',
  timestamps: true,
  indexes: [
    { fields: ['cultureId'] },
    { fields: ['status'] },
    { fields: ['yearRegistered'] },
    { fields: ['name'] }
  ]
});

module.exports = Variety;
