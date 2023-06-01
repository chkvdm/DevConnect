import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import path from 'path';
import { Context } from '../interfaces/general';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/users.model';
import { HttpException } from '../middleware/errorhandler';

export class AuthController {
  private authService: AuthService;

  constructor(context: Context) {
    this.authService = context.services.authService;
  }

  public registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Validating registration form
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }

      // getting a candidates parameters from the request body
      const { firstName, lastName, title, summary, email, password } = req.body;

      // Cheking the candidate's email for uniqueness
      const candidateEmailIsUniq: boolean =
        await this.authService.checkUniqEmail(email);
      if (!candidateEmailIsUniq) {
        return res.status(400).json({ message: 'This email already exists' });
      }

      // Hashing the candidate password
      const hashedPassword: string = await this.authService.hashPassword(
        password
      );

      // Creting new user
      const id = uuidv4();
      const role = UserRole.User;
      let image = path.join(__dirname, '..', '..', 'public', 'default.png');
      if (req.file) {
        image = req.file.path;
      }

      const newUser = await this.authService.register(
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
        image: newUser.image,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };
}
