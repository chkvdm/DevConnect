import express from 'express';
import { Context } from '../interfaces/general';
import { makeAuthRouter } from '../routes/auth';
import { makeUsersRouter } from '../routes/users';
import { makeExperienceRouter } from '../routes/experience';
import { makeProjectsRouter } from '../routes/projects';
import { makeFeedbacksRouter } from '../routes/feedbacks';
import { makeCvRouter } from '../routes/cv';

export const loadRoutes = (app: express.Router, context: Context) => {
  app.use('/api/auth', makeAuthRouter(context));
  app.use('/api/users', makeUsersRouter(context));
  app.use('/api/experience', makeExperienceRouter(context));
  app.use('/api/feedback', makeFeedbacksRouter(context));
  app.use('/api/projects', makeProjectsRouter(context));
  app.use('/api/user', makeCvRouter(context));
};
