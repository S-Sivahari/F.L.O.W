import User from '../models/User.js';

const SEED_USERS = [
  {
    name: 'Engineer User',
    email: 'engineer@example.com',
    role: 'ENGINEER',
  },
  {
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'MANAGER',
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
  },
];

export async function seedUsers() {
  try {
    console.log('📋 Checking seed users...');
    
    for (const userData of SEED_USERS) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const newUser = new User({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          googleId: null,
          avatar: null,
        });
        await newUser.save();
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`✓ User already exists: ${userData.email}`);
      }
    }
    
    console.log('✅ Seed users check completed');
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
}
