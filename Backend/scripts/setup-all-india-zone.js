import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in Backend/.env');
  process.exit(1);
}

await mongoose.connect(uri);
console.log('Connected to MongoDB');

// 1. Setup All India Zone Polygon (covers entire India bounding box)
// Coordinates: North 38.0, South 6.0, West 67.0, East 98.0
const allIndiaCoords = [
  { latitude: 38.0, longitude: 67.0 },
  { latitude: 38.0, longitude: 98.0 },
  { latitude: 6.0, longitude: 98.0 },
  { latitude: 6.0, longitude: 67.0 },
  { latitude: 38.0, longitude: 67.0 }
];

let zone = await mongoose.connection.collection('food_zones').findOne({ name: 'All India' });
let zoneId;
if (!zone) {
  const result = await mongoose.connection.collection('food_zones').insertOne({
    name: 'All India',
    zoneName: 'India',
    country: 'India',
    serviceLocation: 'All India (PAN India Service)',
    unit: 'kilometer',
    coordinates: allIndiaCoords,
    latitude: 20.5937,
    longitude: 78.9629,
    address: 'India',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  zoneId = result.insertedId;
  console.log('Created All India Zone with ID:', zoneId);
} else {
  zoneId = zone._id;
  await mongoose.connection.collection('food_zones').updateOne(
    { _id: zone._id },
    {
      $set: {
        isActive: true,
        coordinates: allIndiaCoords,
        country: 'India',
        serviceLocation: 'All India (PAN India Service)',
        updatedAt: new Date()
      }
    }
  );
  console.log('Updated existing All India Zone with ID:', zoneId);
}

// 2. Enable globalFoodServiceEnabled in FoodBusinessSettings
const settingsRes = await mongoose.connection.collection('food_business_settings').updateOne(
  {},
  { $set: { globalFoodServiceEnabled: true, updatedAt: new Date() } },
  { upsert: true }
);
console.log('Enabled globalFoodServiceEnabled in business settings');

// 3. Update all restaurants to be active, approved, and linked to All India Zone
const restUpdate = await mongoose.connection.collection('food_restaurants').updateMany(
  {},
  {
    $set: {
      zoneId: zoneId,
      isActive: true,
      isAcceptingOrders: true,
      status: 'approved',
      approvalStatus: 'approved'
    }
  }
);
console.log(`Updated ${restUpdate.modifiedCount} restaurant(s) to All India Zone, active & approved`);

// 4. Update food items and categories to ensure no zone blockage
const catUpdate = await mongoose.connection.collection('food_categories').updateMany(
  {},
  { $set: { isActive: true } }
);
console.log(`Updated ${catUpdate.modifiedCount} categories to active`);

// 5. Update items to approved & in-stock
const itemUpdate = await mongoose.connection.collection('food_items').updateMany(
  {},
  { $set: { approvalStatus: 'approved', inStock: true } }
);
console.log(`Updated ${itemUpdate.modifiedCount} items to approved & in stock`);

console.log('SUCCESS: All India PAN-India zone configuration complete!');
await mongoose.disconnect();
