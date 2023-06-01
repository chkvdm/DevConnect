import express, { Router } from 'express';
import passport from 'passport';
import { Context, RouterFactory } from '../interfaces/general';
import { CvController } from '../controllers/CvController';
import { validatePathCvParam } from '../validators/urlparametr.validator';

export const makeCvRouter: RouterFactory = (context: Context) => {
  const router: Router = express.Router();

  const cvController = new CvController(context);

  router.get(
    '/:userId/cv',
    validatePathCvParam,
    passport.authenticate('jwt', { session: false }),
    cvController.getUserCv
  );

  return router;
};
