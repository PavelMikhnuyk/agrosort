require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Culture, Variety } = require('../models');

const cultures = [
  { name: 'Пшеница', nameScientific: 'Triticum aestivum', category: 'grain', icon: '🌾', description: 'Основная зерновая культура Беларуси' },
  { name: 'Ячмень', nameScientific: 'Hordeum vulgare', category: 'grain', icon: '🌾', description: 'Ценная зернофуражная культура' },
  { name: 'Кукуруза', nameScientific: 'Zea mays', category: 'grain', icon: '🌽', description: 'Высокоурожайная зерновая культура' },
  { name: 'Подсолнечник', nameScientific: 'Helianthus annuus', category: 'oilseed', icon: '🌻', description: 'Главная масличная культура' },
  { name: 'Картофель', nameScientific: 'Solanum tuberosum', category: 'vegetable', icon: '🥔', description: 'Второй хлеб' },
  { name: 'Томат', nameScientific: 'Solanum lycopersicum', category: 'vegetable', icon: '🍅', description: 'Популярная овощная культура' },
  { name: 'Огурец', nameScientific: 'Cucumis sativus', category: 'vegetable', icon: '🥒', description: 'Основная тепличная культура' },
  { name: 'Яблоня', nameScientific: 'Malus domestica', category: 'fruit', icon: '🍎', description: 'Ведущая плодовая культура' },
  { name: 'Соя', nameScientific: 'Glycine max', category: 'oilseed', icon: '🌿', description: 'Белково-масличная культура' },
  { name: 'Рожь', nameScientific: 'Secale cereale', category: 'grain', icon: '🌾', description: 'Морозостойкая зерновая культура' },
  { name: 'Рапс', nameScientific: 'Brassica napus', category: 'oilseed', icon: '🌼', description: 'Масличная культура' },
  { name: 'Сахарная свёкла', nameScientific: 'Beta vulgaris', category: 'technical', icon: '🫚', description: 'Техническая культура' }
];

