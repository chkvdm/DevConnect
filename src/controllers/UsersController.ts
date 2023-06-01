// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import path from 'path';
import { Context } from '../interfaces/general';
import { UsersService } from '../services/users.service';
import { CacheService } from '../services/cache.service';
import { HttpException } from '../middleware/errorhandler';

export class UsersController {
  private usersService: UsersService;

  private cacheService: CacheService;

  constructor(context: Context) {
    this.usersService = context.services.usersService;
    this.cacheService = context.services.cacheService;
  }

  // add new user by administrator
  public registerUserByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<unknown> => {
    try {
      // Validate user form
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }

      // Get a candidates parameters from the request body
      const { firstName, lastName, title, summary, email, password, role } =
        req.body;

      // Check the candidate's email for uniqueness
      const candidateEmailIsUniq = await this.usersService.checkUniqEmail(
        email
      );
      if (!candidateEmailIsUniq) {
        return res.status(400).json({ message: 'This email already exists' });
      }

      // Candidate password hashing
      const hashedPassword = await this.usersService.hashPassword(password);

      // Creting new user
      const id: string = uuidv4();

      let image: string = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'default.png'
      );
      if (req.file) {
        image = req.file.path;
      }
      const newUser = await this.usersService.register(
        id,
        firstName,
        lastName,
        image,
        title,
        summary,
        role,
        email,
        hashedPassword
      );
      return res.status(201).json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        title: newUser.title,
        summary: newUser.summary,
        email: newUser.email,
        role: newUser.role,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // getting an array of all users
  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageSize, page } = req.query;
      const offset: number = (Number(page) - 1) * Number(pageSize);
      const { count, rows } = await this.usersService.findAllUsers(
        Number(pageSize),
        offset
      );
      res.set('X-Total-Count', count.toString());
      const arrayToReturn: Array<object> = [];
      rows.filter((el) =>
        arrayToReturn.push({
          id: el.id,
          firstName: el.firstName,
          lastName: el.lastName,
          title: el.title,
          summary: el.summary,
          email: el.email,
          role: el.role,
        })
      );
      return res.status(200).json(arrayToReturn);
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // getting user by id
  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const user = await this.usersService.findUserById(id);
      if (user === null) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        title: user.title,
        summary: user.summary,
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // update user profile by id
  public updateUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Validate user form
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }
      const { id } = req.params;

      // check if there is a profile to update
      const user = await this.usersService.findUserById(id);
      if (user === null) {
        return res.status(404).json({ message: 'User not found' });
      }
      const dataFromReq = req.body;

      // Check the candidate's email for uniqueness if the email is updated
      if (dataFromReq.email) {
        const updateEmailDuplicate = await this.usersService.checkUniqEmail(
          dataFromReq.email
        );
        if (!updateEmailDuplicate) {
          return res.status(400).json({ message: 'This email already exists' });
        }
      }

      // Hash password if the user update ones
      if (dataFromReq.password) {
        const hashedPassword = await this.usersService.hashPassword(
          dataFromReq.password
        );
        dataFromReq.password = hashedPassword;
      }

      // Check if the user uploaded a new image
      if (req.file) {
        dataFromReq.image = req.file.path;
      }

      await this.usersService.updateUserData(id, dataFromReq);

      // delete old image
      const imageName = await this.usersService.avatarName(user.image);
      if (!(imageName === 'default.png')) {
        await this.usersService.oldImageDelete(user.image);
      }

      // clean redis cache
      await this.cacheService.del(id);

      const updateUser = await this.usersService.findUserById(id);

      return res.status(200).json({
        id: updateUser.id,
        firstName: updateUser.firstName,
        lastName: updateUser.lastName,
        title: updateUser.title,
        summary: updateUser.summary,
        email: updateUser.email,
        role: updateUser.role,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // delete user by id
  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const user = await this.usersService.findUserById(id);
      if (user === null) {
        return res.status(404).json({ message: 'User not found' });
      }
      await this.usersService.deleteUserById(id);

      // clean redis cache
      await this.cacheService.del(id);

      // delete old image
      const imageName = await this.usersService.avatarName(user.image);
      if (!(imageName === 'default.png')) {
        await this.usersService.oldImageDelete(user.image);
      }

      return res.status(204).end();
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };
}
