import bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
// eslint-disable-next-line import/no-cycle
import { UserRole, Users } from '../models/users.model';

export class UsersService {
  private readonly usersModel: typeof Users;

  constructor() {
    this.usersModel = Users;
  }

  public async findAllUsers(
    limit: number,
    offset: number
  ): Promise<{ count: number; rows: Array<Users> }> {
    const data = await this.usersModel.findAndCountAll({
      limit,
      offset,
    });
    return data;
  }

  public async findUserById(id: string): Promise<Users> {
    const data = await this.usersModel.findOne({ where: { id } });
    return data;
  }

  public async deleteUserById(id: string): Promise<Users> {
    await this.usersModel.destroy({ where: { id } });
    return null;
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

  public async updateUserData(id: string, newData: object) {
    await this.usersModel.update(newData, { where: { id } });
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  public async avatarName(filePath: string) {
    return filePath.split('\\').pop().split('/').pop();
  }

  // eslint-disable-next-line class-methods-use-this
  public async oldImageDelete(oldImagePath: string) {
    await fs.unlink(oldImagePath);
  }
}
