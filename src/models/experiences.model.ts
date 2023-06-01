/* eslint-disable import/no-cycle */
/* eslint-disable lines-between-class-members */
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { UserRole } from './users.model';
import { Models } from '../interfaces/general';

interface ExperiencesAttributes {
  id: number;
  userId: string;
  companyName: string;
  role: UserRole;
  startDate: string;
  endDate: string;
  description: string;
}

export class Experiences
  extends Model<ExperiencesAttributes, Optional<ExperiencesAttributes, 'id'>>
  implements ExperiencesAttributes
{
  id: number;
  userId: string;
  companyName: string;
  role: UserRole;
  startDate: string;
  endDate: string;
  description: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  static defineSchema(sequelize: Sequelize) {
    Experiences.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          field: 'user_id',
          type: DataTypes.UUID,
          allowNull: false,
        },
        companyName: {
          field: 'company_name',
          type: new DataTypes.STRING(128),
          allowNull: false,
        },
        role: {
          type: new DataTypes.STRING(256),
          allowNull: false,
        },
        startDate: {
          field: 'startDate',
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        endDate: {
          field: 'endDate',
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        tableName: 'experiences',
        underscored: true,
        sequelize,
      }
    );
  }

  static associate(models: Models, sequelize: Sequelize) {
    Experiences.belongsTo(models.users, {
      foreignKey: {
        name: 'user_id',
        allowNull: false,
      },
    });
  }
}
