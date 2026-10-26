import axios from 'axios';
import { getPosters } from '../src/utils/Posters.js';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getPosters', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('resolves movie posters from Rotten Tomatoes', async () => {
    mockedAxios.get.mockResolvedValue({
      data: '<meta property="og:image" content="https://img.example/movie.jpg">'
    } as any);

    const [result] = await getPosters([
      { name: 'The Matrix', mediaType: 'movie', reason: 'test', matchPercentage: 90 }
    ]);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://www.rottentomatoes.com/m/the_matrix',
      expect.objectContaining({ timeout: expect.any(Number) })
    );
    expect(result.poster).toBe('https://img.example/movie.jpg');
  });

  it('resolves serie posters from the TV section', async () => {
    mockedAxios.get.mockResolvedValue({
      data: '<meta property="og:image" content="https://img.example/tv.jpg">'
    } as any);

    const [serie] = await getPosters([
      { name: 'The Wire', mediaType: 'serie', reason: 'test', matchPercentage: 90 }
    ]);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://www.rottentomatoes.com/tv/the_wire',
      expect.objectContaining({ timeout: expect.any(Number) })
    );
    expect(serie.poster).toBe('https://img.example/tv.jpg');
  });

  it('resolves anime posters from AniList', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        data: {
          Page: {
            media: [
              {
                coverImage: {
                  extraLarge: 'https://img.example/anime.jpg',
                  large: 'https://img.example/anime-large.jpg'
                }
              }
            ]
          }
        }
      }
    } as any);

    const [anime] = await getPosters([
      { name: 'Cowboy Bebop', mediaType: 'anime', reason: 'test', matchPercentage: 90 }
    ]);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://graphql.anilist.co',
      expect.objectContaining({ variables: { search: 'Cowboy Bebop' } }),
      expect.objectContaining({ timeout: expect.any(Number) })
    );
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(anime.poster).toBe('https://img.example/anime.jpg');
  });

  it('falls back to Rotten Tomatoes when AniList has no anime cover', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { data: { Page: { media: [] } } }
    } as any);
    mockedAxios.get.mockResolvedValue({
      data: '<meta property="og:image" content="https://img.example/tv.jpg">'
    } as any);

    const [anime] = await getPosters([
      { name: 'Cowboy Bebop', mediaType: 'anime', reason: 'test', matchPercentage: 90 }
    ]);

    expect(mockedAxios.post).toHaveBeenCalled();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://www.rottentomatoes.com/tv/cowboy_bebop',
      expect.objectContaining({ timeout: expect.any(Number) })
    );
    expect(anime.poster).toBe('https://img.example/tv.jpg');
  });

  it('returns a verified Open Library cover for books with an ISBN', async () => {
    mockedAxios.head.mockResolvedValue({
      status: 200,
      headers: { 'content-type': 'image/jpeg' }
    } as any);

    const [result] = await getPosters([
      {
        name: 'Dune',
        mediaType: 'book',
        reason: 'test',
        matchPercentage: 80,
        isbn: '9780140328721'
      }
    ]);

    expect(mockedAxios.head).toHaveBeenCalledWith(
      'https://covers.openlibrary.org/b/isbn/9780140328721-L.jpg?default=false',
      expect.objectContaining({ timeout: expect.any(Number) })
    );
    expect(result.poster).toBe('https://covers.openlibrary.org/b/isbn/9780140328721-L.jpg?default=false');
  });

  it('discards books without an ISBN', async () => {
    const [result] = await getPosters([
      { name: 'Dune', mediaType: 'book', reason: 'test', matchPercentage: 80 }
    ]);

    expect(mockedAxios.head).not.toHaveBeenCalled();
    expect(result.poster).toBeNull();
  });

  it('discards books when Open Library has no cover', async () => {
    mockedAxios.head.mockRejectedValue(new Error('404'));

    const [result] = await getPosters([
      {
        name: 'Dune',
        mediaType: 'book',
        reason: 'test',
        matchPercentage: 80,
        isbn: '9780140328721'
      }
    ]);

    expect(result.poster).toBeNull();
  });

  it('discards media when the poster cannot be scraped', async () => {
    mockedAxios.get.mockRejectedValue(new Error('404'));

    const [result] = await getPosters([
      { name: 'Unknown Movie', mediaType: 'movie', reason: 'test', matchPercentage: 80 }
    ]);

    expect(result.poster).toBeNull();
  });

  it('discards unsupported media types', async () => {
    const [result] = await getPosters([
      { name: 'Some Game', mediaType: 'videogame', reason: 'test', matchPercentage: 80 }
    ]);

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(mockedAxios.head).not.toHaveBeenCalled();
    expect(result.poster).toBeNull();
  });
});
