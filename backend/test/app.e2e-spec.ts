import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

describe('TeamBoard API (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;

  let accessToken: string;
  let projectId: string;
  let eveUserId: string;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    process.env.JWT_SECRET = 'e2e-test-secret-key-not-for-production';
    process.env.JWT_EXPIRES_IN = '1h';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it('signs a new user up', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/signup').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'StrongPassw0rd!',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.email).toBe('ada@example.com');
  });

  it('rejects a duplicate signup', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/signup').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'StrongPassw0rd!',
    });

    expect(response.status).toBe(409);
  });

  it('logs the user in', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: 'ada@example.com',
      password: 'StrongPassw0rd!',
    });

    expect(response.status).toBe(200);
    accessToken = response.body.data.accessToken;
    expect(accessToken).toBeDefined();
  });

  it('rejects requests without a token', async () => {
    const response = await request(app.getHttpServer()).get('/api/projects');
    expect(response.status).toBe(401);
  });

  it('creates a project for the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Website Redesign', description: 'Q3 marketing site revamp' });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Website Redesign');
    projectId = response.body.data.id;
  });

  it('lists projects for the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('creates a task within the project', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Set up CI pipeline', priority: 'high' });

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Set up CI pipeline');
    expect(response.body.data.status).toBe('todo');
  });

  it('lists tasks for the project', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('rejects access to a project from a user who is not a member', async () => {
    await request(app.getHttpServer()).post('/api/auth/signup').send({
      name: 'Eve Outsider',
      email: 'eve@example.com',
      password: 'AnotherPassw0rd!',
    });
    const loginResponse = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: 'eve@example.com',
      password: 'AnotherPassw0rd!',
    });
    const eveToken = loginResponse.body.data.accessToken;

    const response = await request(app.getHttpServer())
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${eveToken}`);

    expect(response.status).toBe(403);

    eveUserId = (
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${eveToken}`)
    ).body.data.id;
  });

  it('rejects assigning a task to a user who is not a project member', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Should fail', assignee: eveUserId });

    expect(response.status).toBe(400);
  });

  it('lists project members for populating an assignee picker', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([
      expect.objectContaining({ email: 'ada@example.com', name: 'Ada Lovelace' }),
    ]);
  });

  it('assigns a task to a project member and then clears the assignee', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Write release notes' });
    const taskId = createResponse.body.data.id;

    const meResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    const ownAccountId = meResponse.body.data.id;

    const assignResponse = await request(app.getHttpServer())
      .patch(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ assignee: ownAccountId });
    expect(assignResponse.status).toBe(200);
    expect(assignResponse.body.data.assignee).toBe(ownAccountId);

    const clearResponse = await request(app.getHttpServer())
      .patch(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ assignee: '' });
    expect(clearResponse.status).toBe(200);
    expect(clearResponse.body.data.assignee).toBeNull();
  });
});
