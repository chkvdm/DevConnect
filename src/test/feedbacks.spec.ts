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

describe('POST /api/feedback', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const feedbackWrongForm = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: ' ',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: ' ',
  };

  const adminFeedback = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'user company first',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: 'greate work',
  };

  const userFeedback = {
    fromUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    companyName: 'admin company',
    toUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    content: 'cool content',
  };

  it('should return 401 if user not authorization', async () => {
    const res = await app.post('/api/feedback');

    expect(res.statusCode).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: feedbackWrongForm.fromUser,
        companyName: feedbackWrongForm.companyName,
        toUser: feedbackWrongForm.toUser,
        content: feedbackWrongForm.content,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid company name');
    expect(res.body.errors[1].msg).toBe('Invalid content');
  });

  let id: number;

  it('should return 201 and create new feedback to user', async () => {
    const res = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: adminFeedback.fromUser,
        companyName: adminFeedback.companyName,
        toUser: adminFeedback.toUser,
        content: adminFeedback.content,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.fromUser).toBe(adminFeedback.fromUser);
    expect(res.body.companyName).toBe(adminFeedback.companyName);
    expect(res.body.toUser).toBe(adminFeedback.toUser);
    expect(res.body.content).toBe(adminFeedback.content);

    id = res.body.id;
  });

  it('should return 400 if such feedback already exsist', async () => {
    const res = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: adminFeedback.fromUser,
        companyName: adminFeedback.companyName,
        toUser: adminFeedback.toUser,
        content: adminFeedback.content,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Such feedback already exists');

    await app
      .delete(`/api/feedback/${id}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(204);
  });

  it('should return 201 and create new feedback to admin', async () => {
    const res = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        fromUser: userFeedback.fromUser,
        companyName: userFeedback.companyName,
        toUser: userFeedback.toUser,
        content: userFeedback.content,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.fromUser).toBe(userFeedback.fromUser);
    expect(res.body.companyName).toBe(userFeedback.companyName);
    expect(res.body.toUser).toBe(userFeedback.toUser);
    expect(res.body.content).toBe(userFeedback.content);

    id = res.body.id;

    await app
      .delete(`/api/feedback/${res.body.id}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .expect(204);
  });

  it('should return 400 if user tries to create feedback for himself', async () => {
    const res = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        fromUser: userFeedback.fromUser,
        companyName: userFeedback.companyName,
        toUser: adminFeedback.toUser,
        content: userFeedback.content,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      'feedback is allowed only for another user and on your behalf'
    );
  });

  it('should return 404 if user tries to create feedback for non existing user', async () => {
    const res = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        fromUser: userFeedback.fromUser,
        companyName: userFeedback.companyName,
        toUser: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
        content: userFeedback.content,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('user about which feedback not exists');
  });
});

