/* eslint-disable lines-between-class-members */
// eslint-disable-next-line import/no-cycle
import { Users } from '../models/users.model';
import { Experiences } from '../models/experiences.model';
import { Projects } from '../models/projects.model';
import { Feedbacks } from '../models/feedbacks.model';

export class CvService {
  private readonly usersModel: typeof Users;
  private readonly experiencesModel: typeof Experiences;
  private readonly projectsModel: typeof Projects;
  private readonly feedbacksModel: typeof Feedbacks;

  constructor() {
    this.usersModel = Users;
    this.experiencesModel = Experiences;
    this.projectsModel = Projects;
    this.feedbacksModel = Feedbacks;
  }

  public async findUserById(id: string): Promise<Users> {
    const data = await this.usersModel.findOne({ where: { id } });
    return data;
  }

  public async findExperiencesByUserId(userId: string): Promise<Experiences[]> {
    const data = await this.experiencesModel.findAll({ where: { userId } });
    return data;
  }

  public async findProjectsByUserId(userId: string): Promise<Projects[]> {
    const data = await this.projectsModel.findAll({ where: { userId } });
    return data;
  }

  public async findFeedbacksByUserId(toUser: string): Promise<Feedbacks[]> {
    const data = await this.feedbacksModel.findAll({ where: { toUser } });
    return data;
  }
}
