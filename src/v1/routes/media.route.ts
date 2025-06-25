import { Router } from 'express';
import authMiddleware from '../../utils/AuthMiddleware.js';
import { getUserInfo } from '../../utils/tokens.js';
import { deleteMediaById, getMedia, getMediaById, saveMedia } from '../../db/mongo.js';
import { LimitElements, parseMedia } from '../../utils/parser.js';
import { filteredMedia } from '../../utils/filterMedia.js';

const router = Router();

router.use(authMiddleware);

/**
 * @route GET /v1/media
 * @group Media - Operations on the user's media files
 * @summary Gets the list of media files for the authenticated user, with filters and pagination.
 * @param {string} [page.query] - Page number (default 1)
 * @returns {object} 200 - Object with pagination info and the data for the requested page
 * @returns {Error}  400 - Parameter error
 * @returns {Error}  500 - Internal server error
 */
router.get('/', async (req, res) => {
  try {
    // check if secret key is defined.
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("Secret key is not dfined.");
      res.status(500).send();
    }

    // get authorization header.
    const token = req.headers.authorization?.split(" ")[1];

    // get payload
    const payload = getUserInfo(token!, secretKey!); // shouldn't fail because 
    // middleware already checked it.

    const pageParam = req.query.page;
    // get media by user
    const { results } = await getMedia(payload!.user.id);

    // check if need to apply filters
    const queryParams = req.query;

    const filteredResults = filteredMedia(results.data, queryParams);

    filteredResults ? 
    res.send({ page: {
      totalPages: Math.ceil(filteredResults.length / 10), // get total page based on 10 elements each
      totalItems: filteredResults.length, // total amount of elements got
      currentPage: pageParam ? Number(pageParam) : 1, // current page, 1 by default
      nextPage: Number(pageParam)+1 < Math.ceil(filteredResults.length / 10) ? Number(pageParam)+1 : Number(pageParam), // next page
      prevPage: pageParam ? (Number(pageParam) > 1 ? Number(pageParam) - 1 : 1) : 1 // previous page, 1 by default
    }, data: LimitElements(filteredResults, Number(pageParam)) }) 
    :
    res.send({ page: results.page, data: results.data ? LimitElements(results.data, Number(pageParam)) : null}); // Response with no filters

  }
  catch (error: any) {
    if (error instanceof TypeError) {
      res.status(400).send({ message: error.message });
      return
    }

    res.status(500).send();
    return;
  }
});

/**
 * @route POST /v1/media/addMedia
 * @group Media - Operations on the user's media files
 * @summary Adds one or more media files to the authenticated user.
 * @param {boolean} [many.query] - If true, expects an array of files in the body
 * @returns {object} 201 - Added media object(s)
 * @returns {Error}  400 - Parameter error
 * @returns {Error}  500 - Internal server error
 */
router.post('/addMedia', async (req, res) => {
  try {
    // check if secret key is defined.
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("Secret key is not dfined.");
      res.status(500).send();
    }

    // get authorization header.
    const token = req.headers.authorization?.split(" ")[1];

    // get payload
    const payload = getUserInfo(token!, secretKey!); // shouldn't fail because 
    // middleware already checked it.

    const many = req.query.many;

    if (many) {
      const incomingMedia = req.body.map((media: any) => parseMedia(media, payload!.user.id));

      // save each media
      for (const media of incomingMedia) {
        await saveMedia(media);
      }

      // send response
      res.status(201).send(incomingMedia);
    }
    else {
      // parse media
      const incomingMedia = parseMedia(req.body, payload!.user.id);

      // save media
      await saveMedia(incomingMedia);

      res.status(201).send(incomingMedia);
    }
  }
  catch (error: any) {
    if (error instanceof TypeError) {
      res.status(400).send({ message: error.message });
    }
    else {
      res.status(500).send();
    }
  }
});

/**
 * @route GET /v1/media/:id
 * @group Media - Operations on the user's media files
 * @summary Gets a media file by its ID.
 * @param {string} id.path.required - Media file ID
 * @returns {object} 200 - Found media object
 * @returns {Error}  404 - Not found
 * @returns {Error}  400 - Parameter error
 * @returns {Error}  500 - Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    // check if secret key is defined.
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("Secret key is not dfined.");
      throw new Error("Secret key is not dfined.");
    }

    // get id from path
    const id = req.path.split('/')[1]

    // get media by id
    const result = await getMediaById(id);

    result ? res.json(result) : res.status(404).send();
  } catch (error: any) {

    if (error.message.includes('Cast to ObjectId failed')) {
      res.sendStatus(404);
    }

    if (error instanceof TypeError) {
      res.status(400).send({ message: error.message });
      return
    }

    res.status(500).send();
    return;
  }
});

/**
 * @route DELETE /v1/media/:id
 * @group Media - Operations on the user's media files
 * @summary Deletes a media file by its ID.
 * @param {string} id.path.required - Media file ID
 * @returns {object} 200 - Deleted media object
 * @returns {Error}  404 - Not found
 * @returns {Error}  400 - Parameter error
 * @returns {Error}  500 - Internal server error
 */
router.delete('/:id', async (req, res) => {
  try {
    // check if secret key is defined.
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("Secret key is not dfined.");
      throw new Error("Secret key is not dfined.");
    }

    // get id from path
    const id = req.path.split('/')[1]

    // get media by id
    const result = await deleteMediaById(id);

    result ? res.json(result) : res.status(404).send();
  } catch (error: any) {

    if (error.message.includes('Cast to ObjectId failed')) {
      res.sendStatus(404);
    }

    if (error instanceof TypeError) {
      res.status(400).send({ message: error.message });
      return
    }

    res.status(500).send();
    return;
  }
});

export default router;