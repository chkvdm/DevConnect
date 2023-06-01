// eslint-disable-next-line import/no-extraneous-dependencies
import pinoHttp from 'pino-http';
import pinoPretty from 'pino-pretty';
import pino from 'pino';
import express from 'express';
import { ExtendedRequest } from '../interfaces/express';

export const urlLogger = pinoHttp(
  {
    level: 'info',
    serializers: {
      req: (req: ExtendedRequest) => {
        return {
          method: req.method,
          url: req.url,
          id: req.id,
        };
      },
      res: (res: express.Response) => {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  },
  pinoPretty({
    colorize: true,
    ignore: 'pid,hostname',
    translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l',
  })
);

export const logger = pino({});
