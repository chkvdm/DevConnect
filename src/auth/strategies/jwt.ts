import dotenv from 'dotenv';
import { Strategy, ExtractJwt } from 'passport-jwt';

dotenv.config();

export const jwtStrategy = new Strategy(
  {
    secretOrKey: process.env.SECRET_KEY,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  async (token, done) => {
    try {
      return done(null, token.id);
    } catch (err) {
      return done(err);
    }
  }
);
