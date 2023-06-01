import { MigrationFn } from 'umzug';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import path from 'path';
import { logger } from '../middleware/logger';
import { UserRole } from '../models/users.model';

const saltRounds = 5;

export const up: MigrationFn<Sequelize> = async ({ context }) => {
  const q = context.getQueryInterface();
  try {
    await q.bulkInsert('users', [
      {
        id: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
        first_name: 'Brendan',
        last_name: 'Eich',
        image: path.join(__dirname, '..', '..', 'public', 'default.png'),
        title: 'computer programmer',
        summary: 'creator of JS',
        role: UserRole.Admin,
        email: 'Brendan@test.com',
        password: await bcrypt.hash('adminpassword', saltRounds),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
        first_name: 'Alan',
        last_name: 'Gerlach',
        image: path.join(__dirname, '..', '..', 'public', 'default.png'),
        title: 'python developer',
        summary: 'flask and jango',
        role: UserRole.User,
        email: 'Alan@test.com',
        password: await bcrypt.hash('userpassword', saltRounds),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  } catch (err) {
    logger.error('Error seeding default users', err);
    throw err;
  }
};

export const down: MigrationFn<Sequelize> = async ({ context }) => {
  const q = context.getQueryInterface();
  try {
    const emailsToDelete = ['Brendan@test.com', 'Alan@test.com'];
    await q.bulkDelete('users', { email: emailsToDelete }, {});
  } catch (err) {
    logger.error('Error deleting default users', err);
    throw err;
  }
};
