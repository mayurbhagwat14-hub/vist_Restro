const mongoose = require('../node_modules/mongoose');
const path = require('path');
require('../node_modules/dotenv').config({ path: path.join(__dirname, '..', '.env') });

const secondRestaurantData = {
  restaurantName: "ROYAL VISIT DINING",
  restaurantNameNormalized: "royal visit dining",
  ownerName: "Royal Vist Hospitality",
  ownerEmail: "royal@vistrestaurant.com",
  ownerPhone: "9841400099",
  ownerPhoneDigits: "9841400099",
  ownerPhoneLast10: "9841400099",
  primaryContactNumber: "01679235999",
  pureVegRestaurant: true,
  restaurantType: "Veg",
  area: "Heritage Market",
  city: "Barnala",
  state: "Punjab",
  pincode: "148101",
  landmark: "Opposite Town Hall",
  location: {
    type: "Point",
    coordinates: [75.5510, 30.3830],
    latitude: 30.3830,
    longitude: 75.5510,
    formattedAddress: "Heritage Market, Opposite Town Hall, Barnala, Punjab 148101, India",
    address: "Heritage Market, Barnala, Punjab, India",
    area: "Heritage Market",
    city: "Barnala",
    state: "Punjab",
    pincode: "148101",
    landmark: "Opposite Town Hall"
  },
  cuisines: [
    "North Indian",
    "Mughlai",
    "Tandoori Special",
    "Biryani & Kebabs",
    "Desserts"
  ],
  openingTime: "08:00 AM",
  closingTime: "11:30 PM",
  openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  isAcceptingOrders: true,
  profileImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
  coverImages: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80"
  ],
  coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
  image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
  menuImages: ["/vist-dining-banner.jpg"],
  estimatedDeliveryTime: "25-30 mins",
  estimatedDeliveryTimeMinutes: 25,
  rating: 4.9,
  totalRatings: 940,
  featuredDish: "Royal Shahi Paneer",
  featuredPrice: 289,
  offer: "20% OFF UP TO ₹100 | USE: ROYAL20",
  status: "approved",
  approvalStatus: "approved",
  isActive: true,
  active: true,
  isAvailable: true,
  isOpen: true,
  approvedAt: new Date(),
  zoneId: "6ae1dceb4b86b199a4c91060", // Same All India Zone
  diningSettings: {
    isEnabled: true,
    maxGuests: 16,
    diningType: ["family-dining", "fine-dining", "royal-thali"],
    mealPeriods: ["breakfast", "lunch", "dinner"]
  }
};

const foodItemsToSeed = [
  {
    categoryName: "NORTH INDIAN MAIN COURSE",
    name: "Royal Shahi Paneer",
    description: "Cottage cheese simmered in a velvety rich cashew, tomato, and saffron infused gravy.",
    price: 289,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    preparationTime: "20 mins",
    isRecommended: true
  },
  {
    categoryName: "NORTH INDIAN MAIN COURSE",
    name: "Dal Vist Special Bukhara",
    description: "Slow-cooked black lentils simmered overnight with butter, cream, and gentle spices.",
    price: 249,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    preparationTime: "15 mins",
    isRecommended: true
  },
  {
    categoryName: "STARTERS & TIKKAS",
    name: "Paneer Malai Tikka",
    description: "Tender paneer cubes marinated in rich clotted cream, cardamom, and roasted in clay oven.",
    price: 269,
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
    preparationTime: "18 mins",
    isRecommended: true
  },
  {
    categoryName: "RICE & BIRYANI",
    name: "Hyderabadi Veg Dum Biryani",
    description: "Fragrant basmati rice layered with garden vegetables, saffron milk, and aromatic spices.",
    price: 259,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    preparationTime: "25 mins",
    isRecommended: true
  },
  {
    categoryName: "TANDOORI BREADS",
    name: "Garlic Butter Naan",
    description: "Traditional leavened bread brushed with melted garlic butter and fresh coriander.",
    price: 65,
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
    preparationTime: "10 mins",
    isRecommended: false
  },
  {
    categoryName: "TANDOORI BREADS",
    name: "Amritsari Chur Chur Naan Thali",
    description: "Crispy flaky stuffed naan served with Pindi chole, boondi raita, and pickled onions.",
    price: 219,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    preparationTime: "15 mins",
    isRecommended: true
  },
  {
    categoryName: "DESSERTS & SWEETS",
    name: "Kesari Rasmalai (2 Pcs)",
    description: "Soft cottage cheese patties immersed in chilled condensed milk infused with saffron and pistachios.",
    price: 120,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    preparationTime: "5 mins",
    isRecommended: true
  },
  {
    categoryName: "REFRESHERS & COOLERS",
    name: "Royal Kesar Pista Lassi",
    description: "Thick, creamy Punjabi sweet lassi infused with saffron strands and crushed dry fruits.",
    price: 99,
    image: "https://images.unsplash.com/photo-1571006682893-b1c71c19c62e?w=600&auto=format&fit=crop&q=80",
    preparationTime: "5 mins",
    isRecommended: false
  }
];

async function seedSecondRestaurant() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;
    const restColl = db.collection('food_restaurants');
    const catColl = db.collection('food_categories');
    const foodColl = db.collection('food_items');

    // 1. Create or update second restaurant
    let existing = await restColl.findOne({ restaurantNameNormalized: secondRestaurantData.restaurantNameNormalized });
    let restaurantId;
    if (existing) {
      await restColl.updateOne(
        { _id: existing._id },
        { $set: { ...secondRestaurantData, updatedAt: new Date() } }
      );
      restaurantId = existing._id;
      console.log(`Updated second restaurant: ${secondRestaurantData.restaurantName} (ID: ${restaurantId})`);
    } else {
      const res = await restColl.insertOne({
        ...secondRestaurantData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      restaurantId = res.insertedId;
      console.log(`Created second restaurant: ${secondRestaurantData.restaurantName} (ID: ${restaurantId})`);
    }

    // 2. Fetch categories map
    const allCats = await catColl.find({}).toArray();
    const catMap = new Map();
    allCats.forEach(c => {
      catMap.set(c.name.trim().toUpperCase(), c._id);
    });

    // 3. Seed foods for second restaurant
    let foodCount = 0;
    for (const item of foodItemsToSeed) {
      const categoryId = catMap.get(item.categoryName.trim().toUpperCase()) || allCats[0]?._id;

      const foodDoc = {
        restaurantId: restaurantId,
        categoryId: categoryId,
        categoryName: item.categoryName,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        foodType: 'Veg',
        isAvailable: true,
        isRecommended: item.isRecommended,
        preparationTime: item.preparationTime,
        quantity: 100,
        approvalStatus: 'approved',
        updatedAt: new Date()
      };

      const existingFood = await foodColl.findOne({
        restaurantId: restaurantId,
        name: item.name
      });

      if (existingFood) {
        await foodColl.updateOne({ _id: existingFood._id }, { $set: foodDoc });
      } else {
        foodDoc.createdAt = new Date();
        await foodColl.insertOne(foodDoc);
      }
      foodCount++;
      console.log(`✓ Seeded dish: "${item.name}" (Price: ₹${item.price})`);
    }

    console.log(`\nSuccessfully seeded "${secondRestaurantData.restaurantName}" with ${foodCount} approved dishes!`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSecondRestaurant();
