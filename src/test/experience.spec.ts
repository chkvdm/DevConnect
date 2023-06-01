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

describe('POST /api/experience', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const experienceWrongForm = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 121212,
    role: 'Tester',
    startDate: ' ',
    endDate: '2022-22-22',
    description: 'The Description',
  };

  const adminExperience = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'first company',
    role: 'developer',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const userExperience = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    companyName: 'second company',
    role: 'project manager',
    startDate: '2017-03-03',
    endDate: '2023-01-01',
    description: 'manager description',
  };

  it('should return 401 if user not authorization', async () => {
    const res = await app.post('/api/experience');

    expect(res.statusCode).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .post('/api/experience')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: experienceWrongForm.userId,
        companyName: experienceWrongForm.companyName,
        role: experienceWrongForm.role,
        startDate: experienceWrongForm.startDate,
        endDate: experienceWrongForm.endDate,
        description: experienceWrongForm.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid start date');
    expect(res.body.errors[1].msg).toBe('Invalid value');
  });

  let id: number;

  it('should return 201 and create new admin experience', async () => {
    const res = await app
      .post('/api/experience')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: adminExperience.userId,
        companyName: adminExperience.companyName,
        role: adminExperience.role,
        startDate: adminExperience.startDate,
        endDate: adminExperience.endDate,
        description: adminExperience.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe(adminExperience.userId);
    expect(res.body.companyName).toBe(adminExperience.companyName);
    expect(res.body.role).toBe(adminExperience.role);
    expect(res.body.startDate).toBe(adminExperience.startDate);
    expect(res.body.endDate).toBe(adminExperience.endDate);
    expect(res.body.description).toBe(adminExperience.description);

    id = res.body.id;
  });

  it('should return 400 if experience already exsist', async () => {
    const res = await app
      .post('/api/experience')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: adminExperience.userId,
        companyName: adminExperience.companyName,
        role: adminExperience.role,
        startDate: adminExperience.startDate,
        endDate: adminExperience.endDate,
        description: adminExperience.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Such experience already exists');

    await app
      .delete(`/api/experience/${id}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(204);
  });

  it('should return 201 and create new user experience', async () => {
    const res = await app
      .post('/api/experience')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        userId: userExperience.userId,
        companyName: userExperience.companyName,
        role: userExperience.role,
        startDate: userExperience.startDate,
        endDate: userExperience.endDate,
        description: userExperience.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe(userExperience.userId);
    expect(res.body.companyName).toBe(userExperience.companyName);
    expect(res.body.role).toBe(userExperience.role);
    expect(res.body.startDate).toBe(userExperience.startDate);
    expect(res.body.endDate).toBe(userExperience.endDate);
    expect(res.body.description).toBe(userExperience.description);

    id = res.body.id;

    await app
      .delete(`/api/experience/${res.body.id}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .expect(204);
  });
});

