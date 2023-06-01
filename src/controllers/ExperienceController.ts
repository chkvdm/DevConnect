import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Context } from '../interfaces/general';
import { ExperienceService } from '../services/experience.service';
import { CacheService } from '../services/cache.service';
import { HttpException } from '../middleware/errorhandler';

export class ExperienceController {
  private experienceService: ExperienceService;

  private cacheService: CacheService;

  constructor(context: Context) {
    this.experienceService = context.services.experienceService;
    this.cacheService = context.services.cacheService;
  }

  // Add new experience
  public addNewExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<unknown> => {
    try {
      // Validate experience form
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }
      const { userId, companyName, role, startDate, description } = req.body;
      let { endDate } = req.body;
      if (endDate === 'until now') {
        endDate = null;
      }
      // Check new experience for uniqueness
      const newExpNotUniq = await this.experienceService.findDuplicate(
        userId,
        companyName,
        role,
        startDate,
        endDate,
        description
      );
      if (!newExpNotUniq) {
        return res
          .status(400)
          .json({ message: 'Such experience already exists' });
      }

      const newExp = await this.experienceService.createNewExperience(
        userId,
        companyName,
        role,
        startDate,
        endDate,
        description
      );

      let dateEnd = newExp.endDate;
      if (!newExp.endDate) {
        dateEnd = 'untill now';
      }
      // clean redis cache
      const { user } = req;
      await this.cacheService.del(user.toString());

      return res.status(201).json({
        id: newExp.id,
        userId: newExp.userId,
        companyName: newExp.companyName,
        role: newExp.role,
        startDate: newExp.startDate,
        endDate: dateEnd,
        description: newExp.description,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // Get an array of all experiences
  public getAllExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageSize, page } = req.query;
      const offset: number = (Number(page) - 1) * Number(pageSize);
      const { count, rows } = await this.experienceService.findAllExperiences(
        Number(pageSize),
        offset
      );
      res.set('X-Total-Count', count.toString());
      const arrayToReturn: Array<object> = [];
      rows.forEach((el) =>
        arrayToReturn.push({
          id: el.id,
          userId: el.userId,
          companyName: el.companyName,
          role: el.role,
          startDate: el.startDate,
          endDate: el.endDate,
          description: el.description,
        })
      );
      return res.status(200).json(arrayToReturn);
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // Get experience by id
  public getExperienceById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const experience = await this.experienceService.findExperienceById(id);
      if (experience === null) {
        return res.status(404).json({ message: 'Experience not found' });
      }
      return res.status(200).json({
        id: experience.id,
        userId: experience.userId,
        companyName: experience.companyName,
        role: experience.role,
        startDate: experience.startDate,
        endDate: experience.endDate,
        description: experience.description,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // update user experience
  public updateExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Validate experience form
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }
      const { id } = req.params;
      const experience = await this.experienceService.findExperienceById(id);
      if (experience === null) {
        return res.status(404).json({ message: 'Experience not found' });
      }

      const { userId, companyName, role, startDate, description } = req.body;
      let { endDate } = req.body;
      if (endDate === 'until now') {
        endDate = null;
      }

      // check update experience for uniqueness
      const updateExpNotUniq = await this.experienceService.findDuplicate(
        userId,
        companyName,
        role,
        startDate,
        endDate,
        description
      );
      if (!updateExpNotUniq) {
        return res
          .status(404)
          .json({ message: 'Such experience already exists' });
      }
      const data = {
        userId,
        companyName,
        role,
        startDate,
        endDate,
        description,
      };
      await this.experienceService.updateExperienceData(id, data);

      // clean redis cache
      const { user } = req;
      await this.cacheService.del(user.toString());

      const updateExp = await this.experienceService.findExperienceById(id);

      let dateEnd = updateExp.endDate;
      if (!updateExp.endDate) {
        dateEnd = 'untill now';
      }

      return res.status(200).json({
        id: updateExp.id,
        userId: updateExp.userId,
        companyName: updateExp.companyName,
        role: updateExp.role,
        startDate: updateExp.startDate,
        endDate: dateEnd,
        description: updateExp.description,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // delete user by id
  public deleteExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const experience = await this.experienceService.findExperienceById(id);
      if (experience === null) {
        return res.status(404).json({ message: 'Experience not found' });
      }
      await this.experienceService.deleteExperienceById(id);

      // clean redis cache
      const { user } = req;
      await this.cacheService.del(user.toString());

      return res.status(204).end();
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };
}
