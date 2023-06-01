// eslint-disable-next-line import/no-extraneous-dependencies
import makeStoppable, { StoppableServer } from 'stoppable';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { logger } from './middleware/logger';
import { loadApp } from './loaders/app';

dotenv.config();

export default async (): Promise<StoppableServer> => {
  const { app, stop } = await loadApp();

  const server = makeStoppable(createServer(app));
  server.listen(process.env.EXPPORT, () => {
    logger.info(`Express server started`);
  });

  server.on('close', async () => {
    try {
      stop();
    } catch (err) {
      logger.error(err);
    }
  });

  return server;
};
