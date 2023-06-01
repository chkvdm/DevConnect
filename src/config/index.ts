import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    logging: boolean;
  };
  redis: {
    host: string;
    port: number;
  };
  auth: {
    secret: string;
  };
}

const configs: {
  development: Config;
} = {
  development: {
    db: {
      host: process.env.DBHOST,
      port: parseInt(process.env.DBPORT, 10),
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      logging: false,
    },
    redis: {
      host: process.env.HOST,
      port: parseInt(process.env.PORT, 10),
    },
    auth: {
      secret: process.env.SECRET,
    },
  },
};

const getConfig = (): Config => {
  if (!process.env.NODE_ENV) {
    throw new Error(
      'Env parameter NODE_ENV must be specified! Possible values are "development", ...'
    );
  }

  const env = process.env.NODE_ENV as 'development';

  if (!configs[env]) {
    throw new Error(
      'Unsupported NODE_ENV value was provided! Possible values are "development", ...'
    );
  }

  return configs[env];
};

export const config = getConfig();
