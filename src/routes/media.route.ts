import { Router } from 'express';
import authMiddleware from '../utils/AuthMiddleware.js';
import { getUserInfo } from '../utils/tokens.js';
import { deleteMediaById, getMedia, getMediaById, saveMedia } from '../db/mongo.js';
import { parseMedia } from '../utils/parser.js';
import { filteredMedia } from '../utils/filterMedia.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res)=>{
  try{
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
    
    //get media by user
    const result = await getMedia(payload!.user.id)
    
    // check if need to apply filters
    const queryParams = req.query;
    console.log(queryParams);
    
    const filteredResults = filteredMedia(result, queryParams);
    
    filteredResults ? res.send(filteredResults) : res.send(result);
  }
  catch(error:any){
    if(error instanceof TypeError){
      res.status(400).send({message: error.message});
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

    // parse media
    const incomingMedia = parseMedia(req.body, payload!.user.id);

    // save media
    await saveMedia(incomingMedia);

    res.status(201).send(incomingMedia);
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
  try{
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
  }catch (error: any){
    
    if(error.message.includes('Cast to ObjectId failed')){
      res.sendStatus(404);
    }

    if(error instanceof TypeError){
      res.status(400).send({message: error.message});
      return 
    }

    res.status(500).send();
    return;
  }
});

router.delete('/:id', async (req, res) => {
  try{
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
  }catch (error: any){
    
    if(error.message.includes('Cast to ObjectId failed')){
      res.sendStatus(404);
    }

    if(error instanceof TypeError){
      res.status(400).send({message: error.message});
      return 
    }

    res.status(500).send();
    return;
  }
});


export default router;