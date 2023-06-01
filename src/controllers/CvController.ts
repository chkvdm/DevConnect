import { Request, Response, NextFunction } from 'express';
import { Context } from '../interfaces/general';
import { CvService } from '../services/cv.service';
import { HttpException } from '../middleware/errorhandler';
import { CacheService } from '../services/cache.service';

export class CvController {
  private cvService: CvService;

  private cacheService: CacheService;

  constructor(context: Context) {
    this.cvService = context.services.cvService;
    this.cacheService = context.services.cacheService;
  }

  // Get user CV
  public getUserCv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;

      // Caсhe check
      const cachedData = await this.cacheService.get(userId);
      if (cachedData) {
        return res.status(200).json(cachedData);
      }

      const user = await this.cvService.findUserById(userId);
      if (user === null) {
        return res.status(404).json({ message: 'User not found' });
      }

      const experience = await this.cvService.findExperiencesByUserId(userId);
      const experienceForReturn: Array<object> = [];
      experience.filter((el) =>
        experienceForReturn.push({
          userId: el.userId,
          companyName: el.companyName,
          role: el.role,
          startDate: el.startDate,
          endDate: el.endDate,
          description: el.description,
        })
      );

      const projects = await this.cvService.findProjectsByUserId(userId);
      const projectsForReturn: Array<object> = [];
      projects.filter((el) =>
        projectsForReturn.push({
          id: el.id,
          userId: el.userId,
          image: el.image,
          description: el.description,
        })
      );

      const feedbacks = await this.cvService.findFeedbacksByUserId(userId);
      const feedbacksForReturn: Array<object> = [];
      feedbacks.filter((el) =>
        feedbacksForReturn.push({
          id: el.id,
          fromUser: el.fromUser,
          companyName: el.companyName,
          toUser: el.toUser,
          content: el.content,
        })
      );

      const cv = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        title: user.title,
        image: user.image,
        summary: user.summary,
        email: user.email,
        experiences: experienceForReturn,
        projects: projectsForReturn,
        feedbacks: feedbacksForReturn,
      };

      // Store data in cache
      await this.cacheService.set(userId, cv);

      return res.status(200).json(cv);
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };
}
