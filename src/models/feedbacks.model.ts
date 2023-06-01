/* eslint-disable import/no-cycle */
/* eslint-disable lines-between-class-members */
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Models } from '../interfaces/general';

interface FeedbacksAttributes {
  id: number;
  fromUser: string;
  toUser: string;
  content: string;
  companyName: string;
}

export class Feedbacks
  extends Model<FeedbacksAttributes, Optional<FeedbacksAttributes, 'id'>>
  implements FeedbacksAttributes
{
  id: number;
  fromUser: string;
  toUser: string;
  content: string;
  companyName: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  static defineSchema(sequelize: Sequelize) {
    Feedbacks.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        fromUser: {
          field: 'from_user',
          type: DataTypes.UUID,
          allowNull: false,
        },
        toUser: {
          field: 'to_user',
          type: DataTypes.UUID,
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        companyName: {
          field: 'company_name',
          type: new DataTypes.STRING(128),
          allowNull: false,
        },
      },
      {
        tableName: 'feedbacks',
        underscored: true,
        sequelize,
      }
    );
  }

  static associate(models: Models, sequelize: Sequelize) {
    Feedbacks.belongsTo(models.users, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'from_user',
        allowNull: false,
      },
    });

    Feedbacks.belongsTo(models.users, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'to_user',
        allowNull: false,
      },
    });
  }
}
