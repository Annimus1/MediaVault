/**
 * @file Media routes for CRUD operations on user's media files.
 * @module routes/media
 */

import { Router } from 'express';
import authMiddleware from '../../utils/AuthMiddleware.js';
import { getUserInfo } from '../../utils/tokens.js';
import { deleteMediaById, getMedia, getMediaById, saveMedia, updateMedia } from '../../db/mongo.js';
import { LimitElements, parseMedia } from '../../utils/parser.js';
import { filteredMedia } from '../../utils/filterMedia.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /v1/media
 * Gets the list of media files for the authenticated user, with filters and pagination.
 *
 * @route GET /v1/
 * @group Media - Operations on the user's media files
 * @param {string} [page.query] - Page number (default 1)
 * @returns {object} 200 - Object with pagination info and the data for the requested page
 * @returns {Error}  400 - Parameter error
 * @returns {Error}  500 - Internal server error
 */
router.get('/', async (req, res) => {
  try {
    // Check if secret key is defined.
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("Secret key is not defined.");
      res.status(500).send();
    }

    // Get authorization header.
    const token = req.headers.authorization?.split(" ")[1];

    // Get payload
    const payload = getUserInfo(token!, secretKey!); // shouldn't fail because middleware already checked it.

    const pageParam = req.query.page;
    // Get media by user
    const { results } = await getMedia(payload!.user.id);

    // Check if need to apply filters
    const queryParams = req.query;

    const filteredResults = filteredMedia(results.data, queryParams);

    filteredResults ? 
    res.send({ page: {
      totalPages: Math.ceil(filteredResults.length / 10),
      totalItems: filteredResults.length,
      currentPage: pageParam ? Number(pageParam) : 1,
      nextPage: Number(pageParam)+1 < Math.ceil(filteredResults.length / 10) ? Number(pageParam)+1 : Number(pageParam),
      prevPage: pageParam ? (Number(pageParam) > 1 ? Number(pageParam) - 1 : 1) : 1
    }, data: LimitElements(filteredResults, Number(pageParam)) }) 
    :
    res.send({ page: results.page, data: results.data ? LimitElements(results.data, Number(pageParam)) : null});
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
 * POST /v1/media/addMedia
 * Adds one or more media files to the authenticated user.
 *
 * @route POST /v1/addMedia
 * @group Media - Operations on the user's media files
 * @param {boolean} [many.query] - If true, expects an array of files in the body
 * @returns {object} 201 - Added media object(s)
 * @returns {Error}  400 - Parameter error
 * @returns {Error}  500 - Internal server error
 */
router.post('/addMedia', async (req, res) => {
  try {
    // Check if secret key is defined.
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("Secret key is not defined.");
      res.status(500).send();
    }

    // Get authorization header.
    const token = req.headers.authorization?.split(" ")[1];

    // Get payload
    const payload = getUserInfo(token!, secretKey!);

    const many = req.query.many;

    if (many) {
      const incomingMedia = req.body.map((media: any) => parseMedia(media, payload!.user.id));

      // Save each media
      for (const media of incomingMedia) {
        await saveMedia(media);
      }

      // Send response
      res.status(201).send(incomingMedia);
    }
    else {
      // Parse media
      const incomingMedia = parseMedia(req.body, payload!.user.id);

      // Save media
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
 * GET /v1/media/:id
 * Gets a media file by its ID.
 *
 * @route GET /v1/:id
 * @group Media - Operations on the user's media files
 * @param {string} id.path.required - Media file ID
 * @returns {object} 200 - Found media object
 * @returns {Error}  404 - Not found
 * @returns {Error}  400 - Parameter error
 * @returns {Error}  500 - Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    // Check if secret key is defined.
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("Secret key is not defined.");
      throw new Error("Secret key is not defined.");
    }

    // Get id from path
    const id = req.path.split('/')[1]

    // Get media by id
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
 * DELETE /v1/media/:id
 * Deletes a media file by its ID.
 *
 * @route DELETE /v1/:id
 * @group Media - Operations on the user's media files
 * @param {string} id.path.required - Media file ID
 * @returns {object} 200 - Deleted media object
 * @returns {Error}  404 - Not found
 * @returns {Error}  400 - Parameter error
 * @returns {Error}  500 - Internal server error
 */
router.delete('/:id', async (req, res) => {
  try {
    // Check if secret key is defined.
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("Secret key is not defined.");
      throw new Error("Secret key is not defined.");
    }

    // Get id from path
    const id = req.path.split('/')[1]

    // Delete media by id
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

/**
 * PUT /v1/media/:id
 * Updates a media file by its ID.
 *
 * @route PUT /v1/:id
 * @group Media - Operations on the user's media files
 * @param {string} id.path.required - Media file ID
 * @returns {object} 200 - Updated media object
 * @returns {Error}  400 - Parameter error
 * @returns {Error}  500 - Internal server error
 */
router.put('/:id', async (req, res) => {
  console.log(req.body)
  try {
    // Check if secret key is defined.
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("Secret key is not defined.");
      res.status(500).send();
    }

    // Get id from path
    const id = req.path.split('/')[1]

    // Get authorization header.
    const token = req.headers.authorization?.split(" ")[1];

    // Get payload
    const payload = getUserInfo(token!, secretKey!); 

    // Parse media
    const incomingMedia = parseMedia(req.body, payload!.user.id);

    // Update media
    await updateMedia(incomingMedia, id);

    res.status(200).send(incomingMedia);
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

export default router;