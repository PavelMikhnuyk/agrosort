const sequelize = require('../../config/database');
const User = require('./User');
const Culture = require('./Culture');
const Variety = require('./Variety');
const Favorite = require('./Favorite');
const VarietyHistory = require('./VarietyHistory');
const VarietyOffer = require('./VarietyOffer');

// Associations
Culture.hasMany(Variety, { foreignKey: 'cultureId', as: 'varieties' });
Variety.belongsTo(Culture, { foreignKey: 'cultureId', as: 'culture' });

User.hasMany(Variety, { foreignKey: 'addedBy', as: 'addedVarieties' });
Variety.belongsTo(User, { foreignKey: 'addedBy', as: 'author' });

User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

Variety.hasMany(Favorite, { foreignKey: 'varietyId', as: 'favorited' });
Favorite.belongsTo(Variety, { foreignKey: 'varietyId', as: 'variety' });

Variety.hasMany(VarietyHistory, { foreignKey: 'varietyId', as: 'history' });
VarietyHistory.belongsTo(Variety, { foreignKey: 'varietyId' });

User.hasMany(VarietyHistory, { foreignKey: 'changedBy', as: 'varietyChanges' });
VarietyHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'user' });

// VarietyOffer associations
Variety.hasMany(VarietyOffer, { foreignKey: 'varietyId', as: 'offers' });
VarietyOffer.belongsTo(Variety, { foreignKey: 'varietyId', as: 'variety' });

User.hasMany(VarietyOffer, { foreignKey: 'addedBy', as: 'addedOffers' });
VarietyOffer.belongsTo(User, { foreignKey: 'addedBy', as: 'offerAuthor' });

module.exports = { sequelize, User, Culture, Variety, Favorite, VarietyHistory, VarietyOffer };
