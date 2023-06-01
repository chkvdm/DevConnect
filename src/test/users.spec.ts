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
  server.on('error', (err) => logger.error(err));
});

afterAll((done) => {
  server.stop((err) => {
    if (err) {
      logger.error(err);
      done();
    }
    done();
  });
});

describe('POST /api/users', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const testUserWrongForm = {
    firstName: 'user',
    lastName: 'test',
    title: 'title',
    summary: '',
    email: 'useremail.com',
    password: 'qwerty12345',
    role: 'user',
  };

  const testUser = {
    firstName: 'user',
    lastName: 'test',
    title: 'title',
    summary: 'summary',
    email: 'user@email.com',
    password: 'qwerty12345',
    role: 'user',
  };

  const testTwo = {
    firstName: 'second user',
    lastName: 'second test',
    title: 'second title',
    summary: 'second summary',
    email: 'usertsecond@email.com',
    password: 'qwerty12345',
    role: 'user',
  };

  const testUsers = [testUser, testTwo];
  const testId: Array<string> = [];

  afterAll(async () => {
    await Promise.all(
      testId.map(async (id) => {
        await app
          .delete(`/api/users/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    testId.length = 0;
  });

  it('should return 401 if user not authorization', async () => {
    const res = await app.post('/api/users');

    expect(res.statusCode).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  it('should return 403 if user role not admin', async () => {
    const res = await app
      .post('/api/users')
      .set('Authorization', `Bearer ${bearerUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.text).toBe('Forbidden');
  });

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .post('/api/users')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .field('firstName', testUserWrongForm.firstName)
      .field('lastName', testUserWrongForm.lastName)
      .field('title', testUserWrongForm.title)
      .field('summary', testUserWrongForm.summary)
      .field('email', testUserWrongForm.email)
      .field('password', testUserWrongForm.password)
      .field('role', testUserWrongForm.role);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid value');
    expect(res.body.errors[1].msg).toBe('Invalid value');
  });

  it('should return 201 and create new user by admin', async () => {
    await Promise.all(
      testUsers.map(async (us) => {
        const res = await app
          .post('/api/users')
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .field('firstName', us.firstName)
          .field('lastName', us.lastName)
          .field('title', us.title)
          .field('summary', us.summary)
          .field('email', us.email)
          .field('password', us.password)
          .field('role', us.role);

        expect(res.statusCode).toBe(201);
        expect(res.body.firstName).toBe(us.firstName);
        expect(res.body.lastName).toBe(us.lastName);
        expect(res.body.title).toBe(us.title);
        expect(res.body.summary).toBe(us.summary);
        expect(res.body.email).toBe(us.email);
        expect(res.body.role).toBe(us.role);

        testId.push(res.body.id);
      })
    );
  });

  it('should return 400 if experience already exsist', async () => {
    const res = await app
      .post('/api/users')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .field('firstName', testUser.firstName)
      .field('lastName', testUser.lastName)
      .field('title', testUser.title)
      .field('summary', testUser.summary)
      .field('email', testUser.email)
      .field('password', testUser.password)
      .field('role', testUser.role);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('This email already exists');
  });
});

describe('DELETE /api/users/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';

  const testUser = {
    firstName: 'user',
    lastName: 'test',
    title: 'title',
    summary: 'summary',
    email: 'user@email.com',
    password: 'qwerty12345',
    role: 'user',
  };

  const testTwo = {
    firstName: 'second user',
    lastName: 'second test',
    title: 'second title',
    summary: 'second summary',
    email: 'usertsecond@email.com',
    password: 'qwerty12345',
    role: 'user',
  };

  const testUsers = [testUser, testTwo];
  const testId: Array<string> = [];
  let testUserToken: string;

  beforeAll(async () => {
    await Promise.all(
      testUsers.map(async (us) => {
        const res = await app
          .post('/api/users')
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .field('firstName', us.firstName)
          .field('lastName', us.lastName)
          .field('title', us.title)
          .field('summary', us.summary)
          .field('email', us.email)
          .field('password', us.password)
          .field('role', us.role);

        expect(res.statusCode).toBe(201);
        expect(res.body.firstName).toBe(us.firstName);
        expect(res.body.lastName).toBe(us.lastName);
        expect(res.body.title).toBe(us.title);
        expect(res.body.summary).toBe(us.summary);
        expect(res.body.email).toBe(us.email);
        expect(res.body.role).toBe(us.role);

        testId.push(res.body.id);
      })
    );
  });

  beforeAll(async () => {
    const res = await app
      .post('/api/auth/login')
      .field('email', testTwo.email)
      .field('password', testTwo.password)
      .expect(200);

    testUserToken = res.body.token;
  });

  afterAll(async () => {
    testId.length = 0;
    testUserToken = '';
  });

  it('should return 400 and reject invalid path param', async () => {
    await app.delete(`/api/users/${'ddsdds'}`).expect(400);
  });

  it('should return 403 if the user is not authorized', async () => {
    await app.delete(`/api/users/${testId[0]}`).expect(401);
  });

  it('should return 404 if user not found', async () => {
    await app
      .delete(`/api/users/6291257d-58ad-0000-0000-8d37bec6c1c5`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });

  it('should return 204 if user profile is successfully deleted by admin', async () => {
    await app
      .delete(`/api/users/${testId[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(204);
  });

  it('should return 204 if the user has successfully deleted his profile', async () => {
    await app
      .delete(`/api/users/${testId[1]}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(204);
  });
});

describe('GET /api/users', () => {
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  it('should return 401 if the user not authorized', async () => {
    const res = await app.get(`/api/users`).query({ pageSize: 2, page: 1 });

    expect(res.statusCode).toBe(401);
  });

  it('should return 403 if user role not equal Admin', async () => {
    const res = await app
      .get('/api/users')
      .query({ pageSize: 2, page: 1 })
      .set('Authorization', `Bearer ${bearerUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.text).toBe('Forbidden');
  });

  // it('should return 200 if and an array all experiences', async () => {
  //   const res = await app
  //     .get('/api/experience')
  //     .query({ pageSize: 10, page: 1 })
  //     .set('Authorization', `Bearer ${bearerAdminToken}`);

  //   expect(res.statusCode).toBe(200);
  //   expect(res.get('X-total-count')).toEqual(allExp.length.toString());
  // });
});

describe('GET /api/users/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const adminId = 'd0e76be2-11a9-4b69-af26-7644d4c18913';
  const userId = '7c26f167-1bf0-496e-8d42-66af6f7ba28d';

  it('should return 403 if the user is not authorized', async () => {
    await app.get(`/api/users/${userId}`).expect(401);
  });

  it('should return 404 if user not found', async () => {
    const res = await app
      .get(`/api/users/7c26f167-0000-0000-0000-66af6f7ba28d`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);

    expect(res.body.message).toBe('User not found');
  });

  it('should return 200 and user profile for admin', async () => {
    await app
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(200);
  });

  it('should return 200 and user profile for user', async () => {
    await app
      .get(`/api/users/${adminId}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .expect(200);
  });
});

describe('PUT /api/users/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const adminId = 'd0e76be2-11a9-4b69-af26-7644d4c18913';
  const userId = '7c26f167-1bf0-496e-8d42-66af6f7ba28d';

  const testUserWrongForm = {
    firstName: 'user',
    lastName: 'test',
    title: 'title',
    summary: '',
    email: 'useremail.com',
    password: 'qwerty12345',
    role: 'user',
  };

  it('should return 400 and reject invalid path param', async () => {
    await app.put(`/api/users/${'ddsdds'}`).expect(400);
  });

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .put(`/api/users/${adminId}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .field('firstName', testUserWrongForm.firstName)
      .field('lastName', testUserWrongForm.lastName)
      .field('title', testUserWrongForm.title)
      .field('summary', testUserWrongForm.summary)
      .field('email', testUserWrongForm.email)
      .field('password', testUserWrongForm.password)
      .field('role', testUserWrongForm.role);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid value');
    expect(res.body.errors[1].msg).toBe('Invalid value');
  });

  it('should return 403 if the user is not authorized', async () => {
    await app.put(`/api/users/${adminId}`).expect(401);
  });

  it('should return 200 if admin updates his profile', async () => {
    const res = await app
      .put(`/api/users/${adminId}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .field('title', 'computer software developer');

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('computer software developer');
  });

  it('should return 200 if user updates his profile', async () => {
    const res = await app
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .field('title', 'python and js developer');

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('python and js developer');
  });

  it('should return 404 if user not found', async () => {
    await app
      .delete(`/api/users/cf68f4ac-0000-2222-3333-8831dddcbd9b`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });
});
