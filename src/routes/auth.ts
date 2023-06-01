import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import express, { Router } from 'express';
import passport from 'passport';
import { validationResult } from 'express-validator';
import { upload } from '../middleware/multer';
import { Context, RouterFactory } from '../interfaces/general';
import { AuthController } from '../controllers/AuthController';
import { authFormValidation } from '../validators/auth.validator';
import { Users } from '../models/users.model';

dotenv.config();

export const makeAuthRouter: RouterFactory = (context: Context) => {
  const router: Router = express.Router();

  const authController = new AuthController(context);

  router.post(
    '/register',
    upload.single('image'),
    authFormValidation,
    authController.registerUser
  );

  router.post(
    '/login',
    upload.none(),
    authFormValidation,
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }
      passport.authenticate(
        'login',
        async (error: Error, user: Users | false, info: unknown) => {
          try {
            if (error) {
              return next(error);
            }
            if (!user) {
              return res.status(400).json(info);
            }
            const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
            return res.status(200).json({
              user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                title: user.title,
                summary: user.summary,
                email: user.email,
                image: user.image,
              },
              token,
            });
          } catch (err) {
            return next(err);
          }
        }
      )(req, res, next);
      return undefined;
    }
  );
  return router;
};
