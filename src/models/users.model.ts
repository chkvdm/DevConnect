/* eslint-disable import/no-cycle */
/* eslint-disable lines-between-class-members */
/* eslint-disable no-shadow */
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Models } from '../interfaces/general';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  title: string;
  summary: string;
  role: UserRole;
  email: string;
  password: string;
}

export class Users
  extends Model<UserAttributes, Optional<UserAttributes, 'id'>>
  implements UserAttributes
{
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  title: string;
  summary: string;
  role: UserRole;
  email: string;
  password: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  static defineSchema(sequelize: Sequelize) {
    Users.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        firstName: {
          field: 'first_name',
          type: new DataTypes.STRING(128),
          allowNull: false,
        },
        lastName: {
          field: 'last_name',
          type: new DataTypes.STRING(128),
          allowNull: false,
        },
        image: {
          type: new DataTypes.STRING(256),
          allowNull: false,
        },
        title: {
          type: new DataTypes.STRING(256),
          allowNull: false,
        },
        summary: {
          type: new DataTypes.STRING(256),
          allowNull: false,
        },
        role: {
          type: new DataTypes.STRING(50),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: 'users',
        underscored: true,
        sequelize,
      }
    );
  }

  static associate(models: Models, sequelize: Sequelize) {
    Users.hasMany(models.projects, {
      onDelete: 'CASCADE',
      foreignKey: 'user_id',
    });

    Users.hasMany(models.feedbacks, {
      onDelete: 'CASCADE',
      foreignKey: 'to_user',
    });

    Users.hasMany(models.feedbacks, {
      onDelete: 'CASCADE',
      foreignKey: 'from_user',
    });

    Users.hasMany(models.experiences, {
      onDelete: 'CASCADE',
      foreignKey: 'user_id',
    });
  }
}
