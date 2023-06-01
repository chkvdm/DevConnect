import { Request, Response, NextFunction } from 'express';
import { Users, UserRole } from '../models/users.model';
import { HttpException } from './errorhandler';

export function roles(allowedRoles: UserRole[], accountOwner = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user;
      const idFromUrl = req.params.id;
      const user = await Users.findOne({ where: { id } });

      if (allowedRoles.includes(user.role)) {
        return next();
      }
      if (accountOwner) {
        if (id === idFromUrl) {
          return next();
        }
      }
      return res.status(403).send('Forbidden');
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };
}
