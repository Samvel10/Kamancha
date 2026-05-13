require('dotenv').config();
const { prisma, connectMongo, disconnectAll } = require('./config/db');
const MenuItem = require('./models/MenuItem');
const Category = require('./models/Category');
const Review = require('./models/Review');
const Event = require('./models/Event');
const GalleryItem = require('./models/GalleryItem');

const BASE_IMG = 'https://kamancharest.com/images/';

async function seed() {
  await connectMongo();

  // ── PostgreSQL: Halls ──────────────────────────────────────────────────────
  const halls = [
    { id: 1, name: 'Main Hall',      nameHy: 'Հիմնական Դահլիճ',  capacity: 80, description: 'Our largest hall with live music stage' },
    { id: 2, name: 'Garden Terrace', nameHy: 'Այգու Տերաս',       capacity: 40, description: 'Open air terrace with garden view' },
    { id: 3, name: 'Private Room',   nameHy: 'Անձնական Սրահ',     capacity: 20, description: 'Intimate private dining room' },
  ];
  for (const hall of halls) {
    await prisma.hall.upsert({ where: { id: hall.id }, create: hall, update: hall });
  }

  // ── PostgreSQL: Admin user ─────────────────────────────────────────────────
  const bcrypt = require('bcryptjs');
  const adminPassword = await bcrypt.hash('Admin@Kamancha2024', 12);
  await prisma.adminUser.upsert({
    where: { email: 'admin@kamancha.am' },
    create: { email: 'admin@kamancha.am', name: 'Admin', password: adminPassword },
    update: {},
  });

  // ── MongoDB: Categories ────────────────────────────────────────────────────
  const categories = [
    { slug: 'breakfast',         name: { hy: 'Նախաճաշ',             en: 'Breakfast',         ru: 'Завтрак'              }, icon: '🍳', sort_order: 1  },
    { slug: 'cold-appetizers',   name: { hy: 'Սառը Նախուտեստ',      en: 'Cold Appetizers',   ru: 'Холодные закуски'    }, icon: '🧀', sort_order: 2  },
    { slug: 'hot-appetizers',    name: { hy: 'Տաք Նախուտեստ',       en: 'Hot Appetizers',    ru: 'Горячие закуски'     }, icon: '🫕', sort_order: 3  },
    { slug: 'salads',            name: { hy: 'Աղցաններ',             en: 'Salads',            ru: 'Салаты'              }, icon: '🥗', sort_order: 4  },
    { slug: 'soups',             name: { hy: 'Ապուրներ',             en: 'Soups',             ru: 'Супы'                }, icon: '🍲', sort_order: 5  },
    { slug: 'mains',             name: { hy: 'Հիմնական Ուտեստ',     en: 'Main Dishes',       ru: 'Основные блюда'      }, icon: '🍖', sort_order: 6  },
    { slug: 'pide',              name: { hy: 'Փիդե',                 en: 'Pide & Bread',      ru: 'Пиде и хлеб'         }, icon: '🫓', sort_order: 7  },
    { slug: 'bbq',               name: { hy: 'Խոռovats / BBQ',      en: 'BBQ / Khorovats',   ru: 'Хоровац / BBQ'       }, icon: '🔥', sort_order: 8  },
    { slug: 'fish',              name: { hy: 'Ձկնային Ուtestner',   en: 'Fish Dishes',       ru: 'Рыбные блюда'        }, icon: '🐟', sort_order: 9  },
    { slug: 'sides',             name: { hy: 'Կողմnakiутests',       en: 'Side Dishes',       ru: 'Гарниры'             }, icon: '🥔', sort_order: 10 },
    { slug: 'sauces',            name: { hy: 'Սоusnery',             en: 'Sauces',            ru: 'Соусы'               }, icon: '🥄', sort_order: 11 },
    { slug: 'desserts',          name: { hy: 'Քաղцраveniq',          en: 'Desserts',          ru: 'Десерты'             }, icon: '🍰', sort_order: 12 },
    { slug: 'lemonades',         name: { hy: 'Limonadner',           en: 'Lemonades',         ru: 'Лимонады'            }, icon: '🍋', sort_order: 13 },
    { slug: 'coffee',            name: { hy: 'Surj',                 en: 'Coffee',            ru: 'Кофе'                }, icon: '☕', sort_order: 14 },
    { slug: 'tea',               name: { hy: 'Theyner',              en: 'Tea',               ru: 'Чай'                 }, icon: '🍵', sort_order: 15 },
    { slug: 'soft-drinks',       name: { hy: 'Umpeliqner',           en: 'Soft Drinks',       ru: 'Безалкогольные'      }, icon: '🥤', sort_order: 16 },
    { slug: 'beer',              name: { hy: 'Garejur',              en: 'Beer',              ru: 'Пиво'                }, icon: '🍺', sort_order: 17 },
  ];
  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }

  // ── MongoDB: Menu Items ────────────────────────────────────────────────────
  await MenuItem.deleteMany({});

  const n = (hy, en, ru) => ({ hy, en, ru });
  const d = (hy, en, ru) => ({ hy, en, ru });

  const items = [
    // ── BREAKFAST ─────────────────────────────────────────────────────────────
    { name: n('Ձvatseg', 'Fried Eggs', 'Яичница-глазунья'),
      description: d('Kkhrme dzvatseg', 'Classic fried eggs', 'Классическая яичница-глазунья'),
      price: 700, category: 'breakfast', sort_order: 1 },

    { name: n('Sunkеrov Omlet', 'Omelette with Mushrooms', 'Омлет с грибами'),
      description: d('Tasndes snkеrov omlet', 'Fluffy omelette with forest mushrooms', 'Пышный омлет с лесными грибами'),
      price: 1400, category: 'breakfast', sort_order: 2 },

    { name: n('Panrov Omlet', 'Omelette with Cheese', 'Омлет с сыром'),
      description: d('Kremakov panrov omlet', 'Golden omelette with melted cheese', 'Румяный омлет с расплавленным сыром'),
      price: 1400, category: 'breakfast', sort_order: 3 },

    { name: n('Basturmayov Omlet', 'Omelette with Basturma', 'Омлет с бастурмой'),
      description: d('Hayakan bastumayov omlet', 'Omelette with traditional Armenian cured beef', 'Омлет с армянской бастурмой'),
      price: 1600, category: 'breakfast', sort_order: 4 },

    { name: n('Ghavrmayov Omlet', 'Omelette with Ghaurma', 'Омлет с гавурмой'),
      description: d('Msayin ghavrmayov omlet', 'Omelette with slow-cooked meat preserve', 'Омлет с тушёной мясной гавурмой'),
      price: 2000, category: 'breakfast', sort_order: 5 },

    { name: n('Spanakh Dzvov', 'Spinach with Eggs', 'Шпинат с яйцом'),
      description: d('Kanachy spanakhy tasndes dzvov', 'Sautéed spinach with eggs, Armenian style', 'Жареный шпинат с яйцами по-армянски'),
      price: 2100, category: 'breakfast', sort_order: 6 },

    { name: n('Blit Tartsov', 'Pancakes with Beef', 'Блины с говядиной'),
      description: d('Msov ltstots blit', 'Thin pancakes stuffed with spiced ground beef', 'Тонкие блины с пряной говядиной'),
      price: 1400, category: 'breakfast', sort_order: 7 },

    { name: n('Blit Katukov', 'Pancakes with Curd', 'Блины с творогом'),
      description: d('Khanots katukov blit', 'Delicate pancakes with cottage cheese filling', 'Нежные блины с начинкой из творога'),
      price: 900, category: 'breakfast', sort_order: 8 },

    { name: n('Dzgvatsats Matsun Meghrov', 'Strained Yogurt with Honey', 'Мацони с медом'),
      description: d('Tnayin matsun ev meghry', 'Thick strained yogurt drizzled with mountain honey', 'Густой процеженный мацони с горным мёдом'),
      price: 1300, category: 'breakfast', sort_order: 9 },

    { name: n('Fransiakan Nakhajash', 'French Breakfast', 'Французский завтрак'),
      description: d('Khrachunov, marmeladov, toastov nakhajash', 'Croissant, toast, jam, butter and coffee', 'Круассан, тост, джем, масло и кофе'),
      price: 3500, category: 'breakfast', sort_order: 10 },

    { name: n('Sirnig Varenkov', 'Syrnik with Jam', 'Сырники с джемом'),
      description: d('Khnkhalin katukov sirnig varenkov', 'Cottage cheese fritters served with house-made jam', 'Творожные сырники с домашним джемом'),
      price: 2200, category: 'breakfast', sort_order: 11 },

    // ── COLD APPETIZERS ───────────────────────────────────────────────────────
    { name: n('Hayakan Panrnerits Assorti', 'Armenian Cheese Platter', 'Армянская сырная тарелка'),
      description: d('Hayakan panrnerits hamakarg', 'Selection of traditional Armenian cheeses', 'Ассорти традиционных армянских сыров'),
      price: 2100, category: 'cold-appetizers', sort_order: 1 },

    { name: n('Yevropakan Panrnerits Assorti', 'European Cheese Platter', 'Европейское ассорти'),
      description: d('Yevropakan panrnerits ev phaytov assorti', 'Selection of premium European cheeses with fruits and honey', 'Ассорти европейских сыров с фруктами и мёдом'),
      price: 6700, category: 'cold-appetizers', sort_order: 2 },

    { name: n('Tnayin Msayin Assorti', 'Homemade Meat Platter', 'Мясной ассорти'),
      description: d('Basturma, sujukh, msegheny', 'Basturma, sujuk and home-cured cold meats', 'Бастурма, суджук и домашние мясные деликатесы'),
      price: 4900, category: 'cold-appetizers', sort_order: 3, image_url: `${BASE_IMG}img2.jpg` },

    { name: n('Dzknayin Assorti', 'Fish Assorted', 'Рыбное ассорти'),
      description: d('Aphkhatsvats dzuk ev kaviar', 'Smoked fish, salmon and caviar selection', 'Копчёная рыба, лосось и икра'),
      price: 4500, category: 'cold-appetizers', sort_order: 4 },

    { name: n('Banjareghenayin Assorti', 'Vegetables Platter', 'Ассорти из овощей'),
      description: d('Kaytsrelov banjareghener ev tsakhaghkababaghi', 'Seasonal grilled and fresh vegetables', 'Сезонные гриль и свежие овощи'),
      price: 2500, category: 'cold-appetizers', sort_order: 5 },

    { name: n('Kanachareghen', 'Assortment of Greens', 'Зелень ассорти'),
      description: d('Rehan, koriandro, mateghak, tarrkhun', 'Fresh basil, coriander, mint and tarragon', 'Свежий базилик, кориандр, мята и тархун'),
      price: 1300, category: 'cold-appetizers', sort_order: 6 },

    { name: n('Tnayin Ttvu Banjareghener', 'Homemade Pickles', 'Соленья'),
      description: d('Tnayin yeghanak banjareghener', 'House-made pickled vegetables and herbs', 'Домашние маринованные овощи и зелень'),
      price: 1400, category: 'cold-appetizers', sort_order: 7 },

    { name: n('Hayakan Pakhpakhanum Assorti', 'Armenian Preserves Assorted', 'Армянские варенья ассорти'),
      description: d('Tnayin meyvayin pakhpakhanum', 'Selection of house-made fruit preserves', 'Ассорти домашних фруктовых варений'),
      price: 2500, category: 'cold-appetizers', sort_order: 8 },

    { name: n('Kktumb ev Dzitaphagher', 'Lemon and Olives', 'Лимон и оливки'),
      description: d('Kktumb ev marinated dzitaphagher', 'Fresh lemon slices and marinated olives', 'Свежий лимон и маринованные оливки'),
      price: 1400, category: 'cold-appetizers', sort_order: 9 },

    // ── HOT APPETIZERS ────────────────────────────────────────────────────────
    { name: n('Garrnayin Ghavurma', 'Lamb Ghavurma', 'Гавурма из баранины'),
      description: d('Khortzats garrnayin mis ghavrmayov', 'Slow-cooked lamb ghavurma, Armenian style', 'Тушёная гавурма из баранины по-армянски'),
      price: 4500, category: 'hot-appetizers', sort_order: 1, is_popular: true },

    { name: n('Tarakatsayin Ghavurma', 'Beef Ghavurma', 'Гавурма с говядиной'),
      description: d('Khortzats tarakats mis ghavrmayov', 'Slow-cooked beef ghavurma with herbs', 'Тушёная говяжья гавурма с зеленью'),
      price: 4500, category: 'hot-appetizers', sort_order: 2 },

    { name: n('Ishli Kyufta', 'Ishli Kufta', 'Ишли кюфта'),
      description: d('Hamarev kyufta misov ev karotov', 'Bulghur shell stuffed with spiced minced meat', 'Кюфта из булгура с пряным фаршем внутри'),
      price: 1600, category: 'hot-appetizers', sort_order: 3, image_url: `${BASE_IMG}img6.jpg` },

    { name: n('Ltsots Snker', 'Stuffed Mushrooms', 'Фаршированные грибы'),
      description: d('Msov ev panrov ltsots snker', 'Mushroom caps stuffed with meat and cheese', 'Грибы, фаршированные мясом и сыром'),
      price: 2100, category: 'hot-appetizers', sort_order: 4 },

    { name: n('Badrjanayin Rullner', 'Eggplant Rolls', 'Роллы из баклажанов'),
      description: d('Panrov ev khtkheghin ltsots badrjan', 'Eggplant rolls with walnut and garlic filling', 'Рулетики из баклажана с орехово-чесночной начинкой'),
      price: 1900, category: 'hot-appetizers', sort_order: 5 },

    { name: n('Humus', 'Hummus', 'Хумус'),
      description: d('Karabanjarov ev tahiniov humus', 'Classic chickpea hummus with tahini and olive oil', 'Классический хумус из нута с тахини и оливковым маслом'),
      price: 1200, category: 'hot-appetizers', sort_order: 6 },

    { name: n('Panrkhash', 'Panrkhash', 'Панрхаш'),
      description: d('Lavashov, panrov ev khanutyamb panrkhash', 'Crispy lavash with melted cheese, herbs and butter', 'Хрустящий лаваш с расплавленным сыром, зеленью и маслом'),
      price: 2700, category: 'hot-appetizers', sort_order: 7, is_popular: true, image_url: `${BASE_IMG}img7.jpg` },

    { name: n('Adjararyan Khachapuri', 'Adjarian Khachapuri', 'Аджарский хачапури'),
      description: d('Panrov ev dzvov khachapuri', 'Boat-shaped bread filled with cheese and egg', 'Хлеб в форме лодочки с сыром и яйцом'),
      price: 1500, category: 'hot-appetizers', sort_order: 8 },

    { name: n('Imeretakan Khachapuri', 'Imeretian Khachapuri', 'Имеретинский хачапури'),
      description: d('Klatkayin panrov khachapuri', 'Round flatbread generously filled with Imeretian cheese', 'Круглый хлеб щедро наполненный имеретинским сыром'),
      price: 2200, category: 'hot-appetizers', sort_order: 9 },

    { name: n('Tonrayin Hats ev Lavash', 'Tonir Bread and Lavash', 'Хлеб тонирный и лаваш'),
      description: d('Tnayin tonrayin hats ev bnik lavash', 'Freshly baked tonir bread and traditional lavash', 'Свежеиспечённый тонирный хлеб и традиционный лаваш'),
      price: 550, category: 'hot-appetizers', sort_order: 10 },

    { name: n('Dzgvatsats Matsun', 'Strained Yogurt', 'Процеженный мацони'),
      description: d('Khnkhalin dzgvatsats hayakan matsun', 'Thick, creamy strained Armenian yogurt', 'Густой кремовый процеженный армянский мацони'),
      price: 1000, category: 'hot-appetizers', sort_order: 11 },

    // ── SALADS ────────────────────────────────────────────────────────────────
    { name: n('Arti Aghtsan', 'Arti Salad', 'Салат Арти'),
      description: d('Spanakh, cirtov dzu, tahini', 'Spinach, quail egg, tahini dressing', 'Шпинат, перепелиное яйцо, соус тахини'),
      price: 3000, category: 'salads', sort_order: 1 },

    { name: n('Pghpeghani', 'Pghpeghani', 'Пгпегани'),
      description: d('Bell pepper, peta', 'Roasted bell pepper with feta cheese', 'Запечённый перец с сыром фета'),
      price: 2600, category: 'salads', sort_order: 2 },

    { name: n('Khrustikayin Aghtsan', 'Crispy Salad', 'Хрустящий салат'),
      description: d('Badrjan, mozzarella', 'Crispy fried eggplant with fresh mozzarella', 'Хрустящий жареный баклажан со свежей моцареллой'),
      price: 2900, category: 'salads', sort_order: 3 },

    { name: n('Kaysar Aghtsan', 'Caesar Salad', 'Салат Цезарь'),
      description: d('Hav, romaine, krakery', 'Grilled chicken, romaine, croutons, Caesar dressing', 'Куриное филе, ромэн, гренки, соус Цезарь'),
      price: 2800, category: 'salads', sort_order: 4 },

    { name: n('Hunakan Aghtsan', 'Greek Salad', 'Греческий салат'),
      description: d('Lolik, varganer, panir', 'Tomatoes, cucumbers, olives, feta, oregano', 'Томаты, огурцы, оливки, фета, орегано'),
      price: 2600, category: 'salads', sort_order: 5 },

    { name: n('Amberiyin Aghtsan', 'Summer Salad', 'Летний салат'),
      description: d('Kayitsrelov banjareghener', 'Fresh seasonal vegetables with house dressing', 'Свежие сезонные овощи с фирменной заправкой'),
      price: 1500, category: 'salads', sort_order: 6 },

    { name: n('Hav ev Quinoa', 'Chicken and Quinoa', 'Курица с киноа'),
      description: d('Khortzats hav, quinoa, banjareghener', 'Grilled chicken with quinoa and seasonal vegetables', 'Куриное филе гриль с киноа и сезонными овощами'),
      price: 2300, category: 'salads', sort_order: 7 },

    { name: n('Taragats ev Badrjan', 'Beef and Eggplant', 'Говядина с баклажаном'),
      description: d('Khortzats taragats ev badrjan', 'Grilled beef strips with roasted eggplant', 'Полоски говядины гриль с запечённым баклажаном'),
      price: 3400, category: 'salads', sort_order: 8 },

    { name: n('Tabbule', 'Tabbouleh', 'Табуле'),
      description: d('Petrushin, pomidor, limon, jitaphagh', 'Fresh parsley, tomato, lemon, olive oil', 'Свежая петрушка, томат, лимон, оливковое масло'),
      price: 1600, category: 'salads', sort_order: 9 },

    { name: n('Aveluk', 'Aveluk', 'Авелук'),
      description: d('Hayakan tsetoraghi ev charumakayin aveluk', 'Traditional Armenian sorrel salad with walnuts and spices', 'Традиционный армянский салат из авелука с грецкими орехами'),
      price: 1800, category: 'salads', sort_order: 10 },

    // ── SOUPS ─────────────────────────────────────────────────────────────────
    { name: n('Spas', 'Spas', 'Спас'),
      description: d('Hayakan matsnov ev hatikavayrov apour', 'Traditional Armenian yogurt and wheat soup', 'Традиционный армянский суп с мацони и пшеницей'),
      price: 1200, category: 'soups', sort_order: 1, image_url: `${BASE_IMG}img9.jpg` },

    { name: n('Spas Ishli Kyuftayov', 'Spas with Ishli Kufta', 'Спас с ишли кюфта'),
      description: d('Spasin lravorvadum e ishli kyuftayov', 'Classic spas enriched with stuffed kufta', 'Классический спас обогащённый ишли кюфтой'),
      price: 1800, category: 'soups', sort_order: 2 },

    { name: n('Avelukov Apour', 'Soup with Sorrel', 'Суп с авелуком'),
      description: d('Avelukayov khmorayin apour', 'Hearty sorrel soup with vegetables', 'Сытный суп из авелука с овощами'),
      price: 1000, category: 'soups', sort_order: 3 },

    { name: n('Lobov Apour', 'Bean Soup', 'Суп с фасолью'),
      description: d('Kayitsats lobov hayakan apour', 'Thick Armenian bean soup with smoked meat', 'Густой армянский суп из фасоли с копчёностями'),
      price: 1000, category: 'soups', sort_order: 4 },

    { name: n('Solyanka', 'Solyanka', 'Солянка'),
      description: d('Msayin solyanka', 'Rich meat solyanka with pickles and olives', 'Наваристая мясная солянка с соленьями и оливками'),
      price: 1800, category: 'soups', sort_order: 5 },

    { name: n('Borshch', 'Borscht', 'Борщ'),
      description: d('Kaghambov, chakandeghov borshch', 'Classic borsch with cabbage, beets and sour cream', 'Классический борщ с капустой, свёклой и сметаной'),
      price: 1600, category: 'soups', sort_order: 6 },

    { name: n('Ddumov Krem-Apour', 'Pumpkin Cream Soup', 'Крем-суп из тыквы'),
      description: d('Kaytsrelov ddumov krem apour', 'Velvety roasted pumpkin cream soup', 'Бархатный крем-суп из запечённой тыквы'),
      price: 900, category: 'soups', sort_order: 7 },

    { name: n('Harisa', 'Harisa', 'Харисa'),
      description: d('Hayakan havov ev hatsatesakov harisa', 'Traditional Armenian chicken and cracked wheat porridge', 'Традиционная армянская харисa из курицы и пшеницы'),
      price: 1500, category: 'soups', sort_order: 8, image_url: `${BASE_IMG}img8.jpg` },

    { name: n('Havov Apour', 'Chicken Soup', 'Куриный суп'),
      description: d('Tnayin havov ev banjareghenayin apour', 'Home-style chicken soup with fresh vegetables', 'Домашний куриный суп со свежими овощами'),
      price: 1200, category: 'soups', sort_order: 9 },

    { name: n('Khash', 'Khash', 'Хаш'),
      description: d('Kayitsats kkhunayin khash (yerasezayin)', 'Traditional winter khash — beef feet and tripe (seasonal)', 'Традиционный зимний хаш из говяжьих ножек (сезонное)'),
      price: 2900, category: 'soups', sort_order: 10 },

    // ── MAIN DISHES ───────────────────────────────────────────────────────────
    { name: n('Amberiyin Tolma', 'Summer Tolma', 'Летняя долма'),
      description: d('Tarakatsov lolik, bighbegh, badrjan tolma', 'Stuffed tomato, pepper and eggplant with beef', 'Фаршированные томат, перец и баклажан с говядиной'),
      price: 3900, category: 'mains', sort_order: 1 },

    { name: n('Khaghoghov Tolma', 'Tolma with Grape Leaves', 'Долма в виноградных листьях'),
      description: d('Khaghoghi terterov tarakatsov tolma', 'Classic grape leaf tolma with minced beef', 'Классическая долма в виноградных листьях с говядиной'),
      price: 2700, category: 'mains', sort_order: 2, image_url: `${BASE_IMG}img1.jpg` },

    { name: n('Kaghambapatuyts Tolma', 'Tolma with Cabbage', 'Долма с капустой'),
      description: d('Kaghambi mej ltsots tarakatsov tolma', 'Ground beef tolma wrapped in cabbage leaves', 'Голубцы с говяжьим фаршем в капустных листьях'),
      price: 2700, category: 'mains', sort_order: 3 },

    { name: n('Garrnayin Tolma', 'Tolma with Lamb', 'Долма с бараниной'),
      description: d('Garrnayin misov ltsots tolma', 'Tender tolma with minced lamb and herbs', 'Нежная долма с бараньим фаршем и зеленью'),
      price: 2600, category: 'mains', sort_order: 4 },

    { name: n('Assorti Tolma', 'Assorted Tolma', 'Долма ассорти'),
      description: d('Khaghoghi, kaghambi ev amberiyin tolmanerits hamakarg', 'A feast of grape leaf, cabbage and summer tolma varieties', 'Ассорти из долмы в виноградных листьях, капусте и летней долмы'),
      price: 7500, category: 'mains', sort_order: 5, is_popular: true, image_url: `${BASE_IMG}img1.jpg` },

    { name: n('Tarakatsov Khashlama', 'Khashlama with Beef', 'Хашлама с говядиной'),
      description: d('Kayitsats tarakats khashlama', 'Tender beef khashlama with vegetables in broth', 'Нежная хашлама из говядины с овощами в бульоне'),
      price: 3900, category: 'mains', sort_order: 6 },

    { name: n('Garrnayin Khashlama', 'Lamb Khashlama', 'Хашлама из баранины'),
      description: d('Kayitsats garr khashlama', 'Slow-cooked lamb khashlama with fresh herbs', 'Хашлама из медленно тушёной баранины со свежей зеленью'),
      price: 4400, category: 'mains', sort_order: 7 },

    { name: n('Garni Yarakh', 'Garni Yarakh', 'Гарни Ярах'),
      description: d('Banjareghenayin garni yarakh', 'Stuffed vegetables in traditional Armenian style', 'Фаршированные овощи по-армянски'),
      price: 2500, category: 'mains', sort_order: 8 },

    { name: n('Jijvzhik', 'Tzhvzhik', 'Тжвжик'),
      description: d('Khortzats tarakatsov sirt ev bavoratvark', 'Sautéed beef heart and lung with onion', 'Жареные говяжьи сердце и лёгкие с луком'),
      price: 2100, category: 'mains', sort_order: 9 },

    { name: n('Arishta Ghavrmayov', 'Arishta with Ghavurma', 'Аришта с гавурмой'),
      description: d('Hayakan mkatserdu arishta ghavrmayov', 'Armenian homemade pasta with slow-cooked meat', 'Армянская домашняя лапша с тушёной гавурмой'),
      price: 4200, category: 'mains', sort_order: 10 },

    { name: n('Kartofilayin Ghavrmayov', 'Fried Potatoes with Ghavurma', 'Жареный картофель с гавурмой'),
      description: d('Tapakatsvats kartofil ghavrmayov', 'Crispy fried potatoes with rich meat ghavurma', 'Хрустящий жареный картофель с наваристой гавурмой'),
      price: 5300, category: 'mains', sort_order: 11 },

    { name: n('Kyufta Kremayov Sous', 'Kufta in Creamy Sauce', 'Кюфта в сливочном соусе'),
      description: d('Kremayov sousinknov kyufta', 'Tender lamb kufta simmered in creamy sauce', 'Нежная кюфта из баранины в сливочном соусе'),
      price: 2800, category: 'mains', sort_order: 12 },

    { name: n('Khurzhin Tarakatsov', 'Khurjin (beef in lavash)', 'Хурджин с говядиной'),
      description: d('Lavashov ltsots tarakatsov khurzhin', 'Juicy beef tenderloin wrapped in crispy lavash', 'Сочная говяжья вырезка в хрустящем лаваше'),
      price: 3900, category: 'mains', sort_order: 13 },

    { name: n('Khurzhin Garrnayin', 'Khurjin with Lamb', 'Хурджин с бараниной'),
      description: d('Lavashov ltsots garrnayin khurzhin', 'Lamb tenderloin wrapped in crispy lavash', 'Бараньи вырезки в хрустящем лаваше'),
      price: 3900, category: 'mains', sort_order: 14 },

    { name: n('Kalagosh', 'Kalagyosh', 'Калагёш'),
      description: d('Tarakatsov ev vosp kalagosh', 'Beef tenderloin with Armenian red lentil', 'Говяжья вырезка с армянской красной чечевицей'),
      price: 3700, category: 'mains', sort_order: 15 },

    { name: n('Yerevanayin Tapaka Areni', 'Yerevan Tapaka Areni', 'Тапака Ереванский Арени'),
      description: d('Tapaka hav areni kaghtnov', 'Yerevan-style tapaka chicken in Areni wine sauce', 'Тапака по-ереванскому с соусом из вина Арени'),
      price: 7500, category: 'mains', sort_order: 16 },

    { name: n('Syunik Khashnthur', 'Syunik Khashntur', 'Сюник Хашнтур'),
      description: d('Garrnayin mis khmorayin meji', 'Lamb baked in dough, Syunik style', 'Баранина, запечённая в тесте по-сюникски'),
      price: 8700, category: 'mains', sort_order: 17 },

    { name: n('Yeghegnadzorayin Ltsots Khuz File', 'Stuffed Pork Loin Yeghegnadzor', 'Фаршированная свиная вырезка Егегнадзор'),
      description: d('Yeghegnadzorayin style ltsots khuz file', 'Stuffed pork loin in Yeghegnadzor style with herbs', 'Фаршированная свиная вырезка по-егегнадзорски'),
      price: 6400, category: 'mains', sort_order: 18 },

    { name: n('Nazeli', 'Nazeli', 'Назели'),
      description: d('Hav, snkery ev pan nazeli', 'Tender chicken breast with mushrooms and melted cheese', 'Нежная куриная грудка с грибами и расплавленным сыром'),
      price: 3500, category: 'mains', sort_order: 19 },

    { name: n('Tnayin Shila Havov', 'Homemade Porridge with Chicken', 'Домашняя каша с курицей'),
      description: d('Misov shila havov', 'Traditional Armenian porridge with free-range chicken', 'Традиционная армянская каша с домашней курицей'),
      price: 3700, category: 'mains', sort_order: 20 },

    { name: n('Havayin Tender', 'Chicken Tender', 'Куриный тендер'),
      description: d('Khrustikayin paniruts tstsats havayin tender', 'Crispy golden chicken tender with cheese crust', 'Хрустящий золотистый куриный тендер в сырной корочке'),
      price: 3900, category: 'mains', sort_order: 21 },

    { name: n('Tarakatsov File', 'Beef Fillet', 'Говяжье филе'),
      description: d('Khortzats tarakatsov file aysink', 'Pan-seared beef fillet, medium, with herb butter', 'Обжаренное говяжье филе медиум с зелёным маслом'),
      price: 6900, category: 'mains', sort_order: 22 },

    { name: n('Khuzi Bekon', 'Pork Bacon', 'Свиная грудинка'),
      description: d('Khortzats khuzi bekon', 'Slow-roasted pork bacon with spices', 'Медленно запечённая свиная грудинка со специями'),
      price: 5800, category: 'mains', sort_order: 23 },

    { name: n('Kaytsarrov File', 'Trout Fillet', 'Филе форели'),
      description: d('Khortzats karmrakhayt file', 'Pan-fried fresh trout fillet with lemon butter', 'Жареное свежее филе форели с лимонным маслом'),
      price: 6100, category: 'mains', sort_order: 24 },

    { name: n('Garrnayin Barak', 'Lamb Tenderloin', 'Бараний тендерлойн'),
      description: d('Khortzats garrnayin barak', 'Grilled lamb tenderloin with mountain herbs', 'Жареный бараний тендерлойн с горными травами'),
      price: 7500, category: 'mains', sort_order: 25 },

    { name: n('Ghapama (Pokrik)', 'Ghapama (Small)', 'Гапама (маленькая)'),
      description: d('Pokrik ghapama meghrov, khndzov ev brinzov', 'Small festive pumpkin stuffed with rice, fruits and honey', 'Небольшая праздничная тыква с рисом, фруктами и мёдом'),
      price: 3800, category: 'mains', sort_order: 26, is_popular: true, image_url: `${BASE_IMG}img4.jpg` },

    { name: n('Ghapama (Mets)', 'Ghapama (Large)', 'Гапама (большая)'),
      description: d('Mets ghapama meghrov, khndzov, msov ev brinzov', 'Grand festive pumpkin stuffed with rice, dried fruits and meat', 'Большая праздничная тыква с рисом, сухофруктами и мясом'),
      price: 13500, category: 'mains', sort_order: 27, image_url: `${BASE_IMG}img4.jpg` },

    { name: n('Garrnayin Us Khorirnots', 'Lamb Shoulder in the Stove', 'Бараний окорок в печи'),
      description: d('Tonirum kayitsats garrnayin us', 'Whole lamb shoulder slow-roasted in the tonir oven', 'Целое плечо баранины, медленно запечённое в тонире'),
      price: 12900, category: 'mains', sort_order: 28, is_popular: true, image_url: `${BASE_IMG}img5.jpg` },

    { name: n('Karmir Kaytsarr Aghi Mej', 'Red Trout in Salt', 'Красная форель в соли'),
      description: d('Aghi mej kayitsats karmir kaytsarr', 'Whole red trout baked in a salt crust', 'Целая красная форель, запечённая в соляной корочке'),
      price: 15500, category: 'mains', sort_order: 29 },

    // ── PIDE & BREAD ──────────────────────────────────────────────────────────
    { name: n('Erkims Misov Pide', 'Pide Two Meat', 'Пиде два мяса'),
      description: d('Tarakatsov ev khuzi misov pide', 'Turkish-style pide with beef and pork filling', 'Пиде по-турецки с говяжьим и свиным фаршем'),
      price: 2600, category: 'pide', sort_order: 1 },

    { name: n('Pepperoniyov Pide', 'Pide Pepperoni', 'Пиде пепперони'),
      description: d('Pepperoniyov ev panrov pide', 'Pide with spicy pepperoni and melted cheese', 'Пиде с острым пепперони и расплавленным сыром'),
      price: 2900, category: 'pide', sort_order: 2 },

    { name: n('Laghmadjov Pide', 'Pide Lahmajo', 'Пиде Лахмаджо'),
      description: d('Misov ev banjareghenayin laghmadjov pide', 'Pide with spiced minced meat, Armenian lahmajo style', 'Пиде с пряным фаршем в стиле армянского лахмаджо'),
      price: 2600, category: 'pide', sort_order: 3 },

    { name: n('Panrov Pide', 'Pide Cheese', 'Пиде с сыром'),
      description: d('Hayots panrov pide', 'Pide generously filled with Armenian cheese blend', 'Пиде щедро наполненное армянской смесью сыров'),
      price: 2600, category: 'pide', sort_order: 4 },

    { name: n('Garrnayin Misov Pide', 'Pide with Lamb', 'Пиде с бараниной'),
      description: d('Garrnayin misov ev kanacheghehnov pide', 'Pide with spiced minced lamb and fresh herbs', 'Пиде с пряным бараньим фаршем и свежей зеленью'),
      price: 2600, category: 'pide', sort_order: 5 },

    { name: n('Khuzi Shaurnma Khmorayin Mej', 'Pork Shawarma in Dough', 'Свиная шаурма в тесте'),
      description: d('Khmoreyov pakhvats khuzi shaurnma', 'Juicy pork shawarma wrapped in house-made dough', 'Сочная свиная шаурма в домашнем тесте'),
      price: 2900, category: 'pide', sort_order: 6 },

    // ── BBQ / KHOROVATS ───────────────────────────────────────────────────────
    { name: n('Khuzi Shpikond BBQ', 'Pork Loin BBQ', 'Свиная корейка BBQ'),
      description: d('Khortzats khuzi shpikondi file', 'Juicy grilled pork loin chop', 'Сочная свиная корейка на углях'),
      price: 3800, category: 'bbq', sort_order: 1 },

    { name: n('Khuzi Klorts BBQ', 'Pork Ribs BBQ', 'Свиные рёбра BBQ'),
      description: d('Marinadov khuzi klorts', 'Marinated pork ribs grilled over charcoal', 'Маринованные свиные рёбра на углях'),
      price: 3700, category: 'bbq', sort_order: 2 },

    { name: n('Khuzi File BBQ', 'Pork Tenderloin BBQ', 'Свиная вырезка BBQ'),
      description: d('Khortzats khuzi file', 'Tender pork tenderloin grilled to perfection', 'Нежная свиная вырезка, идеально приготовленная на гриле'),
      price: 3500, category: 'bbq', sort_order: 3 },

    { name: n('Tarakatsov File BBQ', 'Beef Fillet BBQ', 'Говяжье филе BBQ'),
      description: d('Premium khortzats tarakatsov file', 'Premium beef fillet grilled over natural charcoal', 'Премиальное говяжье филе на натуральных углях'),
      price: 4500, category: 'bbq', sort_order: 4 },

    { name: n('Garrnayin Shpikond BBQ', 'Lamb Loin BBQ', 'Баранья корейка BBQ'),
      description: d('Khortzats garrnayin shpikond', 'Grilled lamb loin chop with mountain herbs', 'Жареная баранья корейка с горными травами'),
      price: 4300, category: 'bbq', sort_order: 5 },

    { name: n('Garrnayin File BBQ', 'Lamb Tenderloin BBQ', 'Баранья вырезка BBQ'),
      description: d('Khortzats garrnayin file', 'Grilled lamb tenderloin, delicately spiced', 'Жареная бараньи вырезки, нежно приправленные'),
      price: 3500, category: 'bbq', sort_order: 6 },

    { name: n('Garrnayin Klorts BBQ', 'Lamb Ribs BBQ', 'Бараньи рёбра BBQ'),
      description: d('Khortzats garrnayin klorts', 'Grilled lamb ribs with aromatic spice rub', 'Жареные бараньи рёбра с ароматными специями'),
      price: 3900, category: 'bbq', sort_order: 7 },

    { name: n('Havayin BBQ', 'Chicken BBQ', 'Курица BBQ'),
      description: d('Khortzats hav marinadov', 'Marinated whole chicken grilled over charcoal', 'Маринованная курица на углях'),
      price: 2300, category: 'bbq', sort_order: 8 },

    { name: n('Tarakatsov Kyabab', 'Beef Kebab', 'Говяжий кебаб'),
      description: d('Tarakatsov msmis kyabab', 'Juicy ground beef kebab on skewer', 'Сочный говяжий кебаб на шампуре'),
      price: 1600, category: 'bbq', sort_order: 9 },

    { name: n('Havayin Kyabab', 'Chicken Kebab', 'Куриный кебаб'),
      description: d('Havayin msmis kyabab', 'Tender ground chicken kebab on skewer', 'Нежный куриный кебаб на шампуре'),
      price: 1300, category: 'bbq', sort_order: 10 },

    { name: n('Garrnayin Kyabab', 'Lamb Kebab', 'Бараний кебаб'),
      description: d('Garrnayin msmis kyabab', 'Spiced minced lamb kebab on skewer', 'Пряный бараний кебаб на шампуре'),
      price: 1800, category: 'bbq', sort_order: 11 },

    { name: n('Orsnakan Kyabab', 'Hunter\'s Kebab', 'Охотничий кебаб'),
      description: d('Msayin assortiyov kyabab', 'Mixed meat kebab with mushrooms and peppers', 'Кебаб из смеси мяса с грибами и перцем'),
      price: 2300, category: 'bbq', sort_order: 12 },

    { name: n('Mets BBQ Set', 'BBQ Set Big', 'BBQ сет большой'),
      description: d('Mets msayin assorti khorovats set', 'Grand BBQ set: assortment of all meats for the whole table', 'Большой BBQ сет: ассорти всех видов мяса на всю компанию'),
      price: 45500, category: 'bbq', sort_order: 13, is_popular: true, image_url: `${BASE_IMG}img2.jpg` },

    { name: n('Pokrik BBQ Set', 'BBQ Set Small', 'BBQ сет малый'),
      description: d('Pokrik msayin assorti khorovats set', 'Small BBQ set: assortment of meats for two', 'Малый BBQ сет: ассорти мяса на двоих'),
      price: 16200, category: 'bbq', sort_order: 14 },

    { name: n('Kamancha Set', 'Kamancha Set', 'Сет Каманча'),
      description: d('Signature Kamancha msayin assorti set', 'Signature Kamancha BBQ set with chef\'s selection', 'Фирменный сет Каманча с выбором шеф-повара'),
      price: 28500, category: 'bbq', sort_order: 15, is_popular: true, image_url: `${BASE_IMG}img3.jpg` },

    // ── FISH ──────────────────────────────────────────────────────────────────
    { name: n('Kayitsats Karmrakhayt', 'Boiled Trout', 'Отварная форель'),
      description: d('Kayitsats karmrakhayt banjareghenayin apum', 'Delicately poached fresh trout with vegetables', 'Нежно отваренная свежая форель с овощами'),
      price: 4200, category: 'fish', sort_order: 1 },

    { name: n('Khortzats Karmrakhayt', 'Trout BBQ', 'Форель на углях'),
      description: d('Khortzats karmrakhayt limonov', 'Charcoal-grilled trout with lemon and herbs', 'Форель на углях с лимоном и зеленью'),
      price: 4200, category: 'fish', sort_order: 2 },

    { name: n('Kayitsats Tsadan', 'Boiled Whitefish', 'Отварная белая рыба'),
      description: d('Kayitsats tsadan banjareghenayin apum', 'Gently poached whitefish with fresh vegetables', 'Нежно отваренная белая рыба со свежими овощами'),
      price: 3600, category: 'fish', sort_order: 3 },

    { name: n('Khortzats Tsadan', 'Whitefish BBQ', 'Белая рыба на углях'),
      description: d('Khortzats tsadan kanacheghehnov', 'Grilled whitefish with aromatic herbs', 'Белая рыба на углях с ароматными травами'),
      price: 3600, category: 'fish', sort_order: 4 },

    { name: n('Khortzats Osyotr', 'Sturgeon BBQ', 'Осётр на углях'),
      description: d('Khortzats osyotri file', 'Premium sturgeon fillet grilled over charcoal', 'Премиальное филе осетра на углях'),
      price: 10900, category: 'fish', sort_order: 5 },

    // ── SIDES ─────────────────────────────────────────────────────────────────
    { name: n('Tapakats Kartofil Khanutov', 'Fried Potatoes with Butter', 'Жареный картофель с маслом'),
      description: d('Tapakats kartofil khanutov ev kanacheghehnov', 'Crispy fried potatoes with butter and herbs', 'Хрустящий жареный картофель с маслом и зеленью'),
      price: 1400, category: 'sides', sort_order: 1 },

    { name: n('Khortzats Banjareghener', 'Grilled Vegetables', 'Овощи на гриле'),
      description: d('Khortzats kayitsrelov banjareghener', 'Seasonal vegetables grilled over charcoal', 'Сезонные овощи на углях'),
      price: 1600, category: 'sides', sort_order: 2 },

    { name: n('Pilav Brinzov ev Banjareghenayin', 'Pilaf with Rice and Vegetables', 'Плов с рисом и овощами'),
      description: d('Tnayin brinzov ev banjareghenayin pilav', 'Fragrant rice pilaf with seasonal vegetables', 'Ароматный рисовый плов с сезонными овощами'),
      price: 1500, category: 'sides', sort_order: 3 },

    { name: n('Pilav Kamov ev Snkernov', 'Pilaf with Spelt and Mushrooms', 'Плов со спельтой и грибами'),
      description: d('Kamov ev snkernov pilav', 'Nutty spelt pilaf with sautéed mushrooms', 'Ореховый плов из спельты с обжаренными грибами'),
      price: 1300, category: 'sides', sort_order: 4 },

    { name: n('Arishta', 'Arishta', 'Аришта'),
      description: d('Hayakan arishta mtsnayin arakhchinakayov', 'Traditional Armenian homemade pasta with butter', 'Традиционная армянская домашняя лапша с маслом'),
      price: 1000, category: 'sides', sort_order: 5 },

    { name: n('Tapakats Spanakh', 'Fried Spinach', 'Жареный шпинат'),
      description: d('Tapakats spanakh sghayin ev limonov', 'Sautéed spinach with garlic and lemon', 'Обжаренный шпинат с чесноком и лимоном'),
      price: 1800, category: 'sides', sort_order: 6 },

    { name: n('Kartofilain Pure', 'Mashed Potatoes', 'Пюре картофельное'),
      description: d('Khanutov kartofil pure', 'Smooth mashed potatoes with butter and cream', 'Нежное картофельное пюре со сливками и маслом'),
      price: 900, category: 'sides', sort_order: 7 },

    { name: n('Brinz', 'Rice', 'Рис'),
      description: d('Gopotzats brinz', 'Steamed white rice', 'Белый отварной рис'),
      price: 900, category: 'sides', sort_order: 8 },

    { name: n('Banjareghenayin BBQ', 'Vegetable BBQ', 'Овощи BBQ'),
      description: d('Khortzats tsezoghnayin banjareghener', 'Mixed vegetables grilled over charcoal', 'Смесь овощей на углях'),
      price: 1700, category: 'sides', sort_order: 9 },

    { name: n('Kartofil BBQ', 'Potato BBQ', 'Картофель BBQ'),
      description: d('Khortzats kartofil', 'Charcoal-roasted whole potatoes', 'Картофель, запечённый на углях'),
      price: 700, category: 'sides', sort_order: 10 },

    { name: n('Snker BBQ', 'Mushroom BBQ', 'Грибы BBQ'),
      description: d('Khortzats snker', 'Charcoal-grilled whole mushrooms with herbs', 'Целые грибы на углях с зеленью'),
      price: 1400, category: 'sides', sort_order: 11 },

    // ── SAUCES ────────────────────────────────────────────────────────────────
    { name: n('Pntvatsats Panri Sous', 'Buried Cheese Sauce', 'Соус зарытого сыра'),
      description: d('Kamancha signature pntvatsats panri sous', 'Kamancha signature aged buried cheese sauce', 'Фирменный соус Каманча из выдержанного сыра'),
      price: 500, category: 'sauces', sort_order: 1 },

    { name: n('Ashtaraki Sous', 'Ashtarak Sauce', 'Соус Аштарак'),
      description: d('Ashkhatalay ashtaraki sous', 'Traditional Ashtarak tomato and herb sauce', 'Традиционный соус Аштарак из томатов и трав'),
      price: 500, category: 'sauces', sort_order: 2 },

    { name: n('Sghayin Sous', 'Garlic Sauce', 'Чесночный соус'),
      description: d('Msnayin sghayin sous', 'Creamy garlic sauce', 'Кремовый чесночный соус'),
      price: 500, category: 'sauces', sort_order: 3 },

    { name: n('Ghars Sous', 'Ghars Sauce', 'Соус Гарс'),
      description: d('Hayakan ghars sous', 'Armenian-style walnut and herb sauce', 'Армянский соус с грецкими орехами и зеленью'),
      price: 500, category: 'sauces', sort_order: 4 },

    { name: n('Kharisr Sous', 'Hot Sauce', 'Острый соус'),
      description: d('Ssar kharisr sous', 'Fiery hot chilli sauce', 'Огненный острый соус'),
      price: 500, category: 'sauces', sort_order: 5 },

    { name: n('Tkemali', 'Tkemali', 'Ткемали'),
      description: d('Karmir tkemali', 'Georgian sour plum sauce', 'Грузинский соус из кислой сливы'),
      price: 500, category: 'sauces', sort_order: 6 },

    { name: n('Narsharab', 'Narsharab', 'Наршараб'),
      description: d('Nurovornayin narsharab', 'Sweet and sour pomegranate molasses sauce', 'Кисло-сладкий соус из гранатовой мелассы'),
      price: 500, category: 'sauces', sort_order: 7 },

    // ── DESSERTS ──────────────────────────────────────────────────────────────
    { name: n('Kamancha Qaqavch', 'Sweet Kamancha', 'Сладкая Каманча'),
      description: d('Kamancha signature qaghcr anaknamadzev', 'Kamancha signature dessert — the restaurant\'s sweet masterpiece', 'Фирменный десерт Каманча — сладкий шедевр ресторана'),
      price: 12000, category: 'desserts', sort_order: 1, is_popular: true, image_url: `${BASE_IMG}img10.jpg` },

    { name: n('Meyvayin Talp (Pokrik)', 'Fruit Plate (Small)', 'Фруктовая тарелка (малая)'),
      description: d('Kayitsrelov meyvayin talp', 'Seasonal fresh fruit platter', 'Тарелка сезонных свежих фруктов'),
      price: 4500, category: 'desserts', sort_order: 2 },

    { name: n('Meyvayin Talp (Mets)', 'Fruit Plate (Large)', 'Фруктовая тарелка (большая)'),
      description: d('Mets kayitsrelov meyvayin talp', 'Large seasonal fresh fruit platter', 'Большая тарелка сезонных свежих фруктов'),
      price: 7500, category: 'desserts', sort_order: 3 },

    { name: n('Gata', 'Gata', 'Гата'),
      description: d('Hayakan traditsionayin gata', 'Traditional Armenian sweet pastry with sugar filling', 'Традиционная армянская сладкая выпечка с начинкой'),
      price: 1700, category: 'desserts', sort_order: 4 },

    { name: n('Pakhlava', 'Pakhlava', 'Пахлава'),
      description: d('Khtkheghin pakhlava meghrov', 'Crispy walnut pakhlava with honey syrup', 'Хрустящая пахлава с грецкими орехами и медовым сиропом'),
      price: 1400, category: 'desserts', sort_order: 5 },

    { name: n('Khortzats Khndzov Strudel', 'Apple Strudel', 'Яблочный штрудель'),
      description: d('Khortzats khndzov strudel', 'Warm apple strudel with cinnamon and powdered sugar', 'Тёплый яблочный штрудель с корицей и сахарной пудрой'),
      price: 2400, category: 'desserts', sort_order: 6 },

    { name: n('Chocoladayin Lavayov Tort', 'Lava Cake', 'Лавовый кекс'),
      description: d('Chocoladayin lava cake liquid center', 'Warm chocolate lava cake with molten center', 'Тёплый шоколадный кекс с жидким центром'),
      price: 2200, category: 'desserts', sort_order: 7 },

    { name: n('Chocoladayin Kolbas', 'Chocolate Sausage', 'Шоколадная колбаса'),
      description: d('Khnkhalin chocoladayin kolbas', 'Delicate chocolate sausage with biscuit and nuts', 'Нежная шоколадная колбаса с печеньем и орехами'),
      price: 1200, category: 'desserts', sort_order: 8 },

    { name: n('Meghrov Tort (Medovik)', 'Honey Cake (Medovik)', 'Медовик'),
      description: d('Klassik meghrov tort medovik', 'Classic layered honey cake with cream', 'Классический слоёный медовик со сметанным кремом'),
      price: 1300, category: 'desserts', sort_order: 9 },

    { name: n('Ekler', 'Eclair', 'Эклер'),
      description: d('Khnkhalin chocoladayin ekler', 'Delicate chocolate glazed éclair with cream filling', 'Нежный шоколадный эклер с кремовой начинкой'),
      price: 1100, category: 'desserts', sort_order: 10 },

    { name: n('Tsittakhaghin Kataghin', 'Bird\'s Milk', 'Птичье молоко'),
      description: d('Khnkhalin tsittakhaghin kataghin tort', 'Classic bird\'s milk cake with soufflé and chocolate', 'Классическое птичье молоко с суфле и шоколадом'),
      price: 1400, category: 'desserts', sort_order: 11 },

    { name: n('Chezkek', 'Cheesecake', 'Чизкейк'),
      description: d('Khnkhalin krem-panrov chezkek', 'Creamy New York style cheesecake', 'Кремовый чизкейк в стиле Нью-Йорк'),
      price: 1900, category: 'desserts', sort_order: 12 },

    { name: n('Chezkek Dubai', 'Cheesecake Dubai', 'Чизкейк Dubai'),
      description: d('Dubai style chezkek pistachiov', 'Dubai-style cheesecake with pistachio cream', 'Чизкейк в стиле Dubai с фисташковым кремом'),
      price: 2300, category: 'desserts', sort_order: 13 },

    { name: n('Meghrov ev Khtkheghinov Sarts', 'Ice Cream with Honey and Walnuts', 'Мороженое с мёдом и орехами'),
      description: d('Vanilla sarts meghrov ev khtkheghinov', 'Vanilla ice cream with mountain honey and walnuts', 'Ванильное мороженое с горным мёдом и грецкими орехами'),
      price: 1200, category: 'desserts', sort_order: 14 },

    { name: n('Ghapama Qaghcr', 'Ghapama (Dessert)', 'Гапама (десертная)'),
      description: d('Qaghcr ghapama meghrov ev meyvayin', 'Sweet ghapama with dried fruits, honey and cream', 'Сладкая гапама с сухофруктами, мёдом и сливками'),
      price: 3800, category: 'desserts', sort_order: 15 },

    // ── LEMONADES ─────────────────────────────────────────────────────────────
    { name: n('Tsitrusayin Limonad (1L)', 'Citrus Lemonade (1L)', 'Цитрусовый лимонад (1л)'),
      description: d('Tsitrusayin freshov limonad', 'Freshly squeezed citrus lemonade, 1 litre', 'Свежевыжатый цитрусовый лимонад, 1 литр'),
      price: 3300, category: 'lemonades', sort_order: 1 },

    { name: n('Tsitrusayin Limonad (0.3L)', 'Citrus Lemonade (Glass)', 'Цитрусовый лимонад (стакан)'),
      description: d('Tsitrusayin freshov limonad', 'Freshly squeezed citrus lemonade, glass', 'Свежевыжатый цитрусовый лимонад, стакан'),
      price: 1900, category: 'lemonades', sort_order: 2 },

    { name: n('Hatapamayin Limonad (1L)', 'Berry Lemonade (1L)', 'Ягодный лимонад (1л)'),
      description: d('Hatapamayin freshov limonad', 'Mixed berry lemonade, 1 litre', 'Ягодный лимонад из смеси ягод, 1 литр'),
      price: 3200, category: 'lemonades', sort_order: 3 },

    { name: n('Hatapamayin Limonad (0.3L)', 'Berry Lemonade (Glass)', 'Ягодный лимонад (стакан)'),
      description: d('Hatapamayin freshov limonad', 'Mixed berry lemonade, glass', 'Ягодный лимонад из смеси ягод, стакан'),
      price: 1900, category: 'lemonades', sort_order: 4 },

    { name: n('Mango-Marakuya Limonad (1L)', 'Mango-Maracuya Lemonade (1L)', 'Манго-Маракуйя лимонад (1л)'),
      description: d('Mango marakuyayin limonad', 'Exotic mango and passion fruit lemonade, 1 litre', 'Экзотический лимонад манго и маракуйя, 1 литр'),
      price: 3500, category: 'lemonades', sort_order: 5 },

    { name: n('Mango-Marakuya Limonad (0.3L)', 'Mango-Maracuya Lemonade (Glass)', 'Манго-Маракуйя лимонад (стакан)'),
      description: d('Mango marakuyayin limonad', 'Exotic mango and passion fruit lemonade, glass', 'Экзотический лимонад манго и маракуйя, стакан'),
      price: 2000, category: 'lemonades', sort_order: 6 },

    { name: n('Tarkhuni Limonad (1L)', 'Tarragon Lemonade (1L)', 'Лимонад тархун (1л)'),
      description: d('Tarkhuni ev limonov limonad', 'Classic tarragon lemonade, 1 litre', 'Классический лимонад с тархуном, 1 литр'),
      price: 3200, category: 'lemonades', sort_order: 7 },

    { name: n('Tarkhuni Limonad (0.3L)', 'Tarragon Lemonade (Glass)', 'Лимонад тархун (стакан)'),
      description: d('Tarkhuni ev limonov limonad', 'Classic tarragon lemonade, glass', 'Классический лимонад с тархуном, стакан'),
      price: 1900, category: 'lemonades', sort_order: 8 },

    { name: n('Nana-Limon Limonad (1L)', 'Mint-Lime Lemonade (1L)', 'Мятно-лимонный лимонад (1л)'),
      description: d('Nana ev lime limonad', 'Refreshing mint and lime lemonade, 1 litre', 'Освежающий лимонад с мятой и лаймом, 1 литр'),
      price: 3500, category: 'lemonades', sort_order: 9 },

    { name: n('Nana-Limon Limonad (0.3L)', 'Mint-Lime Lemonade (Glass)', 'Мятно-лимонный лимонад (стакан)'),
      description: d('Nana ev lime limonad', 'Refreshing mint and lime lemonade, glass', 'Освежающий лимонад с мятой и лаймом, стакан'),
      price: 1900, category: 'lemonades', sort_order: 10 },

    // ── COFFEE ────────────────────────────────────────────────────────────────
    { name: n('Arevelyan Surj', 'Oriental Coffee', 'Кофе по-восточному'),
      description: d('Hayakan arevelyan surj', 'Authentic Armenian oriental coffee', 'Настоящий армянский кофе по-восточному'),
      price: 600, category: 'coffee', sort_order: 1 },

    { name: n('Espresso', 'Espresso', 'Эспрессо'),
      description: d('Klklik espresso', 'Classic double espresso shot', 'Классический двойной эспрессо'),
      price: 1000, category: 'coffee', sort_order: 2 },

    { name: n('Amerikano', 'Americano', 'Американо'),
      description: d('Uzvayin amerikanо surj', 'Long black americano', 'Длинный чёрный американо'),
      price: 1000, category: 'coffee', sort_order: 3 },

    { name: n('Kapuchino', 'Cappuccino', 'Капучино'),
      description: d('Kremayov kapuchino', 'Creamy cappuccino with steamed milk foam', 'Кремовый капучино с молочной пенкой'),
      price: 1500, category: 'coffee', sort_order: 4 },

    { name: n('Late', 'Latte', 'Латте'),
      description: d('Khnkhalin khavartakayov late', 'Smooth latte with steamed milk', 'Нежный латте с горячим молоком'),
      price: 1500, category: 'coffee', sort_order: 5 },

    { name: n('Flat White', 'Flat White', 'Флэт Уайт'),
      description: d('Khurats kafeyayin flat white', 'Intense flat white with microfoam', 'Насыщенный флэт уайт с микропенкой'),
      price: 1700, category: 'coffee', sort_order: 6 },

    // ── TEA ───────────────────────────────────────────────────────────────────
    { name: n('Sev/Kanach/Bursakhaghayin They', 'Black/Green/Herbal Tea', 'Чёрный/Зелёный/Травяной чай'),
      description: d('Premium teyayin assorti', 'Premium selection of black, green and herbal teas', 'Премиальная коллекция чёрного, зелёного и травяного чая'),
      price: 1200, category: 'tea', sort_order: 1 },

    { name: n('Nurorayin They', 'Pomegranate Tea', 'Гранатовый чай'),
      description: d('Kayitsrelov nurorayin they', 'Fragrant pomegranate tea, hot or iced', 'Ароматный гранатовый чай, горячий или холодный'),
      price: 2000, category: 'tea', sort_order: 2 },

    // ── SOFT DRINKS ───────────────────────────────────────────────────────────
    { name: n('Halst Jur', 'Still Water', 'Негазированная вода'),
      description: d('Halst mineral jur 0.5L', 'Still mineral water, 500ml', 'Негазированная минеральная вода, 500мл'),
      price: 450, category: 'soft-drinks', sort_order: 1 },

    { name: n('Mineral Jur', 'Mineral Water', 'Минеральная вода'),
      description: d('Gazetavorvats mineral jur 0.5L', 'Sparkling mineral water, 500ml', 'Газированная минеральная вода, 500мл'),
      price: 450, category: 'soft-drinks', sort_order: 2 },

    { name: n('Coca-Cola', 'Coca-Cola', 'Кока-Кола'),
      description: d('Coca-Cola klklik', 'Classic Coca-Cola, 330ml can', 'Классическая Кока-Кола, банка 330мл'),
      price: 450, category: 'soft-drinks', sort_order: 3 },

    { name: n('Fanta', 'Fanta', 'Фанта'),
      description: d('Fanta apelsinayin', 'Fanta orange, 330ml', 'Фанта апельсиновая, 330мл'),
      price: 450, category: 'soft-drinks', sort_order: 4 },

    { name: n('Sprite', 'Sprite', 'Спрайт'),
      description: d('Sprite limonov ev nanayin', 'Sprite lemon-lime, 330ml', 'Спрайт лимон-лайм, 330мл'),
      price: 450, category: 'soft-drinks', sort_order: 5 },

    { name: n('Tan (1L)', 'Tan (1L)', 'Тан (1л)'),
      description: d('Hayakan matsnayin tan 1L', 'Traditional Armenian yogurt drink, 1 litre', 'Традиционный армянский кисломолочный напиток, 1 литр'),
      price: 1300, category: 'soft-drinks', sort_order: 6 },

    { name: n('Tan (Bokat)', 'Tan (Glass)', 'Тан (стакан)'),
      description: d('Hayakan matsnayin tan bokat', 'Traditional Armenian yogurt drink, glass', 'Традиционный армянский кисломолочный напиток, стакан'),
      price: 600, category: 'soft-drinks', sort_order: 7 },

    { name: n('Bnakanin Huts (1L)', 'Natural Juice (1L)', 'Натуральный сок (1л)'),
      description: d('Kayitsrelov bnakanin huts 1L', 'Freshly pressed seasonal fruit juice, 1 litre', 'Свежевыжатый сезонный фруктовый сок, 1 литр'),
      price: 1700, category: 'soft-drinks', sort_order: 8 },

    { name: n('Bnakanin Huts (Bokat)', 'Natural Juice (Glass)', 'Натуральный сок (стакан)'),
      description: d('Kayitsrelov bnakanin huts bokat', 'Freshly pressed seasonal fruit juice, glass', 'Свежевыжатый сезонный фруктовый сок, стакан'),
      price: 900, category: 'soft-drinks', sort_order: 9 },

    { name: n('Nurorayin Huts', 'Pomegranate Juice', 'Гранатовый сок'),
      description: d('Kayitsrelov nurorayin huts', 'Freshly pressed Armenian pomegranate juice', 'Свежевыжатый армянский гранатовый сок'),
      price: 5900, category: 'soft-drinks', sort_order: 10 },

    // ── BEER ──────────────────────────────────────────────────────────────────
    { name: n('Kilikia', 'Kilikia Beer', 'Пиво Киликия'),
      description: d('Hayakan Kilikia garejur', 'Classic Armenian Kilikia lager', 'Классическое армянское пиво Киликия'),
      price: 1100, category: 'beer', sort_order: 1 },

    { name: n('Gyumri', 'Gyumri Beer', 'Пиво Гюмри'),
      description: d('Hayakan Gyumri garejur', 'Armenian Gyumri craft beer', 'Армянское крафтовое пиво Гюмри'),
      price: 1100, category: 'beer', sort_order: 2 },

    { name: n('Alexandrapol', 'Alexandrapol Beer', 'Пиво Александраполь'),
      description: d('Hayakan Alexandrapol garejur', 'Armenian Alexandrapol premium beer', 'Армянское премиальное пиво Александраполь'),
      price: 1100, category: 'beer', sort_order: 3 },

    { name: n('Heineken', 'Heineken', 'Heineken'),
      description: d('Heineken midzijnain garejur', 'Heineken international premium lager', 'Международный премиальный лагер Heineken'),
      price: 1500, category: 'beer', sort_order: 4 },

    { name: n('Corona', 'Corona', 'Corona'),
      description: d('Corona meksikyan garejur limonov', 'Mexican Corona Extra with lime', 'Мексиканская Corona Extra с лаймом'),
      price: 1600, category: 'beer', sort_order: 5 },
  ];

  for (const item of items) {
    await MenuItem.create(item);
  }
  console.log(`Seeded ${items.length} menu items across ${categories.length} categories`);

  // ── MongoDB: Gallery ───────────────────────────────────────────────────────
  await GalleryItem.deleteMany({});
  const galleryItems = [];
  for (let i = 1; i <= 12; i++) {
    galleryItems.push({
      url: `${BASE_IMG}img${i}.jpg`,
      caption: { hy: `Kamancha ${i}`, en: `Kamancha Photo ${i}`, ru: `Фото Каманча ${i}` },
      type: i <= 4 ? 'food' : i <= 8 ? 'interior' : 'events',
      is_active: true,
    });
  }
  await GalleryItem.insertMany(galleryItems);
  console.log('Seeded 12 gallery images');

  // ── MongoDB: Reviews ───────────────────────────────────────────────────────
  await Review.deleteMany({});
  await Review.insertMany([
    { author: 'John S.',    rating: 5, text: 'Best Armenian restaurant in Yerevan! The Khorovats and Assorted Tolma are outstanding. Will definitely return.',          lang: 'en', source: 'tripadvisor', date: new Date('2025-11-15') },
    { author: 'Мария К.',   rating: 5, text: 'Долма просто тает во рту, а хаш — лучший в городе. Атмосфера потрясающая, живая музыка каждый вечер!',                    lang: 'ru', source: 'google',     date: new Date('2025-12-01') },
    { author: 'Արminе Հ.',  rating: 5, text: 'Ճաշատեսակները հրաշալի են, մանավանդ Ղапamamaն ու Ասsorти Толmaն։ Ծarasakutyunner katarelyal!',                              lang: 'hy', source: 'internal',   date: new Date('2025-12-10') },
    { author: 'Pierre D.',  rating: 5, text: 'La meilleure cuisine arménienne ! La Ghapama était un délice absolu et le service impeccable. Je recommande vivement.',     lang: 'fr', source: 'tripadvisor', date: new Date('2025-10-20') },
    { author: 'Sophie W.',  rating: 5, text: 'Das beste armenische Restaurant in Eriwan! Das Lammschulter-Gericht war unglaublich zart. Wundervolle Atmosphäre.',        lang: 'de', source: 'google',     date: new Date('2025-11-05') },
    { author: 'Marco R.',   rating: 4, text: 'Cucina armena autentica di altissimo livello. L\'agnello alla brace e il Panrkhash sono stati memorabili.',                  lang: 'it', source: 'tripadvisor', date: new Date('2026-01-12') },
    { author: 'Carlos M.',  rating: 5, text: 'Increíble experiencia gastronómica. El Kamancha Set y la Ghapama son platos que no se olvidan fácilmente.',                  lang: 'es', source: 'google',     date: new Date('2026-02-03') },
  ]);

  // ── MongoDB: Events ────────────────────────────────────────────────────────
  await Event.deleteMany({});
  const now = new Date();
  await Event.insertMany([
    {
      title:       { hy: 'Ջaz Yereko',   en: 'Jazz Evening',           ru: 'Джазовый вечер'            },
      description: { hy: 'Kendani jaz',  en: 'Live jazz by local musicians every Friday', ru: 'Живой джаз от местных музыкантов каждую пятницу' },
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), time: '20:00', type: 'music',
    },
    {
      title:       { hy: 'Gini Yereko', en: 'Armenian Wine Tasting',   ru: 'Дегустация армянских вин'  },
      description: { hy: 'Sommelieri het hayakan gineri karavor', en: 'Armenian wine tasting with our sommelier — Areni, Kangun and more', ru: 'Дегустация армянских вин с сомелье — Арени, Кангун и другие' },
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), time: '19:00', type: 'special',
    },
    {
      title:       { hy: 'Folk Yereko', en: 'Folk Music Night',        ru: 'Вечер народной музыки'     },
      description: { hy: 'Hayakan folk yev parer', en: 'Traditional Armenian folk music and dance performances', ru: 'Традиционная армянская народная музыка и танцы' },
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), time: '20:30', type: 'music',
    },
    {
      title:       { hy: 'Khash Yereko', en: 'Khash Night',           ru: 'Хашная ночь'               },
      description: { hy: 'Kendani duduk yev khash', en: 'Traditional Armenian khash dinner with live duduk music (seasonal)', ru: 'Традиционный ужин с хашем и живой музыкой на дудуке (сезонное)' },
      date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), time: '19:00', type: 'special',
    },
  ]);

  console.log('Seed completed successfully');
  await disconnectAll();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
