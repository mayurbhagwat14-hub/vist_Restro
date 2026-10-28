const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const restaurantData = {
  restaurantName: "VIST RESTAURANT",
  restaurantNameNormalized: "vist restaurant",
  ownerName: "VIST Management",
  ownerEmail: "contact@vistrestaurant.com",
  ownerPhone: "9841400089",
  ownerPhoneDigits: "9841400089",
  ownerPhoneLast10: "9841400089",
  primaryContactNumber: "01679235689",
  pureVegRestaurant: true,
  restaurantType: "Veg",
  area: "Near Geeta Bhawan",
  city: "Barnala",
  state: "Punjab",
  pincode: "148101",
  landmark: "Near Geeta Bhawan",
  location: {
    type: "Point",
    coordinates: [75.5489, 30.3819],
    latitude: 30.3819,
    longitude: 75.5489,
    formattedAddress: "Near Geeta Bhawan, Barnala, Punjab 148101, India",
    address: "Near Geeta Bhawan, Barnala, Punjab, India",
    area: "Near Geeta Bhawan",
    city: "Barnala",
    state: "Punjab",
    pincode: "148101",
    landmark: "Near Geeta Bhawan"
  },
  cuisines: [
    "North Indian",
    "Chinese",
    "Continental",
    "Beverages",
    "Desserts",
    "Vegetarian Fine Dining"
  ],
  openingTime: "07:30 AM",
  closingTime: "11:00 PM",
  openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  isAcceptingOrders: true,
  profileImage: "https://res.cloudinary.com/wyq6essh/image/upload/v1793190391/food/restaurants/og5ncqsfmic7js8g2hb1.webp",
  coverImages: [
    "https://res.cloudinary.com/wyq6essh/image/upload/v1793190392/food/restaurants/ipic3pgzlcjziz5plovx.webp"
  ],
  menuImages: ["https://res.cloudinary.com/wyq6essh/image/upload/v1793190392/food/restaurants/ipic3pgzlcjziz5plovx.webp"],
  estimatedDeliveryTime: "30-35 mins",
  estimatedDeliveryTimeMinutes: 30,
  rating: 4.8,
  totalRatings: 1250,
  featuredDish: "Visit's Dal Makhani",
  featuredPrice: 269,
  offer: "Fine Dining Experience Since 1996",
  status: "approved",
  approvedAt: new Date(),
  diningSettings: {
    isEnabled: true,
    maxGuests: 12,
    diningType: ["family-dining", "fine-dining"],
    mealPeriods: ["breakfast", "lunch", "dinner"]
  }
};