const varietyTemplates = [
  { name: 'Верас', breeder: 'РУП "Научно-практический центр НАН Беларуси по земледелию"', yieldMin: 4.5, yieldMax: 7.2, yearRegistered: 1998, vegetationDays: 95, frostResistance: 4, droughtResistance: 3, diseaseResistance: 4, admittedRegions: ['Минская', 'Гродненская'], status: 'active' },
  { name: 'Капылянка', breeder: 'БелНИИ зерновых культур', yieldMin: 3.8, yieldMax: 6.4, yearRegistered: 2003, vegetationDays: 88, frostResistance: 5, droughtResistance: 4, diseaseResistance: 3, admittedRegions: ['Брестская', 'Гомельская'], status: 'active' },
  { name: 'Буслиная', breeder: 'РУП "Научно-практический центр НАН Беларуси по земледелию"', yieldMin: 6.0, yieldMax: 9.5, yearRegistered: 1999, vegetationDays: 92, frostResistance: 3, droughtResistance: 3, diseaseResistance: 5, admittedRegions: ['Минская', 'Могилёвская'], status: 'active' },
  { name: 'Рана', breeder: 'БелНИИ картофелеводства', yieldMin: 28.0, yieldMax: 45.0, yearRegistered: 1982, vegetationDays: 75, frostResistance: 3, droughtResistance: 2, diseaseResistance: 3, admittedRegions: ['Минская', 'Гродненская'], status: 'active' },
  { name: 'Скарб', breeder: 'БелНИИ картофелеводства', yieldMin: 22.0, yieldMax: 38.0, yearRegistered: 1993, vegetationDays: 60, frostResistance: 3, droughtResistance: 3, diseaseResistance: 3, admittedRegions: ['Минская', 'Витебская'], status: 'active' },
  { name: 'Антей', breeder: 'РУП "Институт плодоводства"', yieldMin: 12.0, yieldMax: 22.0, yearRegistered: 1986, vegetationDays: 155, frostResistance: 4, droughtResistance: 3, diseaseResistance: 3, admittedRegions: ['Минская', 'Гродненская'], status: 'active' },
  { name: 'Белорусское сладкое', breeder: 'БелНИИ картофелеводства', yieldMin: 25.0, yieldMax: 40.0, yearRegistered: 2011, vegetationDays: 65, frostResistance: 4, droughtResistance: 3, diseaseResistance: 4, admittedRegions: ['Минская', 'Брестская'], status: 'active' },
  { name: 'Лилея', breeder: 'БелНИИ овощеводства', yieldMin: 15.0, yieldMax: 25.0, yearRegistered: 2015, vegetationDays: 110, frostResistance: 3, droughtResistance: 4, diseaseResistance: 4, admittedRegions: ['Минская', 'Гомельская'], status: 'active' },
  { name: 'Мастак', breeder: 'БелНИИ зерновых культур', yieldMin: 3.2, yieldMax: 5.8, yearRegistered: 2011, vegetationDays: 115, frostResistance: 2, droughtResistance: 5, diseaseResistance: 4, admittedRegions: ['Брестская'], status: 'excluded' },
  { name: 'Зорка', breeder: 'РУП "Научно-практический центр НАН Беларуси по земледелию"', yieldMin: 4.0, yieldMax: 6.5, yearRegistered: 2015, vegetationDays: 90, frostResistance: 3, droughtResistance: 4, diseaseResistance: 4, admittedRegions: ['Минская', 'Витебская'], status: 'active' },
  { name: 'Василёк', breeder: 'БелНИИ кукурузы', yieldMin: 3.5, yieldMax: 5.5, yearRegistered: 2008, vegetationDays: 85, frostResistance: 3, droughtResistance: 5, diseaseResistance: 3, admittedRegions: ['Гомельская', 'Брестская'], status: 'active' },
  { name: 'Явар', breeder: 'БелНИИ рапса', yieldMin: 2.8, yieldMax: 4.8, yearRegistered: 1996, vegetationDays: 78, frostResistance: 5, droughtResistance: 2, diseaseResistance: 4, admittedRegions: ['Минская'], status: 'active' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('📋 Таблицы пересозданы');

    // Admin user
    const hash = await bcrypt.hash('Admin123!', 12);
    const admin = await User.create({
      email: 'admin@agrosort.by', password: hash,
      name: 'Администратор', role: 'admin', organization: 'Минсельхозпрод Беларуси', isActive: true
    });

    // Agronomist
    const hash2 = await bcrypt.hash('Agro123!', 12);
    await User.create({
      email: 'agronomist@agrosort.by', password: hash2,
      name: 'Иванов Иван Иванович', role: 'agronomist',
      organization: 'СПК "Победа"', region: 'Минская', isActive: true
    });

    console.log('👤 Пользователи созданы');
    console.log('   admin@agrosort.by / Admin123!');
    console.log('   agronomist@agrosort.by / Agro123!');

    const createdCultures = await Culture.bulkCreate(cultures);
    console.log(`🌱 Создано культур: ${createdCultures.length}`);

    // Distribute varieties across cultures
    const varietiesData = [];
    const cultureIds = createdCultures.map(c => c.id);

    varietyTemplates.forEach((v, i) => {
      varietiesData.push({ ...v, cultureId: cultureIds[i % cultureIds.length], addedBy: admin.id, registrationNumber: `РСД-${String(10000 + i).padStart(5,'0')}`, originCountry: 'Беларусь' });
    });

    // Add more varieties
    for (let i = 0; i < 50; i++) {
      const tmpl = varietyTemplates[i % varietyTemplates.length];
      varietiesData.push({
        ...tmpl,
        name: `${tmpl.name} улучшенный ${i+1}`,
        cultureId: cultureIds[i % cultureIds.length],
        addedBy: admin.id,
        yearRegistered: 2000 + (i % 24),
        registrationNumber: `РСД-${String(20000 + i).padStart(5,'0')}`,
        originCountry: 'Беларусь',
        status: i % 8 === 0 ? 'excluded' : 'active'
      });
    }

    await Variety.bulkCreate(varietiesData);
    console.log(`🌾 Создано сортов: ${varietiesData.length}`);
    console.log('✅ Seeding завершён!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exit(1);
  }
}

seed();