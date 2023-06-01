import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';

export const feedbackFormValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const validations: Array<ValidationChain> = [];
  Object.keys(req.body).forEach((key) => {
    switch (key) {
      case 'fromUser':
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
      case 'toUser':
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
      case 'content':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ min: 5, max: 256 })
            .toLowerCase()
            .withMessage('Invalid content')
        );
        break;
      case 'companyName':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ min: 1, max: 128 })
            .toLowerCase()
            .withMessage('Invalid company name')
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