const categories = [
  {
    name: "HOT BEVERAGES",
    sortOrder: 1,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Special Masala Chai",
        price: 49,
        description: "Authentic spiced tea infused with cardamom, crushed ginger, and aromatic Indian herbs.",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "10 mins"
      },
      {
        name: "Brewed Filter Coffee",
        price: 69,
        description: "Rich, aromatic South Indian style decoction coffee served with frothy hot milk.",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "10 mins"
      },
      {
        name: "Honey Ginger Lemon Green Tea",
        price: 59,
        description: "Soothing warm organic green tea infused with pure honey, fresh ginger, and lemon.",
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "8 mins"
      },
      {
        name: "Rich Belgian Hot Chocolate",
        price: 129,
        description: "Decadent melted dark chocolate blended with warm creamy milk, topped with chocolate drizzle.",
        image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "10 mins"
      }
    ]
  },
  {
    name: "REFRESHERS & COOLERS",
    sortOrder: 2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Fresh Lime Soda",
        price: 79,
        description: "Crisp sparkling soda with freshly squeezed lime, rock salt, and mint essence.",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "5 mins"
      },
      {
        name: "Lemon Iced Tea",
        price: 99,
        description: "Chilled Ceylon tea with a zesty splash of fresh citrus and crushed ice.",
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "5 mins"
      },
      {
        name: "Mint Masala Shikanji",
        price: 89,
        description: "Desi spiced lemonade prepared with roasted cumin, mint leaves, and black rock salt.",
        image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "5 mins"
      }
    ]
  },
  {
    name: "MOCKTAILS",
    sortOrder: 3,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Virgin Mojito",
        price: 129,
        description: "Fresh garden mint leaves and lime wedges muddled with cane sugar, topped with sparkling fizz.",
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "8 mins"
      },
      {
        name: "Blue Ocean Lagoon",
        price: 139,
        description: "Vibrant curaçao syrup, lemon juice, and sparkling soda layered over crushed ice.",
        image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "8 mins"
      },
      {
        name: "Sunset Fruit Punch",
        price: 149,
        description: "Harmonious blend of fresh orange, pineapple, and mango juices with a hint of grenadine.",
        image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "8 mins"
      }
    ]
  },
  {
    name: "SHAKES & SMOOTHIES",
    sortOrder: 4,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Belgian Chocolate Thick Shake",
        price: 159,
        description: "Ultra-thick chocolate milkshake made with Belgian cocoa, cream, and crunchy chocolate shavings.",
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "10 mins"
      },
      {
        name: "Alphonso Mango Shake",
        price: 169,
        description: "Seasonal delight prepared with authentic Ratnagiri Alphonso pulp and vanilla ice cream.",
        image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "10 mins"
      },
      {
        name: "Oreo KitKat Overload Shake",
        price: 179,
        description: "Loaded shake with crushed Oreo cookies, crisp KitKat wafers, and whipped cream topping.",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "10 mins"
      },
      {
        name: "Fresh Strawberry Shake",
        price: 159,
        description: "Creamy hand-spun strawberry shake blended with real fruit compote.",
        image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "10 mins"
      }
    ]
  },
  {
    name: "BREAKFAST & BRUNCH",
    sortOrder: 5,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Amritsari Stuffed Kulcha with Chole",
        price: 159,
        description: "Crispy layered tandoori kulcha stuffed with spiced potatoes and paneer, served with pindi chole and butter.",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      },
      {
        name: "Punjabi Paneer Paratha",
        price: 129,
        description: "Whole wheat griddled paratha generously stuffed with grated paneer and herbs, served with curd & pickle.",
        image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      },
      {
        name: "Delhi Special Chole Bhature",
        price: 169,
        description: "Puffed golden bhaturas paired with authentic slow-cooked spicy chickpea curry and pickled onions.",
        image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      },
      {
        name: "Indori Masala Poha",
        price: 89,
        description: "Light and nutritious flattened rice tempered with mustard, curry leaves, onions, and crispy peanuts.",
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "10 mins"
      }
    ]
  },
  {
    name: "SOUPS & BROTHS",
    sortOrder: 6,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Cream of Tomato Soup",
        price: 119,
        description: "Velvety roasted red tomato soup finished with fresh cream, served with golden bread croutons.",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "12 mins"
      },
      {
        name: "Veg Manchow Soup",
        price: 129,
        description: "Spicy and tangy Indo-Chinese soup with finely chopped seasonal vegetables, topped with crispy fried noodles.",
        image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "12 mins"
      },
      {
        name: "Sweet Corn Veg Soup",
        price: 119,
        description: "Delicate comforting broth packed with sweet golden corn kernels and tender garden veggies.",
        image: "https://images.unsplash.com/photo-1578874691223-a4558a4369a0?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "12 mins"
      },
      {
        name: "Hot & Sour Veg Soup",
        price: 129,
        description: "Spicy dark broth infused with crushed pepper, vinegar, soy sauce, and diced black mushrooms.",
        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "12 mins"
      }
    ]
  },
  {
    name: "STARTERS & TIKKAS",
    sortOrder: 7,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Paneer Tikka Angaarey",
        price: 259,
        description: "Juicy cottage cheese cubes marinated in pungent mustard-yogurt spices, skewered and charred over clay tandoor.",
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Malai Soya Chaap",
        price: 239,
        description: "Tender soya chaap rolls bathed in cashew paste, thick cream, and mild green cardamom, grilled to smoky softness.",
        image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Tandoori Stuffed Mushrooms",
        price: 249,
        description: "Whole button mushrooms stuffed with spiced cheese and spinach, charcoal roasted with aromatic herbs.",
        image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Hara Bhara Kebab",
        price: 219,
        description: "Pan-seared spinach, green pea, and paneer patties spiced with royal garam masala.",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      },
      {
        name: "Crispy Corn Salt & Pepper",
        price: 199,
        description: "Tender sweet corn batter-fried to golden crunch, tossed with fresh garlic, pepper, and spring onions.",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      }
    ]
  },
  {
    name: "CRISPY CHINESE",
    sortOrder: 8,
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Chilli Paneer Dry",
        price: 249,
        description: "Wok-tossed battered paneer cubes with sliced bell peppers, red chillies, and savory dark soy glaze.",
        image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "18 mins"
      },
      {
        name: "Veg Manchurian Dry",
        price: 219,
        description: "Crispy minced vegetable balls tossed in garlic, ginger, green chillies, and light soy sauce.",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "18 mins"
      },
      {
        name: "Crispy Spring Rolls",
        price: 189,
        description: "Golden fried pastry rolls stuffed with wok-tossed julienne vegetables and glass noodles, served with sweet chilli dip.",
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      },
      {
        name: "Honey Chilli Potato",
        price: 199,
        description: "Crispy fried potato fingers coated in a sticky honey and red chilli glaze, garnished with toasted sesame seeds.",
        image: "https://images.unsplash.com/photo-1518013034458-30b0ee243591?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      }
    ]
  },
  {
    name: "CHINESE MAINS & NOODLES",
    sortOrder: 9,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Veg Hakka Noodles",
        price: 199,
        description: "Classic street-style noodles tossed in high wok with shredded cabbage, capsicum, carrots, and light soy seasoning.",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      },
      {
        name: "Schezwan Fried Rice",
        price: 209,
        description: "Steamed long-grain basmati rice wok-tossed with spicy in-house Schezwan sauce and garden vegetables.",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      },
      {
        name: "Chilli Garlic Noodles",
        price: 209,
        description: "Spicy aromatic noodles bursting with the flavours of roasted golden garlic and dry red chillies.",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      },
      {
        name: "Veg Manchurian in Gravy",
        price: 229,
        description: "Soft vegetable dumplings immersed in a rich, dark garlic-soy gravy, ideal pairing with fried rice.",
        image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "18 mins"
      }
    ]
  },
  {
    name: "NORTH INDIAN MAIN COURSE",
    sortOrder: 10,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "VIST's Signature Dal Makhani",
        price: 269,
        description: "Our legendary recipe: Whole black lentils slow-simmered overnight over charcoal with white butter and cream.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Paneer Butter Masala",
        price: 289,
        description: "Soft cottage cheese chunks cooked in rich creamy tomato, butter, and cashew nut gravy.",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Kadhai Paneer Peshawari",
        price: 279,
        description: "Cottage cheese and crisp bell peppers stir-fried in a rich tomato gravy spiced with hand-ground coriander and red chillies.",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Malai Kofta Royal",
        price: 299,
        description: "Melt-in-mouth cottage cheese and dried fruit dumplings served in an exquisite white cashew-cardamom gravy.",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Palak Paneer Desi Ghee",
        price: 269,
        description: "Fresh spinach leaves pureed and tempered with garlic, finished with pure desi ghee and fresh paneer cubes.",
        image: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Yellow Dal Double Tadka",
        price: 219,
        description: "Arhar lentils boiled with turmeric, tempered twice with cumin, garlic, and whole red chillies in desi ghee.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "15 mins"
      }
    ]
  },
  {
    name: "TANDOORI BREADS",
    sortOrder: 11,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Butter Naan",
        price: 55,
        description: "Soft, fluffy leavened white flour bread baked inside tandoor and brushed generously with butter.",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "8 mins"
      },
      {
        name: "Garlic Butter Naan",
        price: 65,
        description: "Fluffy naan infused with minced garlic and fresh coriander, baked crisp in clay oven.",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "8 mins"
      },
      {
        name: "Laccha Paratha Tandoori",
        price: 50,
        description: "Multi-layered whole wheat flatbread made with desi ghee and cooked to golden crispness.",
        image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "8 mins"
      },
      {
        name: "Tandoori Roti with Butter",
        price: 25,
        description: "Classic healthy whole wheat Indian bread baked in clay tandoor, finished with a dab of butter.",
        image: "https://images.unsplash.com/photo-1505253758473-96b301b5c81d?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "5 mins"
      }
    ]
  },
  {
    name: "RICE & BIRYANI",
    sortOrder: 12,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Hyderabadi Dum Veg Biryani",
        price: 259,
        description: "Aromatic aged basmati rice cooked on dum with marinated vegetables, saffron milk, and fried onions, served with cooling raita.",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Paneer Tikka Biryani",
        price: 279,
        description: "Charcoal-smoked paneer tikka chunks layered with spiced basmati rice and royal biryani spices.",
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "20 mins"
      },
      {
        name: "Jeera Basmati Rice",
        price: 149,
        description: "Fluffy steamed long-grain basmati rice tempered with roasted cumin seeds and fresh coriander.",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "12 mins"
      }
    ]
  },
  {
    name: "DESSERTS & SWEETS",
    sortOrder: 13,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&h=600&q=80",
    items: [
      {
        name: "Warm Gulab Jamun with Ice Cream",
        price: 99,
        description: "Two warm khoya dumplings soaked in fragrant rose-cardamom syrup, served alongside creamy vanilla ice cream.",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "8 mins"
      },
      {
        name: "Sizzling Chocolate Brownie",
        price: 159,
        description: "Decadent warm walnut brownie served on a cast-iron sizzler plate with vanilla scoop and hot chocolate fudge.",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "10 mins"
      },
      {
        name: "Royal Kesar Rasmalai (2 Pcs)",
        price: 119,
        description: "Soft spongy cottage cheese discs soaked in sweetened saffron-cardamom clotted milk, garnished with pistachios.",
        image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&h=600&q=80",
        preparationTime: "5 mins"
      }
    ]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    const db = mongoose.connection.db;
    const restColl = db.collection('food_restaurants');
    const catColl = db.collection('food_categories');
    const foodColl = db.collection('food_items');

    // 1. Seed or Update Restaurant: "VIST RESTAURANT"
    console.log('\n--- 1. Seeding Restaurant ---');
    let restDoc = await restColl.findOne({ restaurantNameNormalized: restaurantData.restaurantNameNormalized });
    let restaurantId;
    if (restDoc) {
      await restColl.updateOne({ _id: restDoc._id }, { $set: restaurantData });
      restaurantId = restDoc._id;
      console.log(`Updated Restaurant: "${restaurantData.restaurantName}" (ID: ${restaurantId})`);
    } else {
      const res = await restColl.insertOne({ ...restaurantData, createdAt: new Date() });
      restaurantId = res.insertedId;
      console.log(`Created Restaurant: "${restaurantData.restaurantName}" (ID: ${restaurantId})`);
    }

    // 2. Clear old test categories like "main"
    await catColl.deleteMany({ name: "main" });

    // 3. Seed Categories as Global (restaurantId: null) so they display on user home & categories page
    console.log('\n--- 2. Seeding Categories ---');
    const catMap = new Map();
    let totalItems = 0;

    for (const cat of categories) {
      const catPayload = {
        name: cat.name,
        sortOrder: cat.sortOrder,
        image: cat.image,
        foodTypeScope: 'Veg',
        restaurantId: null,
        createdByRestaurantId: restaurantId,
        isApproved: true,
        approvalStatus: 'approved',
        isActive: true,
        updatedAt: new Date()
      };

      let existingCat = await catColl.findOne({ name: cat.name });
      let catId;
      if (existingCat) {
        await catColl.updateOne({ _id: existingCat._id }, { $set: catPayload });
        catId = existingCat._id;
      } else {
        catPayload.createdAt = new Date();
        const res = await catColl.insertOne(catPayload);
        catId = res.insertedId;
      }
      catMap.set(cat.name, catId);
      console.log(`✓ Category: "${cat.name}" (ID: ${catId})`);

      // 4. Seed Foods for this category
      for (const item of cat.items) {
        const foodPayload = {
          restaurantId: restaurantId,
          categoryId: catId,
          categoryName: cat.name,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          foodType: 'Veg',
          isAvailable: true,
          isRecommended: item.price >= 200,
          preparationTime: item.preparationTime || '15 mins',
          quantity: 100,
          approvalStatus: 'approved',
          updatedAt: new Date()
        };

        const existingFood = await foodColl.findOne({
          restaurantId: restaurantId,
          name: item.name
        });

        if (existingFood) {
          await foodColl.updateOne({ _id: existingFood._id }, { $set: foodPayload });
        } else {
          foodPayload.createdAt = new Date();
          await foodColl.insertOne(foodPayload);
        }
        totalItems++;
      }
    }

    console.log(`\n✓ Total Categories Seeded: ${categories.length}`);
    console.log(`✓ Total Food Items Seeded: ${totalItems}`);
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
