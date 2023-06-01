/* eslint-disable import/no-cycle */
/* eslint-disable lines-between-class-members */
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Models } from '../interfaces/general';

interface ProjectsAttributes {
  id: number;
  userId: string;
  image: string;
  description: string;
}

export class Projects
  extends Model<ProjectsAttributes, Optional<ProjectsAttributes, 'id'>>
  implements ProjectsAttributes
{
  id: number;
  userId: string;
  image: string;
  description: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  static defineSchema(sequelize: Sequelize) {
    Projects.init(
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
        image: {
          type: new DataTypes.STRING(256),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        tableName: 'projects',
        underscored: true,
        sequelize,
      }
    );
  }

  static associate(models: Models, sequelize: Sequelize) {
    Projects.belongsTo(models.users, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'user_id',
        allowNull: false,
      },
    });
  }
}
