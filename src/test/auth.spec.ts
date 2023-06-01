/* eslint-disable import/no-extraneous-dependencies */
import supertest, { SuperTest, Test } from 'supertest';
import { StoppableServer } from 'stoppable';
import startServer from '../main';
import { logger } from '../middleware/logger';

let app: SuperTest<Test>;
let server: StoppableServer;

beforeAll(async () => {
  jest.resetModules();
  server = await startServer();
  app = supertest(server);
  server.on('error', (err) => logger.info(err));
});

afterAll((done) => {
  server.stop((err) => {
    if (err) {
      logger.info(err);
      done();
    }
    done();
  });
});

describe('POST /api/auth/register', () => {
  const registerWrongForm = {
    firstName: 'userwrong',
    lastName: 'wronglast',
    email: 'usergmail.com',
    title: 'manager',
    summary: 'project manager',
    password: '2',
  };

  const userOne = {
    firstName: 'onename',
    lastName: 'onelast',
    email: 'userone@test.com',
    title: 'developer',
    summary: 'js developer',
    password: 'passworduserone',
  };

  const userDuplicate = {
    firstName: 'onename',
    lastName: 'onelast',
    email: 'userone@test.com',
    title: 'developer',
    summary: 'js developer',
    password: 'passworduserone',
  };

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .post('/api/auth/register')
      .field('firstName', registerWrongForm.firstName)
      .field('lastName', registerWrongForm.lastName)
      .field('email', registerWrongForm.email)
      .field('title', registerWrongForm.title)
      .field('summary', registerWrongForm.summary)
      .field('password', registerWrongForm.password);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid password');
    expect(res.body.errors[1].msg).toBe('Invalid value');
  });

  it('should return 201 and create new user', async () => {
    const res = await app
      .post('/api/auth/register')
      .field('firstName', userOne.firstName)
      .field('lastName', userOne.lastName)
      .field('email', userOne.email)
      .field('title', userOne.title)
      .field('summary', userOne.summary)
      .field('password', userOne.password);

    expect(res.statusCode).toBe(201);
    expect(res.body.firstName).toBe(userOne.firstName);
    expect(res.body.lastName).toBe(userOne.lastName);
    expect(res.body.email).toBe(userOne.email);
    expect(res.body.title).toBe(userOne.title);
    expect(res.body.summary).toBe(userOne.summary);
  });

  it('should return 400 if email already exsist', async () => {
    const res = await app
      .post('/api/auth/register')
      .field('firstName', userDuplicate.firstName)
      .field('lastName', userDuplicate.lastName)
      .field('email', userDuplicate.email)
      .field('title', userDuplicate.title)
      .field('summary', userDuplicate.summary)
      .field('password', userDuplicate.password);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('This email already exists');
  });
});

describe('POST /api/auth/login', () => {
  const registerWrongForm = {
    email: 'usergmail.com',
    password: '2',
  };

  const userOne = {
    email: 'userone@test.com',
    password: 'passworduserone',
  };

  const userNotFound = {
    email: 'usernotfound@test.com',
    password: 'notfound',
  };

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .post('/api/auth/login')
      .field('email', registerWrongForm.email)
      .field('password', registerWrongForm.password);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid password');
    expect(res.body.errors[1].msg).toBe('Invalid value');
  });

  it('should return 200 and login user', async () => {
    const res = await app
      .post('/api/auth/login')
      .field('email', userOne.email)
      .field('password', userOne.password);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(userOne.email);

    const { id } = res.body.user;
    const { token } = res.body;

    await app
      .delete(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  it('should return 400 if user not register', async () => {
    const res = await app
      .post('/api/auth/login')
      .field('email', userNotFound.email)
      .field('password', userNotFound.password);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User not found');
  });
});
