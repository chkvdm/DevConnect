// eslint-disable-next-line import/no-extraneous-dependencies
import expressRequestId from 'express-request-id';
import passport from 'passport';
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../middleware/errorhandler';
import { urlLogger } from '../middleware/logger';
import { Loader } from '../interfaces/general';

export const loadMiddlewares: Loader = (app) => {
  app.use(expressRequestId());

  app.use(urlLogger);

  app.use(cors());

  app.use(passport.initialize());

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(errorMiddleware);
};
