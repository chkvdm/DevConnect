import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';

export const experienceFormValidation = async (
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
      case 'companyName':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 128 })
            .toLowerCase()
            .withMessage('Invalid company name')
        );
        break;
      case 'role':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 256 })
            .toLowerCase()
            .withMessage('Invalid role')
        );
        break;
      case 'startDate':
        validations.push(
          body(key)
            .notEmpty()
            .trim()
            .escape()
            .isDate()
            .withMessage('Invalid start date')
        );
        break;
      case 'endDate':
        validations.push(
          body(key).notEmpty().trim().escape().withMessage('Invalid end date')
        );
        break;
      case 'description':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 256 })
            .toLowerCase()
            .withMessage('Ivalid description')
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
