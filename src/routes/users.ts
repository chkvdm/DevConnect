import express, { Router } from 'express';
import passport from 'passport';
import { Context, RouterFactory } from '../interfaces/general';
import { UsersController } from '../controllers/UsersController';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/users.model';
import { upload } from '../middleware/multer';
import { userFormValidation } from '../validators/user.validator';
import {
  validateQueryParams,
  validatePathUserParam,
} from '../validators/urlparametr.validator';

export const makeUsersRouter: RouterFactory = (context: Context) => {
  const router: Router = express.Router();

  const usersController = new UsersController(context);

  router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin]),
    upload.single('image'),
    userFormValidation,
    usersController.registerUserByAdmin
  );

  router.get(
    '/',
    validateQueryParams,
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin]),
    usersController.getAllUsers
  );

  router.get(
    '/:id',
    validatePathUserParam,
    passport.authenticate('jwt', { session: false }),
    usersController.getUserById
  );

  router.put(
    '/:id',
    validatePathUserParam,
    passport.authenticate('jwt', { session: false }),
    roles([], true),
    upload.single('image'),
    userFormValidation,
    usersController.updateUserProfile
  );

  router.delete(
    '/:id',
    validatePathUserParam,
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin], true),
    usersController.deleteUser
  );

  return router;
};
