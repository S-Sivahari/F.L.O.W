import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not defined in environment variables');
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 Cluster:', mongoUri.split('@')[1]?.split('/')[0] || 'unknown');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });
    
    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  Connection refused. Common causes:');
      console.error('   1. MongoDB Atlas cluster is paused or not running');
      console.error('   2. Your IP is not whitelisted in MongoDB Atlas');
      console.error('   3. Network/firewall blocking the connection');
      console.error('\n📝 To fix:');
      console.error('   1. Go to https://cloud.mongodb.com/');
      console.error('   2. Check if cluster "flow-cluster" is active (not paused)');
      console.error('   3. In Network Access, add your IP address (or 0.0.0.0/0 for all)');
      console.error('   4. Wait a few minutes for changes to propagate');
    }
    
    throw error;
  }
}

export function disconnectDB() {
  return mongoose.disconnect();
}
