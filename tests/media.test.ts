import request from 'supertest';
import { app } from '../src/app.js';
import { AuthTokenModel } from '../src/db/Models/Auth.js';
import { UserSchema } from '../src/db/Models/User.js';
import { closeDB, dbConnection } from '../src/db/mongo.js';

describe("Media Endpoints -> /api/v1/", () => {
  let token: string;
  let mediaId: string;
  const url = "/api/v1/";

  beforeAll(async () => {
    //Create Database Connection
    await dbConnection();

    //Create Test User
    const media = { password: 'test', user: "test", email: "test@gmail.com" };

    //Register Test User
    const response = await request(app)
      .post(`${url}/register`)
      .send(media)
      .set('Accept', 'application/json');

    //Save Token
    token = response.body.token;
  });

  afterAll(async () => {
    //Delete Test User
    const query2 = UserSchema.deleteMany({ user: "test" });
    await query2.exec();

    //Delete Test Token
    const query3 = AuthTokenModel.deleteMany({ token: token });
    await query3.exec();

    //Close Database Connection
    await closeDB();
  });

  describe("Create a new Media", () => {

    it('should return code 400 when property "name" is not defined.', async () => {
      const media = {
        "completedDate": "2023-08-20",
        "score": 7.2,
        "comment": "test 6",
        "poster": "https://test/",
        "mediaType": "Anime",
        "language": "Sub-Spanish"
      };

      const response = await request(app)
        .post(`${url}/register`)
        .send(media)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it('should return code 400 when property "completedDate" is not defined.', async () => {
      const media = {
        "name": "Test",
        "score": 7.2,
        "comment": "test 6",
        "poster": "https://test/",
        "mediaType": "Anime",
        "language": "Sub-Spanish"
      };

      const response = await request(app)
        .post(`${url}addMedia`)
        .send(media)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it('should return code 400 when property "mediaType" is not defined.', async () => {
      const media = {
        "name": "Test",
        "completedDate": "2023-08-20",
        "score": 7.2,
        "comment": "test 6",
        "poster": "https://test/",
        "language": "Sub-Spanish"
      };

      const response = await request(app)
        .post(`${url}addMedia`)
        .send(media)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it('should return code 400 when property "language" is not defined.', async () => {
      const media = {
        "name": "Test",
        "completedDate": "2023-08-20",
        "score": 7.2,
        "comment": "test 6",
        "poster": "https://test/",
        "mediaType": "Anime"
      };

      const response = await request(app)
        .post(`${url}addMedia`)
        .send(media)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it('should return code 400 when property "score" is not a number.', async () => {
      const media = {
        "name": "Test",
        "completedDate": "2023-08-20",
        "score": "test",
        "comment": "test 6",
        "poster": "https://test/",
        "mediaType": "Anime"
      };

      const response = await request(app)
        .post(`${url}addMedia`)
        .send(media)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it('should return code 401 when Authorization header is not defined.', async () => {
      const media = {
        "name": "Test",
        "completedDate": "2023-08-20",
        "score": 7.2,
        "comment": "example",
        "poster": "https://test/",
        "mediaType": "Anime",
        "language": "spanish"
      };

      const response = await request(app)
        .post(`${url}addMedia`)
        .send(media)
        .set('Accept', 'application/json');


      expect(response.status).toBe(401);
    });

    it('should return code 201 when Media is created successfully.', async () => {
      const media = {
        "name": "Test",
        "completedDate": "2023-08-20",
        "score": 7.2,
        "comment": "example",
        "poster": "https://test/",
        "mediaType": "Anime",
        "language": "spanish"
      };

      const response = await request(app)
        .post(`${url}addMedia`)
        .send(media)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);


      expect(response.status).toBe(201);
    });

    it('should return code 201 when Media is created successfully by sending a list of media.', async () => {
      const media = [
        {
        "name": "Test 6",
        "completedDate": "2023-07-20",
        "score": 7.2,
        "comment": "test 6",
        "poster": "https://test/",
        "mediaType": "Anime",
        "language": "Sub-Spanish"
      },{
        "name": "Test 7",
        "completedDate": "2023-07-19",
        "score": 7.2,
        "comment": "test 6",
        "poster": "https://test/",
        "mediaType": "Anime",
        "language": "Sub-Spanish"
      },{
        "name": "Test 8",
        "completedDate": "2023-07-18",
        "score": 7.2,
        "comment": "test 6",
        "poster": "https://test/",
        "mediaType": "Anime",
        "language": "Sub-Spanish"
      },{
        "name": "Test 9",
        "completedDate": "2023-07-21",
        "score": 7.2,
        "comment": "test 6",
        "poster": "https://test/",
        "mediaType": "Anime",
        "language": "Sub-Spanish"
      },{
        "name": "Test 10",
        "completedDate": "2023-07-22",
        "score": 7.2,
        "comment": "test 6",
        "poster": "https://test/",
        "mediaType": "Anime",
        "language": "Sub-Spanish"
      }];

      const response = await request(app)
        .post(`${url}addMedia/?many=true`)
        .send(media)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);


      expect(response.status).toBe(201);
    });

  });

  describe("Lists Media items", () => {

    it('should return code 401 when Authorization header is not defined.', async () => {
      const response = await request(app)
        .get(`${url}`)
        .set('Accept', 'application/json');


      expect(response.status).toBe(401);
    });

    it('should return code 200 when get the media items.', async () => {
      const response = await request(app)
        .get(`${url}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      mediaId = response.body.data[0]?._id;

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.page).toHaveProperty('currentPage');
    });
  });

  describe("Get Media by ID", () => {

    it('should return code 401 when Authorization header is not defined.', async () => {
      const response = await request(app)
        .get(`${url}/${mediaId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
    });
    
    it('should return code 200 when get the media items.', async () => {
      const response = await request(app)
        .get(`${url}/${mediaId}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
    });
  });

  describe("Delete Media by ID", () => {

    it('should return code 401 when Authorization header is not defined.', async () => {
      const response = await request(app)
        .delete(`${url}/${mediaId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
    });
    
    it('should return code 200 when media have been deleted.', async () => {
      const response = await request(app)
        .delete(`${url}/${mediaId}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });

});