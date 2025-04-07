var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import authMiddleware from '../utils/AuthMiddleware.js';
import { getUserInfo } from '../utils/tokens.js';
import { getMedia, saveMedia } from '../db/mongo.js';
import { parseMedia } from '../utils/parser.js';
import { filteredMedia } from '../utils/filterMedia.js';
const router = Router();
router.use(authMiddleware);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // check if secret key is defined.
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            console.error("Secret key is not dfined.");
            res.status(500).send();
        }
        // get authorization header.
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        // get payload
        const payload = getUserInfo(token, secretKey); // shouldn't fail because 
        // middleware already checked it.
        //get media by user
        const result = yield getMedia(payload.user.id);
        // check if need to apply filters
        const queryParams = req.query;
        console.log(queryParams);
        const filteredResults = filteredMedia(result, queryParams);
        filteredResults ? res.send(filteredResults) : res.send(result);
    }
    catch (error) {
        if (error instanceof TypeError) {
            res.status(400).send({ message: error.message });
            return;
        }
        res.status(500).send();
        return;
    }
}));
router.post('/addMedia', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // check if secret key is defined.
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            console.error("Secret key is not dfined.");
            res.status(500).send();
        }
        // get authorization header.
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        // get payload
        const payload = getUserInfo(token, secretKey); // shouldn't fail because 
        // middleware already checked it.
        // parse media
        const incomingMedia = parseMedia(req.body, payload.user.id);
        // save media
        yield saveMedia(incomingMedia);
        res.status(201).send(incomingMedia);
    }
    catch (error) {
        if (error instanceof TypeError) {
            res.status(400).send({ message: error.message });
        }
        else {
            res.status(500).send();
        }
    }
}));
router.get('/:id', (_req, res) => {
    res.status(501).send();
});
export default router;
