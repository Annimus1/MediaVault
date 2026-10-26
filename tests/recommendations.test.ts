import request from 'supertest';
import { app } from '../src/app.js';
import { closeDB, dbConnection } from '../src/db/mongo.js';
import { AuthTokenModel } from '../src/db/Models/Auth.js';
import { MediaModel } from '../src/db/Models/Media.js';
import { UserSchema } from '../src/db/Models/User.js';
import IaProvider from '../src/utils/IaProveiders/Provider.js';
import { getPosters } from '../src/utils/Posters.js';
import { parseRecommendations } from '../src/utils/recommendations.js';

jest.mock('../src/utils/IaProveiders/Provider.js', () => ({
  __esModule: true,
  default: { getRecommendation: jest.fn() }
}));

jest.mock('../src/utils/Posters.js', () => ({
  getPosters: jest.fn()
}));

const mockedGetRecommendation = IaProvider.getRecommendation as jest.Mock;
const mockedGetPosters = getPosters as jest.MockedFunction<typeof getPosters>;

const apiUrl = '/api/v1';
const emptyUser = { user: 'reco-empty', password: 'reco-test', email: 'reco-empty@example.com' };
const mediaUser = { user: 'reco-media', password: 'reco-test', email: 'reco-media@example.com' };

let emptyToken = '';
let mediaToken = '';

async function register(user: typeof emptyUser): Promise<string> {
  const response = await request(app)
    .post(`${apiUrl}/auth/register`)
    .send(user)
    .set('Accept', 'application/json');

  if (response.status !== 201 || !response.body.token) {
    throw new Error(`Unable to register ${user.user} (status ${response.status}).`);
  }

  return response.body.token as string;
}

async function cleanUp(): Promise<void> {
  await MediaModel.deleteMany({ name: { $regex: '^Reco Test' } }).exec();
  await UserSchema.deleteMany({ user: { $in: [emptyUser.user, mediaUser.user] } }).exec();
  await AuthTokenModel.deleteMany({ token: { $in: [emptyToken, mediaToken] } }).exec();
}

