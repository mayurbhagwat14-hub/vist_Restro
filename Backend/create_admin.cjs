const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function seedAdmin() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI not found in environment');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Dynamically import the ES module FoodAdmin and permissions
        const { FoodAdmin } = await import('./src/core/admin/admin.model.js');
        const { ADMIN_FULL_PERMISSIONS } = await import('./src/constants/permissions.js');

        const email = 'admin@gmail.com';
        const password = 'admin123';

        let admin = await FoodAdmin.findOne({ email });
        if (admin) {
            console.log('Admin already exists, updating password and permissions...');
            admin.password = password;
            admin.role = 'ADMIN';
            admin.adminType = 'super_admin';
            admin.name = 'Super Admin';
            admin.isActive = true;
            admin.isDeleted = false;
            admin.permissions = ADMIN_FULL_PERMISSIONS;
            admin.servicesAccess = ['food', 'quickCommerce', 'taxi'];
            await admin.save();
        } else {
            console.log('Creating new admin...');
            admin = new FoodAdmin({
                email,
                password,
                name: 'Super Admin',
                role: 'ADMIN',
                adminType: 'super_admin',
                isActive: true,
                isDeleted: false,
                permissions: ADMIN_FULL_PERMISSIONS,
                servicesAccess: ['food', 'quickCommerce', 'taxi']
            });
            await admin.save();
        }

        console.log(`Admin seeded successfully: email=${admin.email}, role=${admin.role}, adminType=${admin.adminType}`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seedAdmin();
