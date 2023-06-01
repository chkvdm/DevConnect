// eslint-disable-next-line import/no-cycle
import { Users } from '../models/users.model';
import { Feedbacks } from '../models/feedbacks.model';

export class FeedbacksService {
  private readonly feedbacksModel: typeof Feedbacks;

  constructor() {
    this.feedbacksModel = Feedbacks;
  }

  public async findDuplicate(
    fromUser: string,
    companyName: string,
    toUser: string,
    content: string
  ): Promise<Feedbacks | boolean> {
    const duplicate = await this.feedbacksModel.findOne({
      where: { fromUser, companyName, toUser, content },
    });
    if (!duplicate) {
      return true;
    }
    return false;
  }

  public async createNewFeedback(
    fromUser: string,
    companyName: string,
    toUser: string,
    content: string
  ): Promise<Feedbacks> {
    const newFeedback = await this.feedbacksModel.create({
      fromUser,
      companyName,
      toUser,
      content,
    });
    return newFeedback;
  }

  // eslint-disable-next-line class-methods-use-this
  public async findUserById(id: string): Promise<Users> {
    const data = await Users.findOne({ where: { id } });
    return data;
  }

  public async findAllFeedback(
    limit: number,
    offset: number
  ): Promise<{ count: number; rows: Array<Feedbacks> }> {
    const data = await this.feedbacksModel.findAndCountAll({
      limit,
      offset,
    });
    return data;
  }

  public async findFeedbackById(id: string): Promise<Feedbacks> {
    const data = await this.feedbacksModel.findOne({ where: { id } });
    return data;
  }

  public async updateFeedbacksData(id: string, newData: object) {
    await this.feedbacksModel.update(newData, { where: { id } });
    return true;
  }

  public async deleteFeedbackById(id: string): Promise<Feedbacks> {
    await this.feedbacksModel.destroy({ where: { id } });
    return null;
  }
}
