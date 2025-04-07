var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import { parseLogin, parseUser } from "../utils/parser.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import 'dotenv/config';
import { createUser, getUser, ownerHasToken, revokeToken, saveToken, userExists } from "../db/mongo.js";
const router = Router();
router.use('/auth', router);
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            console.error("SECRET_KEY not defined.");
            res.status(500).send();
            return;
        }
        const incomingUser = parseLogin(req.body);
        // get user from database
        const userDB = yield getUser(incomingUser.user);
        if (!userDB) {
            res.status(401).send({ message: "user or password wrong." });
            return;
        }
        if (!bcrypt.compareSync(incomingUser.password, userDB.password)) {
            res.status(401).send({ message: "user or password wrong." });
            return;
        }
        // create jwt
        const token = jwt.sign({ user: { user: incomingUser.user, id: userDB._id.toString() } }, secretKey, { expiresIn: '1d' });
        // add token into db
        if (yield ownerHasToken(userDB._id.toString())) {
            yield revokeToken(userDB._id.toString());
            yield saveToken(userDB._id.toString(), token);
        }
        else {
            saveToken(userDB._id.toString(), token);
        }
        res.send({ token: token });
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
}));
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            console.error("SECRET_KEY no está definido en las variables de entorno");
            res.status(500).send();
            return;
        }
        const incomingUser = parseUser(req.body);
        // hash password
        const hashedPassword = yield bcrypt.hash(incomingUser.password, 10);
        // verify if user already exists
        if (!(yield userExists(incomingUser))) {
            // add hashed password to user
            incomingUser.password = hashedPassword;
            // save user in database
            createUser(incomingUser)
                .then(user => {
                console.log('User created:', user);
                // create jwt
                const token = jwt.sign({ user: { user: incomingUser.user, id: user._id.toString() } }, secretKey, { expiresIn: '1d' });
                // add token into db
                saveToken(user._id.toString(), token);
                res.status(201).send({ token: token });
            })
                .catch(err => {
                console.error('Error:', err.message);
                res.status(403).send({ message: err.message });
            });
            return;
        }
        res.status(403).send({ message: 'User already exists.' });
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
}));
router.post("/logout", (_req, res) => {
    res.status(501).send();
});
export default router;
