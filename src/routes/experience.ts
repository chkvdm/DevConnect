import express, { Router } from 'express';
import passport from 'passport';
import { Context, RouterFactory } from '../interfaces/general';
import { ExperienceController } from '../controllers/ExperienceController';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/users.model';
import { experienceFormValidation } from '../validators/experience.validator';
import {
  validateQueryParams,
  validateIdPathParam,
} from '../validators/urlparametr.validator';

export const makeExperienceRouter: RouterFactory = (context: Context) => {
  const router: Router = express.Router();

  const experienceController = new ExperienceController(context);

  router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    experienceFormValidation,
    roles([UserRole.Admin, UserRole.User]),
    experienceController.addNewExperience
  );

  router.get(
    '/',
    validateQueryParams,
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin]),
    experienceController.getAllExperience
  );

  router.get(
    '/:id',
    validateIdPathParam,
    passport.authenticate('jwt', { session: false }),
    experienceController.getExperienceById
  );

  router.put(
    '/:id',
    validateIdPathParam,
    passport.authenticate('jwt', { session: false }),
    experienceFormValidation,
    roles([UserRole.Admin, UserRole.User]),
    experienceController.updateExperience
  );

  router.delete(
    '/:id',
    validateIdPathParam,
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin, UserRole.User]),
    experienceController.deleteExperience
  );

  return router;
};
