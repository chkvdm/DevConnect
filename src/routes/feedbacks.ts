import express, { Router } from 'express';
import passport from 'passport';
import { Context, RouterFactory } from '../interfaces/general';
import { FeedbacksController } from '../controllers/FeedbacksController';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/users.model';
import { feedbackFormValidation } from '../validators/feedback.validator';
import {
  validateQueryParams,
  validateIdPathParam,
} from '../validators/urlparametr.validator';

export const makeFeedbacksRouter: RouterFactory = (context: Context) => {
  const router: Router = express.Router();

  const feedbacksController = new FeedbacksController(context);

  router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    feedbackFormValidation,
    roles([UserRole.Admin, UserRole.User]),
    feedbacksController.addNewFeedback
  );

  router.get(
    '/',
    validateQueryParams,
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin]),
    feedbacksController.getAllFeedbacks
  );

  router.get(
    '/:id',
    validateIdPathParam,
    passport.authenticate('jwt', { session: false }),
    feedbacksController.getFeedbackById
  );

  router.put(
    '/:id',
    validateIdPathParam,
    passport.authenticate('jwt', { session: false }),
    feedbackFormValidation,
    roles([UserRole.Admin, UserRole.User]),
    feedbacksController.updateFeedback
  );

  router.delete(
    '/:id',
    validateIdPathParam,
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin, UserRole.User]),
    feedbacksController.deleteFeedback
  );

  return router;
};