describe('Recommendations Endpoint -> /api/v1/recommendations', () => {
  beforeAll(async () => {
    await dbConnection();
    await cleanUp();

    emptyToken = await register(emptyUser);
    mediaToken = await register(mediaUser);
  });

  afterAll(async () => {
    await cleanUp();
    await closeDB();
  });

  beforeEach(() => {
    mockedGetRecommendation.mockReset();
    mockedGetRecommendation.mockResolvedValue(null);
    mockedGetPosters.mockReset();
    mockedGetPosters.mockImplementation(async (items) =>
      items.map((item) => ({ ...item, poster: null }))
    );
  });

  it('returns 401 when the Authorization header is not defined.', async () => {
    const response = await request(app).get(`${apiUrl}/recommendations`);

    expect(response.status).toBe(401);
  });

  it('returns 400 when the user has no media history.', async () => {
    const response = await request(app)
      .get(`${apiUrl}/recommendations`)
      .set('Authorization', `Bearer ${emptyToken}`);

    expect(response.status).toBe(400);
    expect(mockedGetRecommendation).not.toHaveBeenCalled();
  });

  describe('with media history', () => {
    beforeAll(async () => {
      const response = await request(app)
        .post(`${apiUrl}/addMedia`)
        .send({
          name: 'Reco Test Media',
          completedDate: '2024-01-01',
          score: 8,
          comment: 'history entry',
          poster: 'https://test/poster.jpg',
          mediaType: 'movie',
          language: 'english'
        })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${mediaToken}`);

      if (response.status !== 201) {
        throw new Error(`Unable to create media history (status ${response.status}).`);
      }
    });

    it('returns up to five recommendations that all have a cover.', async () => {
      const candidates = Array.from({ length: 6 }, (_, index) => ({
        name: `Reco ${index}`,
        mediaType: index === 0 ? 'book' : 'movie',
        reason: 'Fits the user history.',
        matchPercentage: 90,
        ...(index === 0 ? { isbn: '9780140328721' } : {})
      }));

      mockedGetRecommendation.mockResolvedValue(JSON.stringify(candidates));
      mockedGetPosters.mockImplementation(async (items) =>
        items.map((item, index) => ({
          ...item,
          poster: index < 5 ? `https://covers.example/${index}.jpg` : null
        }))
      );

      const response = await request(app)
        .get(`${apiUrl}/recommendations`)
        .set('Authorization', `Bearer ${mediaToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);
      expect(response.body.map((item: any) => item.name)).toEqual([
        'Reco 0',
        'Reco 1',
        'Reco 2',
        'Reco 3',
        'Reco 4'
      ]);
      expect(response.body.every((item: any) => typeof item.poster === 'string')).toBe(true);
      expect(mockedGetPosters).toHaveBeenCalledTimes(1);

      const posterInput = mockedGetPosters.mock.calls[0][0];
      expect(posterInput).toHaveLength(6);
      expect(posterInput[0]).toEqual(
        expect.objectContaining({
          name: 'Reco 0',
          mediaType: 'book',
          isbn: '9780140328721'
        })
      );
    });

    it('returns an empty list when no recommendation has a cover.', async () => {
      mockedGetRecommendation.mockResolvedValue(
        JSON.stringify([
          { name: 'Reco No Cover 1', mediaType: 'movie', reason: 'test', matchPercentage: 70 },
          { name: 'Reco No Cover 2', mediaType: 'serie', reason: 'test', matchPercentage: 60 }
        ])
      );
      mockedGetPosters.mockImplementation(async (items) =>
        items.map((item) => ({ ...item, poster: null }))
      );

      const response = await request(app)
        .get(`${apiUrl}/recommendations`)
        .set('Authorization', `Bearer ${mediaToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns 502 when the provider returns malformed data.', async () => {
      mockedGetRecommendation.mockResolvedValue('this is not json');

      const response = await request(app)
        .get(`${apiUrl}/recommendations`)
        .set('Authorization', `Bearer ${mediaToken}`);

      expect(response.status).toBe(502);
      expect(mockedGetPosters).not.toHaveBeenCalled();
    });

    it('returns 502 when the provider returns no data.', async () => {
      mockedGetRecommendation.mockResolvedValue(null);

      const response = await request(app)
        .get(`${apiUrl}/recommendations`)
        .set('Authorization', `Bearer ${mediaToken}`);

      expect(response.status).toBe(502);
    });

    it('returns 502 when the provider fails.', async () => {
      mockedGetRecommendation.mockRejectedValue(new Error('provider down'));

      const response = await request(app)
        .get(`${apiUrl}/recommendations`)
        .set('Authorization', `Bearer ${mediaToken}`);

      expect(response.status).toBe(502);
    });
  });
});

describe('parseRecommendations', () => {
  it('parses fenced JSON and normalizes book ISBNs.', () => {
    const raw = `\`\`\`json
[
  {
    "name": "Dune",
    "mediaType": "BOOK",
    "reason": "Classic science fiction.",
    "matchPercentage": "88",
    "isbn": "978-0-441-17271-9"
  }
]
\`\`\``;

    expect(parseRecommendations(raw)).toEqual([
      {
        name: 'Dune',
        mediaType: 'book',
        reason: 'Classic science fiction.',
        matchPercentage: 88,
        isbn: '9780441172719'
      }
    ]);
  });

  it('drops malformed entries and invalid media types.', () => {
    const raw = JSON.stringify([
      { name: 'Valid', mediaType: 'movie', reason: 'test', matchPercentage: 80 },
      { name: 'Invalid type', mediaType: 'theater', reason: 'test', matchPercentage: 80 },
      { foo: 'bar' }
    ]);

    expect(parseRecommendations(raw)).toHaveLength(1);
  });

  it('omits invalid ISBNs.', () => {
    const raw = JSON.stringify([
      { name: 'Book', mediaType: 'book', reason: 'test', matchPercentage: 80, isbn: '123' }
    ]);

    expect(parseRecommendations(raw)).toEqual([
      { name: 'Book', mediaType: 'book', reason: 'test', matchPercentage: 80 }
    ]);
  });

  it('returns null for missing, non-JSON, or non-array payloads.', () => {
    expect(parseRecommendations(null)).toBeNull();
    expect(parseRecommendations('not json')).toBeNull();
    expect(parseRecommendations('{"name":"single object"}')).toBeNull();
  });
});
