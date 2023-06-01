import { Strategy } from 'passport-local';
import { Users } from '../../models/users.model';
import { AuthService } from '../../services/auth.service';

export const localStrategy = new Strategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user: Users = await Users.findOne({ where: { email } });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      const authService = new AuthService();
      const validate: boolean = await authService.validPasswords(
        email,
        password
      );
      if (!validate) {
        return done(null, false, { message: 'Wrong Password' });
      }
      return done(null, user, { message: 'Logged in Successfully' });
    } catch (err) {
      return done(err);
    }
  }
);
