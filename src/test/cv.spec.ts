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
      logger.error(err);
      done();
    }
    done();
  });
});

describe('GET /api/user/:userId/cv', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const experience = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'computer company',
    role: 'developer',
    startDate: '2021-01-01',
    endDate: '2022-02-12',
    description: 'developer experience',
  };

  const project = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    description: 'mysql project',
  };

  const feedback = {
    fromUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    toUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    content: 'amazing job!',
    companyName: 'best company',
  };

  const adminId: Array<string> = ['d0e76be2-11a9-4b69-af26-7644d4c18913'];
  const feedbackId: Array<number> = [];
  const projectsId: Array<number> = [];
  const experienceId: Array<number> = [];

  beforeAll(async () => {
    const resFeed = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        fromUser: feedback.fromUser,
        toUser: feedback.toUser,
        content: feedback.content,
        companyName: feedback.companyName,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    feedbackId.push(resFeed.body.id);

    const resPrj = await app
      .post('/api/projects')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: project.userId,
        description: project.description,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    projectsId.push(resPrj.body.id);

    const resExp = await app
      .post('/api/experience')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: experience.userId,
        companyName: experience.companyName,
        role: experience.role,
        startDate: experience.startDate,
        endDate: experience.endDate,
        description: experience.description,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    experienceId.push(resExp.body.id);
  });

  afterAll(async () => {
    await app
      .delete(`/api/feedback/${feedbackId[0]}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .expect(204);

    await app
      .delete(`/api/projects/${projectsId[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(204);

    await app
      .delete(`/api/experience/${experienceId[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(204);
  });

  it('should return 401 if user not authorization', async () => {
    const res = await app.get(`/api/user/${adminId[0]}/cv`);

    expect(res.statusCode).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  it('should return 400 if invalid path param', async () => {
    await app.get(`/api/user/abcd33/cv`).expect(400);
  });

  it('should return 404 if user not found', async () => {
    await app
      .get(`/api/user/'d0e76be2-11a9-4b69-af26-7644d4c00000'/cv`)
      .expect(400);
  });

  it('should return 200 and rerurn user CV', async () => {
    const res = await app
      .get(`/api/user/${adminId[0]}/cv`)
      .set('Authorization', `Bearer ${bearerAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.experiences)).toBe(true);
    expect(Array.isArray(res.body.projects)).toBe(true);
    expect(Array.isArray(res.body.feedbacks)).toBe(true);
  });

  it('should return 200 and rerurn user CV', async () => {
    const res = await app
      .get(`/api/user/${adminId[0]}/cv`)
      .set('Authorization', `Bearer ${bearerUserToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.experiences)).toBe(true);
    expect(Array.isArray(res.body.projects)).toBe(true);
    expect(Array.isArray(res.body.feedbacks)).toBe(true);
  });
});
