import passport from 'passport';
import { Loader } from '../interfaces/general';
import { localStrategy } from '../auth/strategies/local';
import { jwtStrategy } from '../auth/strategies/jwt';

export const loadPassport: Loader = () => {
  passport.use('login', localStrategy);
  passport.use('jwt', jwtStrategy);
};
