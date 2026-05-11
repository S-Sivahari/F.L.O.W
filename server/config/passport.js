import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/User.js';
import LoginAttempt from '../models/LoginAttempt.js';

/** Pre-approved Google accounts (always allowed; role enforced on each login). */
const HARDCODED_ROLE_BY_EMAIL = {
  [process.env.ADMIN_EMAIL]: process.env.ADMIN_ROLE,
};

function findUserByEmailInsensitive(email) {
  const normalized = email.trim().toLowerCase();
  return User.findOne({
    $expr: { $eq: [{ $toLower: '$email' }, normalized] },
  });
}

async function logAttempt({ email, status, reason, req }) {
  try {
    await LoginAttempt.create({
      email: String(email || '').toLowerCase().trim(),
      status,
      reason: reason || null,
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (error) {
    console.error('Login attempt log error:', error.message);
  }
}

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const googleEmail = profile.emails?.[0]?.value?.trim();
        if (!googleEmail) {
          await logAttempt({
            email: googleEmail,
            status: 'BLOCKED',
            reason: 'Missing Google email',
            req,
          });
          return done(null, false, { message: 'Email not authorized' });
        }

        const normalizedEmail = googleEmail.toLowerCase();
        const hardcodedRole = HARDCODED_ROLE_BY_EMAIL[normalizedEmail];

        let user = await findUserByEmailInsensitive(googleEmail);

        if (!user && hardcodedRole) {
          user = await User.create({
            email: normalizedEmail,
            name: profile.displayName?.trim() || normalizedEmail.split('@')[0],
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
            role: hardcodedRole,
            active: true,
          });
          await logAttempt({
            email: normalizedEmail,
            status: 'ALLOWED',
            reason: `Hardcoded ${hardcodedRole}`,
            req,
          });
          return done(null, user);
        }

        if (!user) {
          await logAttempt({
            email: normalizedEmail,
            status: 'BLOCKED',
            reason: 'Email not pre-registered',
            req,
          });
          return done(null, false, { message: 'Email not authorized' });
        }

        if (user.active === false) {
          await logAttempt({
            email: normalizedEmail,
            status: 'BLOCKED',
            reason: 'User deactivated',
            req,
          });
          return done(null, false, { message: 'User account is deactivated' });
        }

        user.googleId = profile.id;
        user.avatar = profile.photos?.[0]?.value;
        if (hardcodedRole && user.role !== hardcodedRole) {
          user.role = hardcodedRole;
        }
        await user.save();
        await logAttempt({
          email: normalizedEmail,
          status: 'ALLOWED',
          reason: `Role ${user.role}`,
          req,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
