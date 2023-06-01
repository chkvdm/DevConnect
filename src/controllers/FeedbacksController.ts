import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Context } from '../interfaces/general';
import { FeedbacksService } from '../services/feedbacks.service';
import { CacheService } from '../services/cache.service';
import { HttpException } from '../middleware/errorhandler';

export class FeedbacksController {
  private feedbacksService: FeedbacksService;

  private cacheService: CacheService;

  constructor(context: Context) {
    this.feedbacksService = context.services.feedbacksService;
    this.cacheService = context.services.cacheService;
  }

  // Add new feedback
  public addNewFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<unknown> => {
    try {
      // Validate feedback form
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }
      // Get a project parameters from the request body
      const { fromUser, companyName, toUser, content } = req.body;

      // Check if the user is creating a feedback about himself or not from youself
      if (req.user !== fromUser || req.user === toUser) {
        return res.status(400).json({
          message:
            'feedback is allowed only for another user and on your behalf',
        });
      }

      // Check if there is a user about which feedback
      const userForFeedback = await this.feedbacksService.findUserById(toUser);
      if (userForFeedback === null) {
        return res
          .status(404)
          .json({ message: 'user about which feedback not exists' });
      }

      // Check new feedback for uniqueness
      const newFedbackNotUniq = await this.feedbacksService.findDuplicate(
        fromUser,
        companyName,
        toUser,
        content
      );
      if (!newFedbackNotUniq) {
        return res
          .status(400)
          .json({ message: 'Such feedback already exists' });
      }

      // Crete a new feedback
      const feedback = await this.feedbacksService.createNewFeedback(
        fromUser,
        companyName,
        toUser,
        content
      );

      // clean redis cache
      await this.cacheService.del(toUser.toString());

      return res.status(201).json({
        id: feedback.id,
        fromUser: feedback.fromUser,
        companyName: feedback.companyName,
        toUser: feedback.toUser,
        content: feedback.content,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // Get an array of all feedbacks
  public getAllFeedbacks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageSize, page } = req.query;
      const offset: number = (Number(page) - 1) * Number(pageSize);
      const { count, rows } = await this.feedbacksService.findAllFeedback(
        Number(pageSize),
        offset
      );
      res.set('X-Total-Count', count.toString());
      const rowsForReturn: Array<object> = [];
      rows.filter((el) =>
        rowsForReturn.push({
          id: el.id,
          fromUser: el.fromUser,
          companyName: el.companyName,
          toUser: el.toUser,
          content: el.content,
        })
      );
      return res.status(200).json(rowsForReturn);
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // Get feedback by id
  public getFeedbackById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const feedback = await this.feedbacksService.findFeedbackById(id);
      if (feedback === null) {
        return res.status(404).json({ message: 'Feedback not found' });
      }
      return res.status(200).json({
        id: feedback.id,
        fromUser: feedback.fromUser,
        companyName: feedback.companyName,
        toUser: feedback.toUser,
        content: feedback.content,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // update feedback by id
  public updateFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Validate feedback form
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }
      const { id } = req.params;
      const feedback = await this.feedbacksService.findFeedbackById(id);
      if (feedback === null) {
        return res.status(404).json({ message: 'Feedback not found' });
      }
      const dataFromReq = req.body;

      // Check if the user is creating a feedback about himself or not from youself
      if (
        req.user !== dataFromReq.fromUser ||
        req.user === dataFromReq.toUser
      ) {
        return res.status(400).json({
          message:
            'feedback is allowed only for another user and on your behalf',
        });
      }

      // Check if the user uploaded a new feedbacks's image
      if (req.file) {
        dataFromReq.image = req.file.path;
      }

      // check new feedback for uniqueness
      const updateFedbackNotUniq = await this.feedbacksService.findDuplicate(
        dataFromReq.fromUser,
        dataFromReq.companyName,
        dataFromReq.toUser,
        dataFromReq.content
      );
      if (!updateFedbackNotUniq) {
        return res
          .status(404)
          .json({ message: 'Such feedback already exists' });
      }

      await this.feedbacksService.updateFeedbacksData(id, dataFromReq);

      // clean redis cache
      await this.cacheService.del(dataFromReq.toUser.toString());

      const updateFeedback = await this.feedbacksService.findFeedbackById(id);

      return res.status(200).json({
        id: updateFeedback.id,
        fromUser: updateFeedback.fromUser,
        companyName: updateFeedback.companyName,
        toUser: updateFeedback.toUser,
        content: updateFeedback.content,
      });
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };

  // delete feedback by id
  public deleteFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const feedback = await this.feedbacksService.findFeedbackById(id);
      if (feedback === null) {
        return res.status(404).json({ message: 'feedback not found' });
      }
      await this.feedbacksService.deleteFeedbackById(id);

      // clean redis cache
      await this.cacheService.del(feedback.toUser.toString());

      return res.status(204).end();
    } catch (err) {
      return next(new HttpException(500, `${err}`));
    }
  };
}
