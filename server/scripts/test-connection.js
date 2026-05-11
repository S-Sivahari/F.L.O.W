import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '..', '.env') });

console.log('\n🔍 F.L.O.W Database Connection Test');
console.log('====================================\n');

async function testConnection() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('📍 MongoDB URI (hidden for security)');
    console.log(`   Cluster: ${mongoUri.includes('@') ? mongoUri.split('@')[1]?.split('/')[0] : 'unknown'}\n`);

    console.log('🔄 Attempting connection...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
    });

    console.log('✅ Connection successful!\n');

    // Test database operations
    const db = mongoose.connection;
    console.log('📊 Database Info:');
    console.log(`   - Default Database: ${db.name}`);
    console.log(`   - Connection State: ${db.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`   - Host: ${db.host}\n`);

    // List collections
    const collections = await db.listCollections();
    console.log('📦 Existing Collections:');
    if (collections.length === 0) {
      console.log('   (None - database is empty)\n');
    } else {
      collections.forEach((col) => console.log(`   - ${col.name}`));
      console.log('');
    }

    console.log('✅ All tests passed! Your database connection is working.\n');
    console.log('Next steps:');
    console.log('1. Run: npm run seed (in server folder) to populate with sample data');
    console.log('2. Start the server: npm run dev');
    console.log('3. Frontend should now work with database!\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error:', error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('connection')) {
      console.error('\n⚠️  Troubleshooting Guide:');
      console.error('1. Check MongoDB Atlas Status:');
      console.error('   - Go to: https://cloud.mongodb.com/');
      console.error('   - Find your cluster (flow-cluster)');
      console.error('   - Ensure it\'s ACTIVE (not paused)');
      console.error('   - If paused, click "Resume"');
      console.error('\n2. Check IP Whitelist:');
      console.error('   - In MongoDB Atlas → Network Access');
      console.error('   - Add your current IP address');
      console.error('   - Or allow 0.0.0.0/0 for development');
      console.error('\n3. Verify credentials in .env:');
      console.error('   - Username and password are correct');
      console.error('   - Special characters are properly encoded');
      console.error('\n4. Wait a few minutes for changes to propagate');
    }

    process.exit(1);
  }
}

testConnection();
