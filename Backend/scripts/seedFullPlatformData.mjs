import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://vist:vist123@cluster0.rpm32xh.mongodb.net/vist';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB successfully.');

  const db = mongoose.connection.db;

  // 1. Check or Ensure Active Zone
  let zone = await db.collection('food_zones').findOne({ name: 'All India' });
  if (!zone) {
    const zoneRes = await db.collection('food_zones').insertOne({
      name: 'All India',
      status: 'active',
      coordinates: [
        [70.0, 20.0],
        [85.0, 20.0],
        [85.0, 35.0],
        [70.0, 35.0],
        [70.0, 20.0]
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    zone = { _id: zoneRes.insertedId };
    console.log('Created zone "All India":', zone._id);
  } else {
    console.log('Existing zone "All India":', zone._id);
  }

  // 2. Check or Ensure Restaurant
  let restaurant = await db.collection('food_restaurants').findOne({ restaurantName: 'VIST RESTAURANT' });
  if (!restaurant) {
    const restRes = await db.collection('food_restaurants').insertOne({
      restaurantName: 'VIST RESTAURANT',
      ownerName: 'VIST Admin',
      ownerPhone: '8766556836',
      ownerEmail: 'vist.restro@gmail.com',
      status: 'approved',
      isOpen: true,
      isAvailable: true,
      active: true,
      zoneId: zone._id,
      location: {
        type: 'Point',
        coordinates: [75.5489, 30.3819],
        latitude: 30.3819,
        longitude: 75.5489,
        formattedAddress: 'Near Geeta Bhawan, Barnala, Punjab 148101, India',
        address: 'Near Geeta Bhawan, Barnala, Punjab, India',
        city: 'Barnala',
        state: 'Punjab',
        pincode: '148101'
      },
      rating: 4.8,
      ratingCount: 128,
      commissionRate: 15,
      deliveryTimeMin: 20,
      deliveryTimeMax: 35,
      minimumOrder: 99,
      cuisine: ['North Indian', 'Continental', 'Beverages', 'Fast Food'],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    restaurant = await db.collection('food_restaurants').findOne({ _id: restRes.insertedId });
    console.log('Created VIST RESTAURANT:', restaurant._id);
  } else {
    // Ensure it is approved, open, and active
    await db.collection('food_restaurants').updateOne(
      { _id: restaurant._id },
      {
        $set: {
          status: 'approved',
          isOpen: true,
          isAvailable: true,
          active: true,
          zoneId: zone._id,
          'location.coordinates': [75.5489, 30.3819],
          'location.latitude': 30.3819,
          'location.longitude': 75.5489
        }
      }
    );
    console.log('Updated VIST RESTAURANT to approved and open:', restaurant._id);
  }

  // 3. Ensure all food items are linked to VIST RESTAURANT and marked available & approved
  const itemsUpdateRes = await db.collection('food_items').updateMany(
    {},
    {
      $set: {
        restaurantId: restaurant._id,
        isAvailable: true,
        approvalStatus: 'approved'
      }
    }
  );
  console.log(`Updated ${itemsUpdateRes.modifiedCount} food items linked to restaurant ${restaurant._id}`);

  // Fetch some food items for sample orders
  const foodItems = await db.collection('food_items').find({ isAvailable: true }).limit(10).toArray();
  console.log(`Loaded ${foodItems.length} food items for sample orders`);

  // 4. Ensure Users have valid default delivery addresses with coordinates
  const users = await db.collection('food_users').find({}).toArray();
  console.log(`Found ${users.length} users`);

  for (const user of users) {
    const existingAddresses = Array.isArray(user.addresses) ? user.addresses : [];
    if (existingAddresses.length === 0 || !existingAddresses[0].location?.coordinates) {
      // Add a valid default address located near Barnala (approx 1 km from restaurant)
      const userAddress = {
        _id: new mongoose.Types.ObjectId(),
        label: 'Home',
        fullName: user.name || 'Valued Customer',
        phone: user.phone || '9999999999',
        street: 'Street No. 3, College Road',
        additionalDetails: 'Near City Park',
        city: 'Barnala',
        state: 'Punjab',
        zipCode: '148101',
        location: {
          type: 'Point',
          coordinates: [75.5520, 30.3840]
        },
        latitude: 30.3840,
        longitude: 75.5520,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('food_users').updateOne(
        { _id: user._id },
        {
          $set: {
            addresses: [userAddress],
            isActive: true
          }
        }
      );
      console.log(`Added valid delivery address for user ${user.name || user.phone} (${user._id})`);
    }
  }

  // 5. Seed Delivery Partners (Active, Approved, Online Riders)
  const existingPartners = await db.collection('food_delivery_partners').find({}).toArray();
  let partnerIds = existingPartners.map(p => p._id);

  if (existingPartners.length === 0) {
    const samplePartners = [
      {
        name: 'Harpreet Singh',
        phone: '9876500001',
        email: 'harpreet.delivery@vist.com',
        status: 'approved',
        availabilityStatus: 'online',
        vehicleType: 'bike',
        vehicleNumber: 'PB 19 AB 4582',
        city: 'Barnala',
        state: 'Punjab',
        address: 'Geeta Bhawan Chowk, Barnala',
        zoneId: zone._id,
        rating: 4.9,
        ratingCount: 84,
        completedOrders: 112,
        activeOrders: 0,
        lastLat: 30.3825,
        lastLng: 75.5495,
        lastLocation: {
          type: 'Point',
          coordinates: [75.5495, 30.3825]
        },
        lastLocationAt: new Date(),
        createdAt: new Date(Date.now() - 30 * 86400000),
        updatedAt: new Date()
      },
      {
        name: 'Gurmeet Sharma',
        phone: '9876500002',
        email: 'gurmeet.delivery@vist.com',
        status: 'approved',
        availabilityStatus: 'online',
        vehicleType: 'scooter',
        vehicleNumber: 'PB 19 CD 7712',
        city: 'Barnala',
        state: 'Punjab',
        address: 'Kachehri Road, Barnala',
        zoneId: zone._id,
        rating: 4.8,
        ratingCount: 62,
        completedOrders: 79,
        activeOrders: 0,
        lastLat: 30.3810,
        lastLng: 75.5475,
        lastLocation: {
          type: 'Point',
          coordinates: [75.5475, 30.3810]
        },
        lastLocationAt: new Date(),
        createdAt: new Date(Date.now() - 20 * 86400000),
        updatedAt: new Date()
      },
      {
        name: 'Aman Deep',
        phone: '9876500003',
        email: 'amandeep.delivery@vist.com',
        status: 'approved',
        availabilityStatus: 'online',
        vehicleType: 'bike',
        vehicleNumber: 'PB 19 EF 9021',
        city: 'Barnala',
        state: 'Punjab',
        address: 'Railway Station Road, Barnala',
        zoneId: zone._id,
        rating: 4.7,
        ratingCount: 45,
        completedOrders: 58,
        activeOrders: 0,
        lastLat: 30.3830,
        lastLng: 75.5510,
        lastLocation: {
          type: 'Point',
          coordinates: [75.5510, 30.3830]
        },
        lastLocationAt: new Date(),
        createdAt: new Date(Date.now() - 15 * 86400000),
        updatedAt: new Date()
      }
    ];

    const partnerRes = await db.collection('food_delivery_partners').insertMany(samplePartners);
    partnerIds = Object.values(partnerRes.insertedIds);
    console.log(`Created ${partnerIds.length} approved online delivery partners`);
  } else {
    // Ensure existing partners are approved and online
    await db.collection('food_delivery_partners').updateMany(
      {},
      {
        $set: {
          status: 'approved',
          availabilityStatus: 'online',
          zoneId: zone._id,
          lastLat: 30.3820,
          lastLng: 75.5490,
          lastLocation: {
            type: 'Point',
            coordinates: [75.5490, 30.3820]
          }
        }
      }
    );
    console.log(`Verified ${existingPartners.length} delivery partners as approved and online`);
  }

  // 6. Seed Active Offers & Coupons in food_offers
  const existingOffers = await db.collection('food_offers').find({}).toArray();
  if (existingOffers.length === 0) {
    const sampleOffers = [
      {
        couponCode: 'FIRST50',
        discountType: 'percentage',
        discountValue: 50,
        customerScope: 'all',
        restaurantScope: 'all',
        moduleType: 'food',
        minOrderValue: 200,
        maxDiscount: 150,
        usageLimit: 1000,
        perUserLimit: 1,
        usedCount: 14,
        isFirstOrderOnly: false,
        startDate: new Date(Date.now() - 30 * 86400000),
        endDate: new Date(Date.now() + 90 * 86400000),
        status: 'active',
        showInCart: true,
        createdByRole: 'ADMIN',
        adminBearPercentage: 100,
        restaurantBearPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        couponCode: 'BDAY20',
        discountType: 'percentage',
        discountValue: 20,
        customerScope: 'all',
        restaurantScope: 'all',
        moduleType: 'food',
        minOrderValue: 150,
        maxDiscount: 200,
        usageLimit: 500,
        perUserLimit: 2,
        usedCount: 28,
        isFirstOrderOnly: false,
        startDate: new Date(Date.now() - 30 * 86400000),
        endDate: new Date(Date.now() + 180 * 86400000),
        status: 'active',
        showInCart: true,
        createdByRole: 'ADMIN',
        adminBearPercentage: 100,
        restaurantBearPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        couponCode: 'VIST100',
        discountType: 'flat-price',
        discountValue: 100,
        customerScope: 'all',
        restaurantScope: 'all',
        moduleType: 'food',
        minOrderValue: 399,
        maxDiscount: 100,
        usageLimit: 500,
        perUserLimit: 5,
        usedCount: 35,
        isFirstOrderOnly: false,
        startDate: new Date(Date.now() - 30 * 86400000),
        endDate: new Date(Date.now() + 180 * 86400000),
        status: 'active',
        showInCart: true,
        createdByRole: 'ADMIN',
        adminBearPercentage: 100,
        restaurantBearPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        couponCode: 'WELCOME',
        discountType: 'percentage',
        discountValue: 15,
        customerScope: 'all',
        restaurantScope: 'all',
        moduleType: 'food',
        minOrderValue: 100,
        maxDiscount: 75,
        usageLimit: 2000,
        perUserLimit: 3,
        usedCount: 88,
        isFirstOrderOnly: false,
        startDate: new Date(Date.now() - 30 * 86400000),
        endDate: new Date(Date.now() + 365 * 86400000),
        status: 'active',
        showInCart: true,
        createdByRole: 'ADMIN',
        adminBearPercentage: 100,
        restaurantBearPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('food_offers').insertMany(sampleOffers);
    console.log(`Created ${sampleOffers.length} active coupons in food_offers`);
  } else {
    // Ensure existing coupons are active
    await db.collection('food_offers').updateMany({}, { $set: { status: 'active', showInCart: true } });
    console.log(`Verified ${existingOffers.length} coupons as active`);
  }

  // 7. Seed Sample Orders across all statuses
  const existingOrdersCount = await db.collection('food_orders').countDocuments();
  console.log(`Current orders in food_orders: ${existingOrdersCount}`);

  if (existingOrdersCount < 10 && foodItems.length > 0 && users.length > 0 && partnerIds.length > 0) {
    const primaryUser = users.find(u => u.phone === '8766556836') || users[0];
    const secondUser = users.find(u => u.phone === '9999999999') || users[1] || users[0];

    const userAddr = primaryUser.addresses?.[0] || {
      label: 'Home',
      fullName: primaryUser.name || 'Customer',
      phone: primaryUser.phone || '8766556836',
      street: 'Near City Park, College Road',
      city: 'Barnala',
      state: 'Punjab',
      zipCode: '148101',
      location: { type: 'Point', coordinates: [75.5520, 30.3840] }
    };

    const statuses = [
      { status: 'delivered', daysAgo: 4, payMethod: 'razorpay', payStatus: 'paid' },
      { status: 'delivered', daysAgo: 3, payMethod: 'cash', payStatus: 'paid' },
      { status: 'delivered', daysAgo: 2, payMethod: 'wallet', payStatus: 'paid' },
      { status: 'delivered', daysAgo: 1, payMethod: 'razorpay', payStatus: 'paid' },
      { status: 'delivered', daysAgo: 0.5, payMethod: 'cash', payStatus: 'paid' },
      { status: 'ready_for_pickup', daysAgo: 0.05, payMethod: 'cash', payStatus: 'cod_pending' },
      { status: 'preparing', daysAgo: 0.03, payMethod: 'razorpay', payStatus: 'paid' },
      { status: 'confirmed', daysAgo: 0.02, payMethod: 'cash', payStatus: 'cod_pending' },
      { status: 'created', daysAgo: 0.01, payMethod: 'cash', payStatus: 'cod_pending' },
      { status: 'cancelled_by_user', daysAgo: 2.5, payMethod: 'cash', payStatus: 'cod_pending' }
    ];

    const sampleOrders = [];
    let counter = 1001;

    for (const s of statuses) {
      const orderIdNumber = `FOD-${counter++}`;
      const item1 = foodItems[Math.floor(Math.random() * foodItems.length)];
      const item2 = foodItems[Math.floor(Math.random() * foodItems.length)];

      const q1 = Math.floor(Math.random() * 2) + 1;
      const q2 = Math.floor(Math.random() * 2) + 1;
      const p1 = Number(item1.price) || 99;
      const p2 = Number(item2.price) || 149;
      const subtotal = (p1 * q1) + (p2 * q2);
      const deliveryFee = 30;
      const platformFee = 5;
      const discount = s.payMethod === 'razorpay' ? 20 : 0;
      const total = subtotal + deliveryFee + platformFee - discount;
      const orderDate = new Date(Date.now() - s.daysAgo * 86400000);
      const assignedPartner = partnerIds[Math.floor(Math.random() * partnerIds.length)];

      const orderItems = [
        {
          restaurantId: restaurant._id,
          restaurantName: 'VIST RESTAURANT',
          itemId: String(item1._id),
          name: item1.name,
          price: p1,
          quantity: q1,
          isVeg: item1.foodType === 'Veg',
          image: item1.image || ''
        }
      ];

      if (String(item1._id) !== String(item2._id)) {
        orderItems.push({
          restaurantId: restaurant._id,
          restaurantName: 'VIST RESTAURANT',
          itemId: String(item2._id),
          name: item2.name,
          price: p2,
          quantity: q2,
          isVeg: item2.foodType === 'Veg',
          image: item2.image || ''
        });
      }

      sampleOrders.push({
        order_id: orderIdNumber,
        orderId: orderIdNumber,
        userId: Math.random() > 0.5 ? primaryUser._id : secondUser._id,
        restaurantId: restaurant._id,
        restaurantIds: [restaurant._id],
        moduleType: 'food',
        zoneId: zone._id,
        items: orderItems,
        deliveryAddress: {
          label: userAddr.label || 'Home',
          name: userAddr.fullName || 'Customer',
          fullName: userAddr.fullName || 'Customer',
          street: userAddr.street,
          city: userAddr.city,
          state: userAddr.state,
          zipCode: userAddr.zipCode || '148101',
          phone: userAddr.phone || '9999999999',
          location: {
            type: 'Point',
            coordinates: userAddr.location?.coordinates || [75.5520, 30.3840]
          }
        },
        deliveryDistance: 1.2,
        deliveryLatitude: 30.3840,
        deliveryLongitude: 75.5520,
        originLatitude: 30.3819,
        originLongitude: 75.5489,
        originAddress: 'Near Geeta Bhawan, Barnala, Punjab',
        customerName: primaryUser.name || 'Customer',
        customerPhone: primaryUser.phone || '9999999999',
        pricing: {
          subtotal,
          tax: 0,
          packagingFee: 0,
          deliveryFee,
          platformFee,
          discount,
          couponCode: discount > 0 ? 'BDAY20' : null,
          total,
          currency: 'INR'
        },
        payment: {
          method: s.payMethod,
          status: s.payStatus,
          amountDue: s.payStatus === 'paid' ? 0 : total
        },
        orderStatus: s.status,
        dispatch: {
          deliveryPartnerId: s.status === 'created' ? null : assignedPartner
        },
        deliveryState: {
          status: s.status === 'delivered' ? 'delivered' : s.status === 'ready_for_pickup' ? 'picked_up' : 'assigned'
        },
        statusHistory: [
          { at: orderDate, byRole: 'USER', from: '', to: 'created', note: 'Order placed' },
          { at: new Date(orderDate.getTime() + 60000), byRole: 'RESTAURANT', from: 'created', to: 'confirmed', note: 'Kitchen accepted' }
        ],
        riderEarning: 25,
        total,
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    const insertedOrders = await db.collection('food_orders').insertMany(sampleOrders);
    console.log(`Seeded ${insertedOrders.insertedCount} sample orders across all statuses!`);
  }

  // 8. Clean up duplicate / dismissed inbox notifications in food_notifications
  // Remove dismissed notifications so inbox is crisp and clear
  const cleanDismissed = await db.collection('food_notifications').deleteMany({
    dismissedAt: { $ne: null }
  });
  console.log(`Cleaned ${cleanDismissed.deletedCount} old dismissed food_notifications`);

  console.log('Seeding and database optimization complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
