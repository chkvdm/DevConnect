import { Sequelize } from 'sequelize';
import { logger } from '../middleware/logger';
import { Config } from '../config';

export const loadSequelize = (config: Config): Sequelize => {
  const sequelize = new Sequelize({ dialect: 'mysql', ...config.db });

  sequelize
    .authenticate()
    .then(() => {
      logger.info('MySQL connection has been established successfully.');
    })
    .catch((err) => {
      logger.info('Unable to connect to the database:', err);
    });

  return sequelize;
};
