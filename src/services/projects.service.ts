import { promises as fs } from 'fs';
// eslint-disable-next-line import/no-cycle
import { Projects } from '../models/projects.model';

export class ProjectsService {
  private readonly projectsModel: typeof Projects;

  constructor() {
    this.projectsModel = Projects;
  }

  public async createNewProject(
    userId: string,
    image: string,
    description: string
  ): Promise<Projects> {
    const newProject = await this.projectsModel.create({
      userId,
      image,
      description,
    });
    return newProject;
  }

  public async findAllProjects(
    offset: number,
    limit: number
  ): Promise<{ count: number; rows: Array<Projects> }> {
    const data = await this.projectsModel.findAndCountAll({
      offset,
      limit,
    });
    return data;
  }

  public async findProjectById(id: string): Promise<Projects> {
    const data = await this.projectsModel.findOne({ where: { id } });
    return data;
  }

  public async checkUniqProject(
    userId: string,
    description: string
  ): Promise<boolean> {
    const data = await this.projectsModel.findOne({
      where: { userId, description },
    });
    if (!data) {
      return true;
    }
    return false;
  }

  public async updateProjectsData(id: string, newData: object) {
    await this.projectsModel.update(newData, { where: { id } });
    return true;
  }

  public async deleteProjectById(id: string): Promise<Projects> {
    await this.projectsModel.destroy({ where: { id } });
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  public async imageName(filePath: string) {
    return filePath.split('\\').pop().split('/').pop();
  }

  // eslint-disable-next-line class-methods-use-this
  public async oldImageDelete(oldImagePath: string) {
    await fs.unlink(oldImagePath);
  }
}
