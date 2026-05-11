import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/User.js';

/** Pre-approved Google accounts (always allowed; role enforced on each login). */
const HARDCODED_ROLE_BY_EMAIL = {
  'kirthana.llm@gmail.com': 'ADMIN',
  'saroswetasasi@gmail.com': 'MANAGER',
};

function findUserByEmailInsensitive(email) {
  const normalized = email.trim().toLowerCase();
  return User.findOne({
    $expr: { $eq: [{ $toLower: '$email' }, normalized] },
  });
}

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleEmail = profile.emails?.[0]?.value?.trim();
        if (!googleEmail) {
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
          return done(null, user);
        }

        if (!user) {
          return done(null, false, { message: 'Email not authorized' });
        }

        if (user.active === false) {
          return done(null, false, { message: 'User account is deactivated' });
        }

        user.googleId = profile.id;
        user.avatar = profile.photos?.[0]?.value;
        if (hardcodedRole && user.role !== hardcodedRole) {
          user.role = hardcodedRole;
        }
        await user.save();

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
