import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

// Verify environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Environment variables not loaded. Check .env file.');
  console.error('Expected .env at:', path.join(rootDir, '.env'));
  console.error('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
  console.error('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
  process.exit(1);
}

// Start server with dynamic imports
(async () => {
  // Dynamic imports to ensure dotenv is loaded first
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;
  const session = (await import('express-session')).default;
  const passport = (await import('./config/passport.js')).default;
  const { connectDB } = await import('./config/database.js');

  // Routes
  const authRoutes = (await import('./routes/auth.js')).default;
  const blocksRoutes = (await import('./routes/blocks.js')).default;
  const assignmentsRoutes = (await import('./routes/assignments.js')).default;
  const approvalsRoutes = (await import('./routes/approvals.js')).default;
  const effortRoutes = (await import('./routes/effort.js')).default;
  const usersRoutes = (await import('./routes/users.js')).default;
  const workflowLogsRoutes = (await import('./routes/workflow-logs.js')).default;

  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'flow-dev-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/blocks', blocksRoutes);
  app.use('/api/assignments', assignmentsRoutes);
  app.use('/api/approvals', approvalsRoutes);
  app.use('/api/effort', effortRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/workflow-logs', workflowLogsRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('🚨 Global error handler:', err);
    res.status(err.status || 500).json({ 
      error: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Connect to MongoDB and start server
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

export default {};
