import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';

export const projectFormValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const validations: Array<ValidationChain> = [];
  Object.keys(req.body).forEach((key) => {
    switch (key) {
      case 'userId':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 128 })
            .withMessage('Invalid user id')
        );
        break;
      case 'description':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 128 })
            .toLowerCase()
            .withMessage('Invalid description')
        );
        break;
      default:
        break;
    }
  });
  Promise.all(validations.map((validation) => validation.run(req)))
    .then(() => {
      next();
    })
    .catch((error) => {
      next(error);
    });
};
