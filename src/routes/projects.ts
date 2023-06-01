import express, { Router } from 'express';
import passport from 'passport';
import { Context, RouterFactory } from '../interfaces/general';
import { ProjectsController } from '../controllers/ProjectsController';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/users.model';
import { upload } from '../middleware/multer';
import { projectFormValidation } from '../validators/project.validator';
import {
  validateQueryParams,
  validateIdPathParam,
} from '../validators/urlparametr.validator';

export const makeProjectsRouter: RouterFactory = (context: Context) => {
  const router: Router = express.Router();

  const projectsController = new ProjectsController(context);

  router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin, UserRole.User]),
    upload.single('image'),
    projectFormValidation,
    projectsController.addNewProject
  );

  router.get(
    '/',
    validateQueryParams,
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin]),
    projectsController.getAllProjects
  );

  router.get(
    '/:id',
    validateIdPathParam,
    passport.authenticate('jwt', { session: false }),
    projectsController.getProjectById
  );

  router.put(
    '/:id',
    validateIdPathParam,
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin, UserRole.User]),
    upload.single('image'),
    projectFormValidation,
    projectsController.updateProject
  );

  router.delete(
    '/:id',
    validateIdPathParam,
    passport.authenticate('jwt', { session: false }),
    roles([UserRole.Admin, UserRole.User]),
    projectsController.deleteProject
  );

  return router;
};
