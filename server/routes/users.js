import express from 'express';
import User from '../models/User.js';

const router = express.Router();

function normalizeSkills(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills.map((s) => String(s || '').trim()).filter(Boolean);
  }
  return String(skills)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

router.post('/upsert', async (req, res) => {
  try {
    const skills = normalizeSkills(req.body.skills);
    const email = String(req.body.email || '').toLowerCase().trim();
    const name = String(req.body.name || '').trim();
    const role = String(req.body.role || '').trim().toUpperCase();
    if (!email || !name || !role) {
      return res.status(400).json({ error: 'email, name, and role are required' });
    }
    if (!['MANAGER', 'ENGINEER'].includes(role)) {
      return res.status(400).json({ error: 'role must be MANAGER or ENGINEER' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      existing.name = name;
      existing.role = role;
      existing.active = true;
      existing.skills = skills;
      await existing.save();
      return res.json({ user: existing, action: 'updated' });
    }

    const user = await User.create({
      email,
      name,
      role,
      active: true,
      skills,
    });
    return res.status(201).json({ user, action: 'created' });
  } catch (error) {
    console.error('Upsert user error:', error);
    return res.status(400).json({ error: error.message || 'Failed to upsert user' });
  }
});

// Admin: add or enable engineer for Google auth access
router.post('/engineers/enable', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const nameInput = String(req.body.name || '').trim();
    const skills = normalizeSkills(req.body.skills);
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'ENGINEER';
      existing.active = true;
      if (nameInput) existing.name = nameInput;
      if (skills.length > 0) existing.skills = skills;
      await existing.save();
      return res.json({ user: existing, action: 'enabled' });
    }

    const inferredName = nameInput || email.split('@')[0];
    const created = await User.create({
      email,
      name: inferredName,
      role: 'ENGINEER',
      active: true,
      skills,
    });
    return res.status(201).json({ user: created, action: 'created' });
  } catch (error) {
    console.error('Enable engineer error:', error);
    return res.status(400).json({ error: error.message || 'Failed to enable engineer' });
  }
});

// Create user (pre-register for login)
router.post('/', async (req, res) => {
  try {
    const { email, name, role } = req.body;
    const skills = normalizeSkills(req.body.skills);
    if (!email || !name || !role) {
      return res.status(400).json({ error: 'email, name, and role are required' });
    }
    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    const user = new User({
      email: String(email).toLowerCase().trim(),
      name: String(name).trim(),
      role,
      active: true,
      skills,
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deactivate / reactivate user
router.patch('/:id/active', async (req, res) => {
  try {
    const { active } = req.body;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { active }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/:id/role', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.body.role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('User update error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/skills', async (req, res) => {
  try {
    const skills = normalizeSkills(req.body.skills);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { skills },
      { new: true },
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('User skill update error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