describe('GET /api/experience', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const adminExperienceOne = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'first company',
    role: 'developer',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const adminExperienceTwo = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'second company',
    role: 'developer',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const adminExperienceThree = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'third company',
    role: 'developer',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const allExp = [adminExperienceOne, adminExperienceTwo, adminExperienceThree];

  const expIds: Array<number> = [];

  beforeAll(async () => {
    await Promise.all(
      allExp.map(async (experience) => {
        const res = await app
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

        expIds.push(res.body.id);
      })
    );
  });

  afterAll(async () => {
    await Promise.all(
      expIds.map(async (id) => {
        await app
          .delete(`/api/experience/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    expIds.length = 0;
  });

  it('should return 401 if the user not authorized', async () => {
    const res = await app
      .get(`/api/experience`)
      .query({ pageSize: 2, page: 1 });

    expect(res.statusCode).toBe(401);
  });

  it('should return 403 if user role not equal Admin', async () => {
    const res = await app
      .get('/api/experience')
      .query({ pageSize: 2, page: 1 })
      .set('Authorization', `Bearer ${bearerUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.text).toBe('Forbidden');
  });
});

describe('GET /api/experience/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';

  const adminExperienceOne = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'first company',
    role: 'developer',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const adminExperienceTwo = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'second company',
    role: 'developer',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const adminExperienceThree = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'third company',
    role: 'developer',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const allExp = [adminExperienceOne, adminExperienceTwo, adminExperienceThree];

  const expIds: Array<number> = [];

  beforeAll(async () => {
    await Promise.all(
      allExp.map(async (experience) => {
        const res = await app
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

        expIds.push(res.body.id);
      })
    );
  });

  afterAll(async () => {
    await Promise.all(
      expIds.map(async (id) => {
        await app
          .delete(`/api/experience/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    expIds.length = 0;
  });

  it('should return 403 if the user is not authorized', async () => {
    await Promise.all(
      expIds.map(async (id) => {
        await app.get(`/api/experience/${id}`).expect(401);
      })
    );
  });

  it('should return 200 and return experience by id', async () => {
    await Promise.all(
      expIds.map(async () => {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < allExp.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          const res = await app
            .get(`/api/experience/${expIds[i]}`)
            .set('Authorization', `Bearer ${bearerAdminToken}`)
            .expect(200);

          expect(res.body.userId).toBe(allExp[i].userId);
          expect(res.body.companyName).toBe(allExp[i].companyName);
          expect(res.body.role).toBe(allExp[i].role);
          expect(res.body.startDate).toBe(allExp[i].startDate);
          expect(res.body.endDate).toBe(allExp[i].endDate);
          expect(res.body.description).toBe(allExp[i].description);
        }
      })
    );
  });

  it('should return 404 if experience not found', async () => {
    await app
      .get(`/api/experience/98765`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });
});

describe('PUT /api/experience/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const adminExperienceOne = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'first company',
    role: 'developer',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const adminUpdateExperience = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    companyName: 'first company',
    role: 'update role',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const userExperienceOne = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    companyName: 'user compsny',
    role: 'junior',
    startDate: '2015-10-10',
    endDate: '2023-01-01',
    description: 'user junior developer',
  };

  const userUpdateExperience = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    companyName: 'user compsny',
    role: 'update user role',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'update user description developer',
  };

  const allExp = [adminExperienceOne, userExperienceOne];

  const expIds: Array<number> = [];

  beforeAll(async () => {
    await Promise.all(
      allExp.map(async (experience) => {
        const res = await app
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

        expIds.push(res.body.id);
      })
    );
  });

  afterAll(async () => {
    await Promise.all(
      expIds.map(async (id) => {
        await app
          .delete(`/api/experience/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    expIds.length = 0;
  });

  it('should return 400 and reject invalid path param', async () => {
    await app.put(`/api/experience/${'ddsdds'}`).expect(400);
  });

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .put(`/api/experience/${expIds[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: 25,
        companyName: adminExperienceOne.companyName,
        role: adminExperienceOne.role,
        startDate: 25,
        endDate: adminExperienceOne.endDate,
        description: adminExperienceOne.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid start date');
    expect(res.body.errors[1].msg).toBe('Invalid value');
  });

  it('should return 403 if the user is not authorized', async () => {
    await app.put(`/api/experience/${expIds[0]}`).expect(401);
  });

  it('should return 200 and updated admin experience', async () => {
    const res = await app
      .put(`/api/experience/${expIds[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: adminUpdateExperience.userId,
        companyName: adminUpdateExperience.companyName,
        role: adminUpdateExperience.role,
        startDate: adminUpdateExperience.startDate,
        endDate: adminUpdateExperience.endDate,
        description: adminUpdateExperience.description,
      })
      .expect(200);

    expect(res.body.userId).toBe(adminUpdateExperience.userId);
    expect(res.body.companyName).toBe(adminUpdateExperience.companyName);
    expect(res.body.role).toBe(adminUpdateExperience.role);
    expect(res.body.startDate).toBe(adminUpdateExperience.startDate);
    expect(res.body.endDate).toBe(adminUpdateExperience.endDate);
    expect(res.body.description).toBe(adminUpdateExperience.description);
  });

  it('should return 200 and updated user experience', async () => {
    const res = await app
      .put(`/api/experience/${expIds[1]}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        userId: userUpdateExperience.userId,
        companyName: userUpdateExperience.companyName,
        role: userUpdateExperience.role,
        startDate: userUpdateExperience.startDate,
        endDate: userUpdateExperience.endDate,
        description: userUpdateExperience.description,
      })
      .expect(200);

    expect(res.body.userId).toBe(userUpdateExperience.userId);
    expect(res.body.companyName).toBe(userUpdateExperience.companyName);
    expect(res.body.role).toBe(userUpdateExperience.role);
    expect(res.body.startDate).toBe(userUpdateExperience.startDate);
    expect(res.body.endDate).toBe(userUpdateExperience.endDate);
    expect(res.body.description).toBe(userUpdateExperience.description);
  });

  it('should return 404 if experience not found', async () => {
    await app
      .put(`/api/experience/98765`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });
});

describe('DELETE /api/experience/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const userExperienceOne = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    companyName: 'first company',
    role: 'developer',
    startDate: '2000-02-02',
    endDate: '2005-05-05',
    description: 'description developer',
  };

  const userExperienceTwo = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    companyName: 'user compsny',
    role: 'junior',
    startDate: '2015-10-10',
    endDate: '2023-01-01',
    description: 'user junior developer',
  };

  const allExp = [userExperienceOne, userExperienceTwo];

  const expIds: Array<number> = [];

  beforeAll(async () => {
    await Promise.all(
      allExp.map(async (experience) => {
        const res = await app
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

        expIds.push(res.body.id);
      })
    );
  });

  afterAll(async () => {
    expIds.length = 0;
  });

  it('should return 400 and reject invalid path param', async () => {
    await app.delete(`/api/experience/${'ddsdds'}`).expect(400);
  });

  it('should return 403 if the user is not authorized', async () => {
    await app.delete(`/api/experience/${expIds[0]}`).expect(401);
  });

  it('should return 404 if experience not found', async () => {
    await app
      .delete(`/api/experience/98765`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });

  it('should return 204 if the user has successfully deleted their experience', async () => {
    await app
      .delete(`/api/experience/${expIds[0]}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .expect(204);
  });

  it("should return 204 if the admin has successfully deleted user's experience", async () => {
    await app
      .delete(`/api/experience/${expIds[1]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(204);
  });
});
