require('dotenv').config();
const { prisma, connectMongo, disconnectAll } = require('./config/db');
const MenuItem = require('./models/MenuItem');
const Category = require('./models/Category');
const Review = require('./models/Review');
const Event = require('./models/Event');

async function seed() {
  await connectMongo();

  // Halls (PostgreSQL)
  const halls = [
    { id: 1, name: 'Main Hall', nameHy: 'Հիմնական Դահլիճ', capacity: 80, description: 'Our largest hall with live music stage' },
    { id: 2, name: 'Garden Terrace', nameHy: 'Այգու Տերաս', capacity: 40, description: 'Open air terrace with garden view' },
    { id: 3, name: 'Private Room', nameHy: 'Անձնական Սրահ', capacity: 20, description: 'Intimate private dining room' },
  ];

  for (const hall of halls) {
    await prisma.hall.upsert({ where: { id: hall.id }, create: hall, update: hall });
  }

  // Admin user
  const bcrypt = require('bcryptjs');
  const adminPassword = await bcrypt.hash('Admin@Kamancha2024', 12);
  await prisma.adminUser.upsert({
    where: { email: 'admin@kamancha.am' },
    create: { email: 'admin@kamancha.am', name: 'Admin', password: adminPassword },
    update: {},
  });

  // Categories (MongoDB)
  const categories = [
    { slug: 'appetizers', name: { hy: 'Նախուտեստներ', en: 'Appetizers', ru: 'Закуски', fr: 'Entrées', de: 'Vorspeisen', it: 'Antipasti', es: 'Aperitivos', zh: '开胃菜', hi: 'स्टार्टर', ar: 'مقبلات' }, icon: '🥗', sort_order: 1 },
    { slug: 'soups', name: { hy: 'Ապուրներ', en: 'Soups', ru: 'Супы', fr: 'Soupes', de: 'Suppen', it: 'Zuppe', es: 'Sopas', zh: '汤', hi: 'सूप', ar: 'حساء' }, icon: '🍲', sort_order: 2 },
    { slug: 'mains', name: { hy: 'Հիմնական Ուտեստներ', en: 'Main Courses', ru: 'Основные блюда', fr: 'Plats principaux', de: 'Hauptgerichte', it: 'Secondi', es: 'Platos principales', zh: '主菜', hi: 'मुख्य व्यंजन', ar: 'الأطباق الرئيسية' }, icon: '🍖', sort_order: 3 },
    { slug: 'grill', name: { hy: 'Գրիլ', en: 'Grill', ru: 'Гриль', fr: 'Grillades', de: 'Grill', it: 'Grigliata', es: 'Parrilla', zh: '烧烤', hi: 'ग्रिल', ar: 'مشويات' }, icon: '🥩', sort_order: 4 },
    { slug: 'salads', name: { hy: 'Աղցաններ', en: 'Salads', ru: 'Салаты', fr: 'Salades', de: 'Salate', it: 'Insalate', es: 'Ensaladas', zh: '沙拉', hi: 'सलाद', ar: 'سلطات' }, icon: '🥬', sort_order: 5 },
    { slug: 'desserts', name: { hy: 'Քաղցրավենիք', en: 'Desserts', ru: 'Десерты', fr: 'Desserts', de: 'Nachspeisen', it: 'Dolci', es: 'Postres', zh: '甜点', hi: 'मिठाई', ar: 'حلويات' }, icon: '🍰', sort_order: 6 },
    { slug: 'drinks', name: { hy: 'Ըմպելիքներ', en: 'Drinks', ru: 'Напитки', fr: 'Boissons', de: 'Getränke', it: 'Bevande', es: 'Bebidas', zh: '饮料', hi: 'पेय', ar: 'مشروبات' }, icon: '🍷', sort_order: 7 },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
  }

  // Menu items (MongoDB)
  await MenuItem.deleteMany({});
  const menuItems = [
    {
      name: { hy: 'Բաստուրմա', en: 'Basturma', ru: 'Бастурма', fr: 'Basturma', de: 'Basturma', it: 'Basturma', es: 'Basturma', zh: '巴斯图尔马', hi: 'बस्तुर्मा', ar: 'باسطرمة' },
      description: { hy: 'Հայկական ավանդական ապխտած միս հատուկ համեմունքներով', en: 'Traditional Armenian cured meat with special spices', ru: 'Традиционное армянское вяленое мясо со специями', fr: 'Viande séchée arménienne traditionnelle aux épices', de: 'Traditionelles armenisches Trockenfleisch mit Gewürzen', it: 'Carne essiccata armena tradizionale con spezie', es: 'Carne curada armenia tradicional con especias', zh: '传统亚美尼亚风干肉配特色香料', hi: 'विशेष मसालों के साथ पारंपरिक आर्मेनियाई सूखा मांस', ar: 'لحم مجفف أرميني تقليدي مع البهارات الخاصة' },
      price: 3500, category: 'appetizers', is_popular: true, sort_order: 1,
    },
    {
      name: { hy: 'Դոլմա', en: 'Dolma', ru: 'Долма', fr: 'Dolma', de: 'Dolma', it: 'Dolma', es: 'Dolma', zh: '多尔马', hi: 'डोल्मा', ar: 'دولمة' },
      description: { hy: 'Խաղողի թերթիկներով փաթաթած կծու բրինձ', en: 'Stuffed grape leaves with spiced rice and meat', ru: 'Виноградные листья, фаршированные пряным рисом', fr: 'Feuilles de vigne farcies au riz épicé', de: 'Gefüllte Weinblätter mit Gewürzreis', it: 'Foglie di vite ripiene di riso speziato', es: 'Hojas de vid rellenas de arroz especiado', zh: '香料米饭酿葡萄叶', hi: 'मसालेदार चावल भरे अंगूर के पत्ते', ar: 'أوراق عنب محشوة بالأرز والتوابل' },
      price: 4200, category: 'appetizers', is_popular: true, sort_order: 2,
    },
    {
      name: { hy: 'Հայկական Բորշ', en: 'Armenian Borsch', ru: 'Армянский борщ', fr: 'Borsch arménien', de: 'Armenische Borschtsch', it: 'Borsch armeno', es: 'Borsch armenio', zh: '亚美尼亚红菜汤', hi: 'आर्मेनियाई बोर्श', ar: 'بورشت أرمني' },
      description: { hy: 'Ճակնդեղով, կաղամբով և թթু կռեմ ապուր', en: 'Rich beetroot soup with cabbage and sour cream', ru: 'Насыщенный борщ со свёклой, капустой и сметаной', fr: 'Soupe riche à la betterave avec chou et crème fraîche', de: 'Reiche Rote-Bete-Suppe mit Kohl und Sauerrahm', it: 'Ricca zuppa di barbabietola con cavolo e panna acida', es: 'Rica sopa de remolacha con col y crema agria', zh: '浓郁甜菜汤配卷心菜和酸奶油', hi: 'पत्तागोभी और खट्टी क्रीम के साथ चुकंदर सूप', ar: 'حساء الشمندر الغني مع الملفوف والقشدة الحامضة' },
      price: 2800, category: 'soups', sort_order: 1,
    },
    {
      name: { hy: 'Սպաս', en: 'Spas', ru: 'Спас', fr: 'Spas', de: 'Spas', it: 'Spas', es: 'Spas', zh: '斯帕斯汤', hi: 'स्पास', ar: 'سباس' },
      description: { hy: 'Ձվի, դդմի, թթւ-բուխ ապուր', en: 'Traditional Armenian yogurt soup with wheat and herbs', ru: 'Традиционный армянский суп с мацони и пшеницей', fr: 'Soupe arménienne traditionnelle au yaourt et blé', de: 'Traditionelle armenische Joghurtsuppe mit Weizen', it: 'Tradizionale zuppa armena di yogurt con grano', es: 'Sopa armenia tradicional de yogur con trigo', zh: '传统亚美尼亚酸奶麦汤', hi: 'गेहूं के साथ पारंपरिक आर्मेनियाई दही सूप', ar: 'شوربة اللبن الأرمنية التقليدية مع القمح' },
      price: 2500, category: 'soups', is_popular: true, sort_order: 2,
    },
    {
      name: { hy: 'Խոռովածxt', en: 'Khorovats', ru: 'Хоровац', fr: 'Khorovats', de: 'Khorovats', it: 'Khorovats', es: 'Khorovats', zh: '霍罗瓦茨烤肉', hi: 'खोरोवाट्स', ar: 'خوروفاتس' },
      description: { hy: 'Ավանդական հայկական բարբեկյու, հատուկ մամինադայի ու բանջարեղեններով', en: 'Traditional Armenian BBQ with special marinade and vegetables', ru: 'Традиционный армянский шашлык с особым маринадом', fr: 'BBQ arménien traditionnel avec marinade spéciale', de: 'Traditionelles armenisches BBQ mit Spezialmarinaden', it: 'BBQ armeno tradizionale con marinatura speciale', es: 'BBQ armenio tradicional con marinada especial', zh: '传统亚美尼亚烤肉配特制腌料', hi: 'विशेष मैरिनेड के साथ पारंपरिक आर्मेनियाई बीबीक्यू', ar: 'شواء أرميني تقليدي مع تتبيلة خاصة' },
      price: 6800, category: 'grill', is_popular: true, sort_order: 1,
    },
    {
      name: { hy: 'Լյուղա Քյաբաբ', en: 'Lula Kebab', ru: 'Люля-кебаб', fr: 'Lula Kebab', de: 'Lula Kebab', it: 'Lula Kebab', es: 'Lula Kebab', zh: '吕拉烤肉串', hi: 'लुला कबाब', ar: 'لولا كباب' },
      description: { hy: 'Ձեռքով աղացած մսից, բլտի ու բանջարեղնի հետ', en: 'Minced meat skewers with onion and herbs', ru: 'Шашлык из рубленого мяса с луком и зеленью', fr: 'Brochettes de viande hachée avec oignon et herbes', de: 'Hackfleischspieße mit Zwiebel und Kräutern', it: 'Spiedini di carne macinata con cipolla ed erbe', es: 'Pinchos de carne picada con cebolla y hierbas', zh: '洋葱香草碎肉串', hi: 'प्याज और जड़ी-बूटी के साथ कीमा मांस की सीख', ar: 'شيش الكباب المفروم مع البصل والأعشاب' },
      price: 5500, category: 'grill', sort_order: 2,
    },
    {
      name: { hy: 'Ֆռռ-ֆռռ Հավ', en: 'Grilled Chicken', ru: 'Курица на гриле', fr: 'Poulet grillé', de: 'Gegrilltes Hähnchen', it: 'Pollo alla griglia', es: 'Pollo a la parrilla', zh: '烤鸡', hi: 'ग्रिल्ड चिकन', ar: 'دجاج مشوي' },
      description: { hy: 'Բուրաված հյութ-հավ, թթւ-տավ-թթ ու բանջ', en: 'Marinated whole chicken with herbs and lemon', ru: 'Маринованная курица с травами и лимоном', fr: 'Poulet entier mariné aux herbes et citron', de: 'Mariniertes Hähnchen mit Kräutern und Zitrone', it: 'Pollo intero marinato con erbe e limone', es: 'Pollo entero marinado con hierbas y limón', zh: '腌制全鸡配香草和柠檬', hi: 'जड़ी-बूटी और नींबू के साथ मैरिनेटेड पूरा मुर्गा', ar: 'دجاج كامل متبل بالأعشاب والليمون' },
      price: 7200, category: 'mains', is_popular: true, sort_order: 1,
    },
    {
      name: { hy: 'Պառ-կ Կռ-ողն', en: 'Stuffed Eggplant', ru: 'Фаршированный баклажан', fr: 'Aubergine farcie', de: 'Gefüllte Aubergine', it: 'Melanzana ripiena', es: 'Berenjena rellena', zh: '酿茄子', hi: 'भरवां बैंगन', ar: 'باذنجان محشو' },
      description: { hy: 'Գառ-ու-ձ-ե-ն ք-ո-ռ-ն-ո-ք-ի ու կ-ա-ն-ա-չ-ե-ղ-ե-ն-ի հ-ե-տ', en: 'Eggplant stuffed with lamb, tomatoes and herbs', ru: 'Баклажан, фаршированный ягнятиной и помидорами', fr: 'Aubergine farcie à l\'agneau et tomates', de: 'Aubergine gefüllt mit Lamm und Tomaten', it: 'Melanzana ripiena di agnello e pomodori', es: 'Berenjena rellena de cordero y tomates', zh: '羊肉番茄酿茄子', hi: 'मेमने और टमाटर से भरा बैंगन', ar: 'باذنجان محشو بالضأن والطماطم' },
      price: 5800, category: 'mains', sort_order: 2,
    },
    {
      name: { hy: 'Հայկական Ոսկեթ Թ-բ-ձ-ն', en: 'Armenian Honey Cake', ru: 'Армянский медовый торт', fr: 'Gâteau au miel arménien', de: 'Armenischer Honigkuchen', it: 'Torta al miele armena', es: 'Pastel de miel armenio', zh: '亚美尼亚蜂蜜蛋糕', hi: 'आर्मेनियाई शहद केक', ar: 'كعكة العسل الأرمنية' },
      description: { hy: 'Ավ-ան-դ-ա-կ-ան բ-ա-ց-վ-ա-ծ-ք ` ն-ո-ւ-շ-ո-վ ու մ-ե-ղ-ռ-ո-վ', en: 'Traditional layered cake with walnuts and honey', ru: 'Традиционный слоёный торт с грецкими орехами и мёдом', fr: 'Gâteau feuilleté traditionnel aux noix et au miel', de: 'Traditioneller Schichtkuchen mit Walnüssen und Honig', it: 'Torta tradizionale a strati con noci e miele', es: 'Pastel tradicional en capas con nueces y miel', zh: '传统核桃蜂蜜层次蛋糕', hi: 'अखरोट और शहद के साथ पारंपरिक परतदार केक', ar: 'كعكة طبقات تقليدية مع الجوز والعسل' },
      price: 2200, category: 'desserts', is_popular: true, sort_order: 1,
    },
    {
      name: { hy: 'Ար-ա-ր-ատ Կ-ո-ն-յ-ա-կ', en: 'Ararat Cognac', ru: 'Коньяк Арарат', fr: 'Cognac Ararat', de: 'Ararat Cognac', it: 'Cognac Ararat', es: 'Coñac Ararat', zh: '阿拉拉特白兰地', hi: 'अरारात कॉन्यैक', ar: 'أرارات كونياك' },
      description: { hy: 'Հ-ա-յ-կ-ա-կ-ա-ն 5 ն-շ-ա-ն-ա-կ-ի կ-ո-ն-յ-ա-կ', en: 'Armenian 5-star aged cognac, 50ml', ru: 'Армянский выдержанный коньяк 5 звёзд, 50мл', fr: 'Cognac arménien vieilli 5 étoiles, 50ml', de: 'Armenischer gereifter 5-Sterne-Cognac, 50ml', it: 'Cognac armeno invecchiato 5 stelle, 50ml', es: 'Coñac armenio envejecido 5 estrellas, 50ml', zh: '亚美尼亚五星陈年白兰地，50ml', hi: 'आर्मेनियाई 5-स्टार पुराना कॉन्यैक, 50मल', ar: 'كونياك أرميني ناضج 5 نجوم، 50 مل' },
      price: 3800, category: 'drinks', is_popular: true, sort_order: 1,
    },
  ];

  for (const item of menuItems) {
    await MenuItem.create(item);
  }

  // Reviews
  await Review.deleteMany({});
  await Review.insertMany([
    { author: 'John S.', rating: 5, text: 'Absolutely amazing food! The Khorovats was the best I\'ve ever had.', lang: 'en', source: 'tripadvisor', date: new Date('2024-11-15') },
    { author: 'Мария К.', rating: 5, text: 'Отличный ресторан! Долма просто тает во рту. Обязательно вернёмся!', lang: 'ru', source: 'google', date: new Date('2024-12-01') },
    { author: 'Արmine Հ.', rating: 5, text: 'Հայկական ավանդական ուտեստներ, հիանալի մթնոլ-ort. Ննջ-ո-ղ-ա-կ-ա-ն ծ-ա-ռ-ա-ն-ա-ն!', lang: 'hy', source: 'internal', date: new Date('2024-12-10') },
    { author: 'Pierre D.', rating: 4, text: 'Excellente cuisine arménienne, cadre magnifique. Le service était impeccable.', lang: 'fr', source: 'tripadvisor', date: new Date('2024-10-20') },
    { author: 'Sophie W.', rating: 5, text: 'Das beste armenische Restaurant in Eriwan! Die Atmosphäre ist wunderschön.', lang: 'de', source: 'google', date: new Date('2024-11-05') },
  ]);

  // Events
  await Event.deleteMany({});
  const now = new Date();
  await Event.insertMany([
    { title: { hy: 'Ջ-ա-զ-ա-յ-ի-ն Ե-ր-ե-կ-ո', en: 'Jazz Evening', ru: 'Джазовый вечер' }, description: { hy: ' Կ-ե-ն-դ-ա-ն-ի Ջ-ա-զ Ե-ր-ա-ժ-շ-տ-ո-ւ-թ-յ-ո-ւ-ն', en: 'Live jazz performance by local musicians', ru: 'Живая джазовая музыка от местных музыкантов' }, date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), time: '20:00', type: 'music' },
    { title: { hy: 'Ա-ն-ո-ւ-շ Ե-ր-ե-կ-ո', en: 'Wine Tasting Evening', ru: 'Вечер дегустации вин' }, description: { hy: 'Հ-ա-յ-կ-ա-կ-ա-ն Ն-ե-ր-ք-ի-ն Ե-ր-ե-կ-ո', en: 'Armenian wine tasting with sommelier', ru: 'Дегустация армянских вин с сомелье' }, date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), time: '19:00', type: 'special' },
    { title: { hy: 'Ֆ-ո-լ-կ-լ-ո-ր-ա-յ-ի-ն Ե-ր-ե-կ-ո', en: 'Folk Music Night', ru: 'Вечер народной музыки' }, description: { hy: 'Հ-ա-յ-կ-ա-կ-ա-ն Ա-վ-ա-ն-դ-ա-կ-ա-ն Ե-ր-ա-ժ-շ-տ-ո-ւ-թ-յ-ո-ւ-ն', en: 'Traditional Armenian folk music and dance', ru: 'Традиционная армянская народная музыка и танцы' }, date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), time: '20:30', type: 'music' },
  ]);

  console.log('Seed completed successfully');
  await disconnectAll();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
