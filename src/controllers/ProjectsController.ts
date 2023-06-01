import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import path from 'path';
import { Context } from '../interfaces/general';
import { ProjectsService } from '../services/projects.service';
import { CacheService } from '../services/cache.service';
import { HttpException } from '../middleware/errorhandler';

export class ProjectsController {
  private projectsService: ProjectsService;

  private cacheService: CacheService;

  constructor(context: Context) {
    this.projectsService = context.services.projectsService;
    this.cacheService = context.services.cacheService;
  }

  // Add new project
  public addNewProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<unknown> => {
    try {
      // Validate project form
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }

      // get a project parameters from the request body
      const { userId, description } = req.body;

      // check the project for uniqueness
      const newProjectCheck = await this.projectsService.checkUniqProject(
        userId,
        description
      );
      if (!newProjectCheck) {
        return res.status(400).json({ message: 'This project already exists' });
      }

      // Crete new project
      let image: string = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'project-image.png'
      );
      if (req.file) {
        image = req.file.path;
      }
      const newProject = await this.projectsService.createNewProject(
        userId,
        image,
        description
      );

      // clean redis cache
      const { user } = req;
      await this.cacheService.del(user.toString());

      return res.status(201).json({
        id: newProject.id,
        userId: newProject.userId,
        image: newProject.image,
        description: newProject.description,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // Get an array of all projects
  public getAllProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageSize, page } = req.query;
      const offset: number = (Number(page) - 1) * Number(pageSize);
      const { count, rows } = await this.projectsService.findAllProjects(
        offset,
        Number(pageSize)
      );

      res.set('X-Total-Count', count.toString());
      const projectsForReturn: Array<object> = [];
      rows.forEach((el) =>
        projectsForReturn.push({
          id: el.id,
          userId: el.userId,
          image: el.image,
          description: el.description,
        })
      );
      return res.status(200).json(projectsForReturn);
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // Get project by id
  public getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const project = await this.projectsService.findProjectById(id);
      if (project === null) {
        return res.status(404).json({ message: 'Project not found' });
      }
      return res.status(200).json({
        id: project.id,
        userId: project.userId,
        image: project.image,
        description: project.description,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // update project by id
  public updateProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Validate project form
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }

      const { id } = req.params;
      const project = await this.projectsService.findProjectById(id);
      if (project === null) {
        return res.status(404).json({ message: 'Project not found' });
      }
      const dataFromReq = req.body;

      // Check update project's data for uniqueness
      const updateProjectData = await this.projectsService.checkUniqProject(
        dataFromReq.userId,
        dataFromReq.description
      );
      if (!updateProjectData) {
        return res.status(400).json({ message: 'This project already exists' });
      }

      // Check if the user uploaded a new project's image
      if (req.file) {
        dataFromReq.image = req.file.path;
      }

      await this.projectsService.updateProjectsData(id, dataFromReq);

      // clean redis cache
      const { user } = req;
      await this.cacheService.del(user.toString());

      const updateProject = await this.projectsService.findProjectById(id);

      // delete old image
      const defaultName = await this.projectsService.imageName(project.image);
      if (!(defaultName === 'project-image.png')) {
        await this.projectsService.oldImageDelete(project.image);
      }

      return res.status(200).json({
        id: updateProject.id,
        userId: updateProject.userId,
        image: updateProject.image,
        description: updateProject.description,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // delete user by id
  public deleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const project = await this.projectsService.findProjectById(id);
      if (project === null) {
        return res.status(404).json({ message: 'Project not found' });
      }
      await this.projectsService.deleteProjectById(id);

      // clean redis cache
      const { user } = req;
      await this.cacheService.del(user.toString());

      // delete image
      const defaultName = await this.projectsService.imageName(project.image);
      if (!(defaultName === 'project-image.png')) {
        await this.projectsService.oldImageDelete(project.image);
      }

      return res.status(204).end();
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };
}
