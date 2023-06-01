import { Request, Response, NextFunction } from 'express';
import { param, query, validationResult } from 'express-validator';

export const validatePathUserParam = [
  param('id').isUUID().withMessage('Invalid user ID parameter'),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
];

export const validatePathCvParam = [
  param('userId').isUUID().withMessage('Invalid user ID parameter'),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
];

export const validateIdPathParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid id path parameter'),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
];

export const validateQueryParams = [
  query('pageSize').isInt({ min: 1 }).withMessage('Invalid pageSize parameter'),
  query('page').isInt({ min: 1 }).withMessage('Invalid page parameter'),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
];
