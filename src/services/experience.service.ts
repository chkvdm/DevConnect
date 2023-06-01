// eslint-disable-next-line import/no-cycle
import { UserRole } from '../models/users.model';
import { Experiences } from '../models/experiences.model';

export class ExperienceService {
  private readonly experiencesModel: typeof Experiences;

  constructor() {
    this.experiencesModel = Experiences;
  }

  public async findDuplicate(
    userId: string,
    companyName: string,
    role: UserRole,
    startDate: string,
    endDate: string,
    description: string
  ): Promise<Experiences | boolean> {
    const duplicate = await this.experiencesModel.findOne({
      where: { userId, companyName, role, startDate, endDate, description },
    });
    if (!duplicate) {
      return true;
    }
    return false;
  }

  public async createNewExperience(
    userId: string,
    companyName: string,
    role: UserRole,
    startDate: string,
    endDate: string,
    description: string
  ): Promise<Experiences> {
    const newExperience = await this.experiencesModel.create({
      userId,
      companyName,
      role,
      startDate,
      endDate,
      description,
    });
    return newExperience;
  }

  public async findAllExperiences(
    limit: number,
    offset: number
  ): Promise<{ count: number; rows: Array<Experiences> }> {
    const data = await this.experiencesModel.findAndCountAll({
      limit,
      offset,
    });
    return data;
  }

  public async findExperienceById(id: string): Promise<Experiences> {
    const data = await this.experiencesModel.findOne({ where: { id } });
    return data;
  }

  public async updateExperienceData(id: string, newData: object) {
    await this.experiencesModel.update(newData, { where: { id } });
    return true;
  }

  public async deleteExperienceById(id: string): Promise<Experiences> {
    await this.experiencesModel.destroy({ where: { id } });
    return null;
  }
}
