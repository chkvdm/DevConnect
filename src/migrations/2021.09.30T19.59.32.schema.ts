import { MigrationFn } from 'umzug';
import { DataTypes, Sequelize } from 'sequelize';

export const up: MigrationFn<Sequelize> = async ({ context }) => {
  const q = context.getQueryInterface();

  await q.createTable('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    first_name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    last_name: {
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
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  });

  await q.createTable('projects', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    image: {
      type: new DataTypes.STRING(256),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  });

  await q.createTable('experiences', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    company_name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    role: {
      type: new DataTypes.STRING(256),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  });

  await q.createTable('feedbacks', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    from_user: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    to_user: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    company_name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  });
};

export const down: MigrationFn<Sequelize> = async ({ context }) => {
  const q = context.getQueryInterface();

  await q.dropTable('projects');
  await q.dropTable('experiences');
  await q.dropTable('feedbacks');
  await q.dropTable('users');
};
