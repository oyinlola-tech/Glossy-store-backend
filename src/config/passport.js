const passport = require('passport');
const { User, SocialAccount } = require('../models');
const { generateToken } = require('../utils/jwtHelper');

const socialProviders = {
  google: false,
  apple: false,
};

const findOrCreateSocialUser = async ({ provider, providerId, email, name }) => {
  let social = await SocialAccount.findOne({
    where: { provider, provider_id: providerId },
    include: [{ model: User }],
  });

  if (social && social.User) {
    return social.User;
  }

  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({
      email,
      name: name || email.split('@')[0],
      email_verified: true,
    });
  }

  await SocialAccount.findOrCreate({
    where: { provider, provider_id: providerId },
    defaults: { user_id: user.id },
  });

  return user;
};

try {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Google profile does not include an email address'));
        }
        const user = await findOrCreateSocialUser({
          provider: 'google',
          providerId: profile.id,
          email,
          name: profile.displayName,
        });
        const token = generateToken(user);
        return done(null, { user, token });
      } catch (err) {
        return done(err);
      }
    }));
    socialProviders.google = true;
  }
} catch (err) {
  // Dependency is optional during local development until OAuth is configured.
}

try {
  const AppleStrategy = require('passport-apple').Strategy;
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
    passport.use(new AppleStrategy({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyString: process.env.APPLE_PRIVATE_KEY,
      callbackURL: '/api/auth/apple/callback',
      passReqToCallback: false,
    }, async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        const email = profile?.email || idToken?.email;
        if (!email) {
          return done(new Error('Apple profile does not include an email address'));
        }
        const appleId = profile?.id || idToken?.sub;
        const user = await findOrCreateSocialUser({
          provider: 'apple',
          providerId: appleId,
          email,
          name: profile?.name || email.split('@')[0],
        });
        const token = generateToken(user);
        return done(null, { user, token });
      } catch (err) {
        return done(err);
      }
    }));
    socialProviders.apple = true;
  }
} catch (err) {
  // Dependency is optional during local development until OAuth is configured.
}

passport.socialProviders = socialProviders;

module.exports = passport;
