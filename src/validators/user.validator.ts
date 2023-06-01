import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';

export const userFormValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const validations: Array<ValidationChain> = [];
  Object.keys(req.body).forEach((key) => {
    switch (key) {
      case 'firstName':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 128 })
            .toLowerCase()
            .withMessage('Invalid first name')
        );
        break;
      case 'lastName':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 128 })
            .toLowerCase()
            .withMessage('Invalid last name')
        );
        break;
      case 'title':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 256 })
            .toLowerCase()
            .withMessage('Invalid title')
        );
        break;
      case 'summary':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 256 })
            .toLowerCase()
            .withMessage('Invalid summary')
        );
        break;
      case 'email':
        validations.push(
          body(key)
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .isLength({ max: 128 })
            .withMessage('Invalid email')
        );
        break;
      case 'password':
        validations.push(
          body(key)
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 5, max: 15 })
            .withMessage('Ivalid password')
        );
        break;
      case 'role':
        validations.push(
          body(key)
            .notEmpty()
            .isString()
            .trim()
            .escape()
            .isLength({ max: 50 })
            .toLowerCase()
            .withMessage('Invalid role')
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
