import { Router } from 'express';
import authMiddleware from '../../utils/AuthMiddleware.js';
import { getUserInfo } from '../../utils/tokens.js';
import { deleteMediaById, getMedia, getMediaById, saveMedia } from '../../db/mongo.js';
import { parseMedia } from '../../utils/parser.js';
import { filteredMedia } from '../../utils/filterMedia.js';

const router = Router();

router.use(authMiddleware);

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
    //get media by user
    const { results } = await getMedia(payload!.user.id, pageParam ? Number(pageParam) : 0);

    // check if need to apply filters
    const queryParams = req.query;

    const filteredResults = filteredMedia(results.data, queryParams);

    filteredResults ? 
    res.send({ page: results.page, data: filteredResults }) :
    res.send({ page: results.page, data: results.data });
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

      //save each media
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


    //get media by id
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

    //get media by id
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