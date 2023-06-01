/* eslint-disable import/no-cycle */
import express from 'express';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { ExperienceService } from '../services/experience.service';
import { ProjectsService } from '../services/projects.service';
import { FeedbacksService } from '../services/feedbacks.service';
import { CvService } from '../services/cv.service';
import { CacheService } from '../services/cache.service';
import { Users } from '../models/users.model';
import { Projects } from '../models/projects.model';
import { Experiences } from '../models/experiences.model';
import { Feedbacks } from '../models/feedbacks.model';

export interface Context {
  services: {
    authService: AuthService;
    usersService: UsersService;
    experienceService: ExperienceService;
    projectsService: ProjectsService;
    feedbacksService: FeedbacksService;
    cvService: CvService;
    cacheService: CacheService;
  };
}

export type RouterFactory = (context: Context) => express.Router;

export type Loader = (app: express.Application, context: Context) => void;

export interface Models {
  users: typeof Users;
  projects: typeof Projects;
  experiences: typeof Experiences;
  feedbacks: typeof Feedbacks;
}
