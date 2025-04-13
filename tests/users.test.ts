import request from 'supertest';
import { closeDB, dbConnection } from '../src/db/mongo.js';
import { app } from '../src/app';
import { UserSchema } from '../src/db/Models/User.js';
import { AuthTokenModel } from '../src/db/Models/Auth.js';

describe('Authentication Endpoints - /api/v1/auth', () => {
  const url = '/api/v1/auth';

  // conection to the database before all tests
  beforeAll(async () => {
    await dbConnection();
  });

  // close the connection to the database after all tests
  afterAll(async () => {
    const query = UserSchema.deleteMany({user: "test 2"});
    await query.exec();

    const query2 = AuthTokenModel.deleteMany({});
    await query2.exec();

    await closeDB();
  });

  describe('Register', () => {

    it('should return code 400 when property "user" is not defined.', async () => {
      const credentials = { password: 'test' };

      const response = await request(app)
        .post(`${url}/register`)
        .send(credentials)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should return code 400 when property "password" is not defined.', async () => {
      const credentials = { email: 'test@gmail.com', user: "test" };

      const response = await request(app)
        .post(`${url}/register`)
        .send(credentials)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should return code 400 when property "email" is not defined.', async () => {
      const credentials = { password: 'test', user: "test" };

      const response = await request(app)
        .post(`${url}/register`)
        .send(credentials)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should return token if user created successfully.', async () => {
      const credentials = { password: 'test 2', user: "test", email: "test@gmail.com" };

      const response = await request(app)
        .post(`${url}/register`)
        .send(credentials)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
    });

    it('should return code 403 if user already exists.', async () => {
      const credentials = { password: 'test 2', user: "test", email: "test@gmail.com" };

      const response = await request(app)
        .post(`${url}/register`)
        .send(credentials)
        .set('Accept', 'application/json');

      expect(response.status).toBe(403);
    });
  })

  describe('Login', () => {
    it('should return code 400 when property "user" is not defined.', async () => {
      const credentials = { password: 'test' };

      const response = await request(app)
        .post(`${url}/login`)
        .send(credentials)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should return code 400 when property "password" is not defined.', async () => {
      const credentials = {user: "test"}

      const response = await request(app)
        .post(`${url}/login`)
        .send(credentials)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
    });

    it('should return token on login successfully', async () => {
    const credentials = { password: 'test 2', user: "test@gmail.com" };
    const response = await request(app)
        .post(`${url}/login`)
        .send(credentials)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });
});