describe('GET /api/feedback', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const adminFeedback = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'user company first',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: 'greate work',
  };

  const adminFeedbackTwo = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'user company second',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: 'amazing content',
  };

  const allFeed = [adminFeedback, adminFeedbackTwo];

  const feedIds: Array<number> = [];

  beforeAll(async () => {
    await Promise.all(
      allFeed.map(async (feedback) => {
        const res = await app
          .post('/api/feedback')
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .send({
            fromUser: feedback.fromUser,
            companyName: feedback.companyName,
            toUser: feedback.toUser,
            content: feedback.content,
          })
          .set('Content-Type', 'application/json')
          .expect(201);

        feedIds.push(res.body.id);
      })
    );
  });

  afterAll(async () => {
    await Promise.all(
      feedIds.map(async (id) => {
        await app
          .delete(`/api/feedback/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    feedIds.length = 0;
  });

  it('should return 401 if the user not authorized', async () => {
    const res = await app.get(`/api/feedback`).query({ pageSize: 2, page: 1 });

    expect(res.statusCode).toBe(401);
  });

  it('should return 403 if user role not equal Admin', async () => {
    const res = await app
      .get('/api/feedback')
      .query({ pageSize: 2, page: 1 })
      .set('Authorization', `Bearer ${bearerUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.text).toBe('Forbidden');
  });
});

describe('GET /api/feedback/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';

  const adminFeedback = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'user company first',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: 'greate work',
  };

  const adminFeedbackTwo = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'user company second',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: 'amazing content',
  };

  const adminFeedbackThree = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'user company third',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: 'amazing content',
  };

  const allFeed = [adminFeedback, adminFeedbackTwo, adminFeedbackThree];

  const feedIds: Array<number> = [];

  beforeAll(async () => {
    const resOne = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: adminFeedback.fromUser,
        companyName: adminFeedback.companyName,
        toUser: adminFeedback.toUser,
        content: adminFeedback.content,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    feedIds.push(resOne.body.id);

    const resTwo = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: adminFeedbackTwo.fromUser,
        companyName: adminFeedbackTwo.companyName,
        toUser: adminFeedbackTwo.toUser,
        content: adminFeedbackTwo.content,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    feedIds.push(resTwo.body.id);

    const resThree = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: adminFeedbackThree.fromUser,
        companyName: adminFeedbackThree.companyName,
        toUser: adminFeedbackThree.toUser,
        content: adminFeedbackThree.content,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    feedIds.push(resThree.body.id);
  });

  afterAll(async () => {
    await Promise.all(
      feedIds.map(async (id) => {
        await app
          .delete(`/api/feedback/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    feedIds.length = 0;
  });

  it('should return 403 if the user is not authorized', async () => {
    await Promise.all(
      feedIds.map(async (id) => {
        await app.get(`/api/feedback/${id}`).expect(401);
      })
    );
  });

  it('should return 200 and return feedback by id', async () => {
    await Promise.all(
      feedIds.map(async () => {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < feedIds.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          const res = await app
            .get(`/api/feedback/${feedIds[i]}`)
            .set('Authorization', `Bearer ${bearerAdminToken}`)
            .expect(200);

          expect(res.body.fromUser).toBe(allFeed[i].fromUser);
          expect(res.body.companyName).toBe(allFeed[i].companyName);
          expect(res.body.toUser).toBe(allFeed[i].toUser);
          expect(res.body.content).toBe(allFeed[i].content);
        }
      })
    );
  });

  it('should return 404 if feedback not found', async () => {
    await app
      .get(`/api/feedback/98765`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });
});

describe('PUT /api/feedback/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const adminFeedback = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'user company first',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: 'greate work',
  };

  const adminUpdateFeedback = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'first',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: 'greate',
  };

  const userFeedback = {
    fromUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    companyName: 'user company second',
    toUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    content: 'amazing content',
  };

  const userUpdateFeedback = {
    fromUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    companyName: 'second',
    toUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    content: 'amazing',
  };

  const wrongDataFeedback = {
    fromUser: 25,
    companyName: adminFeedback.companyName,
    toUser: adminFeedback.toUser,
    content: 25,
  };

  const feedIds: Array<number> = [];

  beforeAll(async () => {
    const res = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: adminFeedback.fromUser,
        companyName: adminFeedback.companyName,
        toUser: adminFeedback.toUser,
        content: adminFeedback.content,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    feedIds.push(res.body.id);

    const resUsr = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        fromUser: userFeedback.fromUser,
        companyName: userFeedback.companyName,
        toUser: userFeedback.toUser,
        content: userFeedback.content,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    feedIds.push(resUsr.body.id);
  });

  afterAll(async () => {
    await Promise.all(
      feedIds.map(async (id) => {
        await app
          .delete(`/api/feedback/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    feedIds.length = 0;
  });

  it('should return 400 and reject invalid path param', async () => {
    await app.put(`/api/feedback/${'ddsdds'}`).expect(400);
  });

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .put(`/api/feedback/${feedIds[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: wrongDataFeedback.fromUser,
        companyName: wrongDataFeedback.companyName,
        toUser: wrongDataFeedback.toUser,
        content: wrongDataFeedback.content,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid value');
    expect(res.body.errors[1].msg).toBe('Invalid value');
  });

  it('should return 403 if the user is not authorized', async () => {
    await app.put(`/api/feedback/${feedIds[0]}`).expect(401);
  });

  it('should return 200 and updated admin feedback', async () => {
    const res = await app
      .put(`/api/feedback/${feedIds[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: adminUpdateFeedback.fromUser,
        companyName: adminUpdateFeedback.companyName,
        toUser: adminUpdateFeedback.toUser,
        content: adminUpdateFeedback.content,
      })
      .expect(200);

    expect(res.body.fromUser).toBe(adminUpdateFeedback.fromUser);
    expect(res.body.companyName).toBe(adminUpdateFeedback.companyName);
    expect(res.body.toUser).toBe(adminUpdateFeedback.toUser);
    expect(res.body.content).toBe(adminUpdateFeedback.content);
  });

  it('should return 200 and updated user feedback', async () => {
    const res = await app
      .put(`/api/feedback/${feedIds[1]}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        fromUser: userUpdateFeedback.fromUser,
        companyName: userUpdateFeedback.companyName,
        toUser: userUpdateFeedback.toUser,
        content: userUpdateFeedback.content,
      })
      .expect(200);

    expect(res.body.fromUser).toBe(userUpdateFeedback.fromUser);
    expect(res.body.companyName).toBe(userUpdateFeedback.companyName);
    expect(res.body.toUser).toBe(userUpdateFeedback.toUser);
    expect(res.body.content).toBe(userUpdateFeedback.content);
  });

  it('should return 404 if feedback not found', async () => {
    await app
      .put(`/api/feedback/98765`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });
});

describe('DELETE /api/feedback/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const adminFeedback = {
    fromUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'company first',
    toUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    content: 'greate',
  };

  const userFeedback = {
    fromUser: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    companyName: 'second company',
    toUser: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    content: 'amazing',
  };

  const feedIds: Array<number> = [];

  beforeAll(async () => {
    const res = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        fromUser: adminFeedback.fromUser,
        companyName: adminFeedback.companyName,
        toUser: adminFeedback.toUser,
        content: adminFeedback.content,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    feedIds.push(res.body.id);
  });

  beforeAll(async () => {
    const res = await app
      .post('/api/feedback')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        fromUser: userFeedback.fromUser,
        companyName: userFeedback.companyName,
        toUser: userFeedback.toUser,
        content: userFeedback.content,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    feedIds.push(res.body.id);
  });

  afterAll(async () => {
    feedIds.length = 0;
  });

  it('should return 400 and reject invalid path param', async () => {
    await app
      .delete(`/api/feedback/${'ddsdds'}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(400);
  });

  it('should return 403 if the user is not authorized', async () => {
    await app.delete(`/api/feedback/${feedIds[0]}`).expect(401);
  });

  it('should return 404 if feedback not found', async () => {
    await app
      .delete(`/api/feedback/98765`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });

  it('should return 204 if the user has successfully deleted their feedback', async () => {
    await app
      .delete(`/api/feedback/${feedIds[1]}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .expect(204);
  });

  it("should return 204 if the admin has successfully deleted user's feedback", async () => {
    await app
      .delete(`/api/feedback/${feedIds[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(204);
  });
});
