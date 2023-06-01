import express from 'express';
import redis from 'redis';
import { loadMiddlewares } from './middlewares';
import { loadRoutes } from './routes';
import { loadContext } from './context';
import { loadModels } from './models';
import { loadSequelize } from './sequelize';
import { config } from '../config';
import { loadPassport } from './passport';
import { logger } from '../middleware/logger';

export const loadApp = async () => {
  const app = express();
  const sequelize = loadSequelize(config);

  loadModels(sequelize);

  const dependencies = {
    redisClient: redis.createClient(),
  };

  const context = await loadContext(dependencies);

  loadPassport(app, context);
  loadMiddlewares(app, context);
  loadRoutes(app, context);

  const stop = async () => {
    try {
      dependencies.redisClient.quit();
      await sequelize.close();
    } catch (err) {
      logger.info(err);
    }
  };

  // Handling 404
  app.use((req, res, next) => {
    res.status(404).send('Sorry, cant find that url');
  });

  return { app, context, stop };
};
