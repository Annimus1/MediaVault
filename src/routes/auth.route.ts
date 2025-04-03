import { Router } from "express";
import { User, UserLogin } from "../utils/types.js";
import { parseLogin, parseUser } from "../utils/utils.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import 'dotenv/config'
import { createUser, getUser, ownerHasToken, revokeToken, saveToken, userExists } from "../db/mongo.js";

const router = Router();

router.use('/auth', router);

router.post("/login", async (req, res) => {

  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("SECRET_KEY not defined.");
      res.status(500).send();
      return
    }

    const incomingUser: UserLogin = parseLogin(req.body);

    // get user from database
    const userDB = await getUser(incomingUser.user);
    if (!userDB) {
      res.status(401).send({ message: "user or password wrong." });
      return
    }

    if (!bcrypt.compareSync(incomingUser.password, userDB.password)) {
      res.status(401).send({ message: "user or password wrong." })
      return
    }

    // create jwt
    const token = jwt.sign({ user: incomingUser.user }, secretKey!, { expiresIn: '1d' })

    // add token into db
    if (await ownerHasToken(userDB._id.toString())) {
      await revokeToken(userDB._id.toString());
      await saveToken(userDB._id.toString(), token)
    }else{
      saveToken(userDB._id.toString(), token);
    }

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

    // verify if user already exists
    if (! await userExists(incomingUser)) {
      // add hashed password to user
      incomingUser.password = hashedPassword;

      // save user in database
      createUser(incomingUser)
        .then(user => {
          console.log('User created:', user);
          // add token into db
          saveToken(user._id.toString(), token);
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
  res.status(501).send()
});

export default router;
