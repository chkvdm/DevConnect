/* eslint-disable no-restricted-syntax */
import { Sequelize } from 'sequelize';
import { Models } from '../interfaces/general';
import { Users } from '../models/users.model';
import { Projects } from '../models/projects.model';
import { Experiences } from '../models/experiences.model';
import { Feedbacks } from '../models/feedbacks.model';

export const loadModels = (sequelize: Sequelize): Models => {
  const models: Models = {
    users: Users,
    projects: Projects,
    experiences: Experiences,
    feedbacks: Feedbacks,
  };

  for (const model of Object.values(models)) {
    model.defineSchema(sequelize);
  }

  for (const model of Object.values(models)) {
    model.associate(models, sequelize);
  }

  return models;
};
