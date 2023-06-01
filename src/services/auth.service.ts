import bcrypt from 'bcrypt';
// eslint-disable-next-line import/no-cycle
import { UserRole, Users } from '../models/users.model';

export class AuthService {
  private readonly usersModel: typeof Users;

  constructor() {
    this.usersModel = Users;
  }

  public async checkUniqEmail(email: string): Promise<boolean> {
    const data = await this.usersModel.findOne({ where: { email } });
    if (!data) {
      return true;
    }
    return false;
  }

  // method that generates a salt, hashes the password and returns it
  // eslint-disable-next-line class-methods-use-this
  public async hashPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(7);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  public async validPasswords(email: string, password: string) {
    const user = await this.usersModel.findOne({ where: { email } });
    const unHashedPassword = await bcrypt.compare(password, user.password);
    return unHashedPassword;
  }

  public async register(
    id: string,
    firstName: string,
    lastName: string,
    image: string,
    title: string,
    summary: string,
    role: UserRole,
    email: string,
    password: string
  ): Promise<Users> {
    const newUser = await this.usersModel.create({
      id,
      firstName,
      lastName,
      image,
      title,
      summary,
      role,
      email,
      password,
    });
    return newUser;
  }
}
