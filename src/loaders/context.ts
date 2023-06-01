import { Context } from '../interfaces/general';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { ExperienceService } from '../services/experience.service';
import { ProjectsService } from '../services/projects.service';
import { FeedbacksService } from '../services/feedbacks.service';
import { CvService } from '../services/cv.service';
import { CacheService } from '../services/cache.service';

export const loadContext = async (dependencies: any): Promise<Context> => {
  return {
    services: {
      authService: new AuthService(),
      usersService: new UsersService(),
      experienceService: new ExperienceService(),
      projectsService: new ProjectsService(),
      feedbacksService: new FeedbacksService(),
      cvService: new CvService(),
      cacheService: new CacheService(dependencies.redisClient),
    },
  };
};
