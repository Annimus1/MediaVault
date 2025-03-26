import { Router } from "express";
import { User } from "../utils/types.js";
import { parseUser } from "../utils/utils.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import 'dotenv/config'
import { createUser, saveToken, userExists } from "../db/mongo.js";

const router = Router();

router.use('/auth', router);

router.post("/login", async (req, res) => {

  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("SECRET_KEY no está definido en las variables de entorno");
      res.status(500).send();
      return
    }

    const incomingUser: User = parseUser(req.body);

    /**
     * check if user match in database
     * redirect to / (get all media)
     */

    // hash password
    // const hashedPassword = await bcrypt.hash(incomingUser.password, 10);

    // create jwt
    const token = jwt.sign({ user: incomingUser.user }, secretKey!, { expiresIn: '1d' })

    res.send({ token: token });
  } catch (error: any) {
    res.status(400).send({ message: error.message })
  }
});

router.post("/register", async (req, res) => {
  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("SECRET_KEY no está definido en las variables de entorno");
      res.status(500).send();
      return
    }

    const incomingUser: User = parseUser(req.body);

    // hash password
    const hashedPassword = await bcrypt.hash(incomingUser.password, 10);

    // create jwt
    const token = jwt.sign({ user: incomingUser.user }, secretKey!, { expiresIn: '1d' })

    // verify is user already exists
    if (! await userExists(incomingUser)) {
      // add hashed password to user
      incomingUser.password = hashedPassword;

      // save user in database
      createUser(incomingUser)
        .then(user => {
          let expirationInHours = 24;
          console.log('User created:', user);
          // add token into db
          saveToken(user._id.toString(), token,  expirationInHours);
          res.status(201).send({ token: token })
        })
        .catch(err => {
          console.error('Error:', err.message)
          res.status(403).send({ message: err.message })
        });
      return
    }


    res.status(403).send({ message: 'User already exists.' });
  } catch (error: any) {
    res.status(400).send({ message: error.message })
  }
});

router.post("/logout", (_req, res) => {
  res.status(501).send();
});

export default router;