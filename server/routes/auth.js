import express from 'express';
import passport from '../config/passport.js';
import LoginAttempt from '../models/LoginAttempt.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=unauthorized` }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

router.get('/me', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
    active: req.user.active,
  });
});

router.post('/logout', (req, res) => {
  req.logout((error) => {
    if (error) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

router.get('/login-attempts', async (req, res) => {
  try {
    const attempts = await LoginAttempt.find().sort({ createdAt: -1 }).limit(200);
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
