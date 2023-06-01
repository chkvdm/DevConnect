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
  server.close((err) => {
    if (err) {
      logger.error(err);
      done();
    }
    done();
  });
});

describe('POST /api/projects', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const projectWrongForm = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    description: '',
  };

  const adminProject = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    description: 'my itodo project',
  };

  const userProject = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    description: 'capstone project',
  };

  it('should return 401 if user not authorization', async () => {
    const res = await app.post('/api/projects');

    expect(res.statusCode).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .post('/api/projects')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: projectWrongForm.userId,
        description: projectWrongForm.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid value');
  });

  let id: number;

  it('should return 201 and create new project user project', async () => {
    const res = await app
      .post('/api/projects')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: adminProject.userId,
        description: adminProject.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe(adminProject.userId);
    expect(res.body.description).toBe(adminProject.description);

    id = res.body.id;
  });

  it('should return 400 if such project already exsist', async () => {
    const res = await app
      .post('/api/projects')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: adminProject.userId,
        description: adminProject.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('This project already exists');

    await app
      .delete(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(204);
  });

  it('should return 201 and create new project to admin', async () => {
    const res = await app
      .post('/api/projects')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        userId: userProject.userId,
        description: userProject.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe(userProject.userId);
    expect(res.body.description).toBe(userProject.description);

    id = res.body.id;

    await app
      .delete(`/api/projects/${res.body.id}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .expect(204);
  });
});

describe('GET /api/projects', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const projectOne = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    description: 'itodo project',
  };

  const projectTwo = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    description: 'mongodb project',
  };

  const projectThree = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    description: 'mysql project',
  };

  const allFeed = [projectOne, projectTwo, projectThree];

  const feedIds: Array<number> = [];

  beforeAll(async () => {
    await Promise.all(
      allFeed.map(async (project) => {
        const res = await app
          .post('/api/projects')
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .send({
            userId: project.userId,
            description: project.description,
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
          .delete(`/api/projects/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    feedIds.length = 0;
  });

  it('should return 401 if the user not authorized', async () => {
    const res = await app.get(`/api/projects`).query({ pageSize: 2, page: 1 });

    expect(res.statusCode).toBe(401);
  });

  it('should return 403 if user role not equal Admin', async () => {
    const res = await app
      .get('/api/projects')
      .query({ pageSize: 2, page: 1 })
      .set('Authorization', `Bearer ${bearerUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.text).toBe('Forbidden');
  });
});

describe('GET /api/projects/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';

  const projectOne = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    description: 'itodo project',
  };

  const projectTwo = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    description: 'mongodb project',
  };

  const projectThree = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    description: 'mysql project',
  };

  const allPj = [projectOne, projectTwo, projectThree];

  const pjIds: Array<number> = [];

  beforeAll(async () => {
    await Promise.all(
      allPj.map(async (project) => {
        const res = await app
          .post('/api/projects')
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .send({
            userId: project.userId,
            description: project.description,
          })
          .set('Content-Type', 'application/json')
          .expect(201);

        pjIds.push(res.body.id);
      })
    );
  });

  afterAll(async () => {
    await Promise.all(
      pjIds.map(async (id) => {
        await app
          .delete(`/api/projects/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    pjIds.length = 0;
  });

  it('should return 403 if the user is not authorized', async () => {
    await Promise.all(
      pjIds.map(async (id) => {
        await app.get(`/api/projects/${id}`).expect(401);
      })
    );
  });

  it('should return 200 and project by id', async () => {
    await Promise.all(
      pjIds.map(async () => {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < allPj.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          const res = await app
            .get(`/api/projects/${pjIds[i]}`)
            .set('Authorization', `Bearer ${bearerAdminToken}`)
            .expect(200);

          expect(res.body.userId).toBe(allPj[i].userId);
          expect(res.body.description).toBe(allPj[i].description);
        }
      })
    );
  });

  it('should return 404 if project not found', async () => {
    await app
      .get(`/api/projects/98765`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });
});

describe('PUT /api/projects/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const projectOne = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    description: 'itodo project',
  };

  const updateProjectOne = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    description: 'itodo full project',
  };

  const projectTwo = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    description: 'mysql project',
  };

  const updateProjectTwo = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    description: 'mysql with graphql project',
  };

  const pjIds: Array<number> = [];

  beforeAll(async () => {
    const res = await app
      .post('/api/projects')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: projectOne.userId,
        description: projectOne.description,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    pjIds.push(res.body.id);
  });

  beforeAll(async () => {
    const res = await app
      .post('/api/projects')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        userId: projectTwo.userId,
        description: projectTwo.description,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    pjIds.push(res.body.id);
  });

  afterAll(async () => {
    await Promise.all(
      pjIds.map(async (id) => {
        await app
          .delete(`/api/projects/${id}`)
          .set('Authorization', `Bearer ${bearerAdminToken}`)
          .expect(204);
      })
    );
    pjIds.length = 0;
  });

  it('should return 400 and reject invalid path param', async () => {
    await app.put(`/api/projects/${'ddsdds'}`).expect(400);
  });

  it('should return 400 and reject invalid form data', async () => {
    const res = await app
      .put(`/api/projects/${pjIds[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: 25,
        description: projectOne.description,
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid value');
  });

  it('should return 403 if the user is not authorized', async () => {
    await app.put(`/api/projects/${pjIds[0]}`).expect(401);
  });

  it('should return 200 and updated admin project', async () => {
    const res = await app
      .put(`/api/projects/${pjIds[0]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: updateProjectOne.userId,
        description: updateProjectOne.description,
      })
      .expect(200);

    expect(res.body.userId).toBe(updateProjectOne.userId);
    expect(res.body.description).toBe(updateProjectOne.description);
  });

  it('should return 200 and updated user project', async () => {
    const res = await app
      .put(`/api/projects/${pjIds[1]}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        userId: updateProjectTwo.userId,
        description: updateProjectTwo.description,
      })
      .expect(200);

    expect(res.body.userId).toBe(updateProjectTwo.userId);
    expect(res.body.description).toBe(updateProjectTwo.description);
  });

  it('should return 404 if project not found', async () => {
    await app
      .put(`/api/projects/98765`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });
});

describe('DELETE /api/projects/:id', () => {
  const bearerAdminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQwZTc2YmUyLTExYTktNGI2OS1hZjI2LTc2NDRkNGMxODkxMyIsImlhdCI6MTY4NDMxNjg0N30.tvCXMJtmYRAkA7MMMlHLRuXXWvResm6UjKOIrxU0hGs';
  const bearerUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMjZmMTY3LTFiZjAtNDk2ZS04ZDQyLTY2YWY2ZjdiYTI4ZCIsImlhdCI6MTY4NDMxNjkyOX0.RR-LNGeDqpXQx8BRyV3lNm7v7FPivTSTBQboO2lZyCw';

  const projectOne = {
    userId: 'd0e76be2-11a9-4b69-af26-7644d4c18913',
    description: 'itodo project',
  };

  const projectTwo = {
    userId: '7c26f167-1bf0-496e-8d42-66af6f7ba28d',
    description: 'mysql project',
  };

  const pjIds: Array<number> = [];

  beforeAll(async () => {
    const res = await app
      .post('/api/projects')
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .send({
        userId: projectOne.userId,
        description: projectOne.description,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    pjIds.push(res.body.id);
  });

  beforeAll(async () => {
    const res = await app
      .post('/api/projects')
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .send({
        userId: projectTwo.userId,
        description: projectTwo.description,
      })
      .set('Content-Type', 'application/json')
      .expect(201);

    pjIds.push(res.body.id);
  });

  afterAll(async () => {
    pjIds.length = 0;
  });

  it('should return 400 and reject invalid path param', async () => {
    await app
      .delete(`/api/projects/${'ddsdds'}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(400);
  });

  it('should return 403 if the user is not authorized', async () => {
    await app.delete(`/api/projects/${pjIds[0]}`).expect(401);
  });

  it('should return 404 if project not found', async () => {
    await app
      .delete(`/api/projects/98765`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(404);
  });

  it('should return 204 if the user has successfully deleted their project', async () => {
    await app
      .delete(`/api/projects/${pjIds[0]}`)
      .set('Authorization', `Bearer ${bearerUserToken}`)
      .expect(204);
  });

  it("should return 204 if the admin has successfully deleted user's project", async () => {
    await app
      .delete(`/api/projects/${pjIds[1]}`)
      .set('Authorization', `Bearer ${bearerAdminToken}`)
      .expect(204);
  });
});
