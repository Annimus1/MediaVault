import { app } from "../dist/app.js";
import { dbConnection } from "../dist/db/mongo.js";

export const config = { maxDuration: 60 };

let connection;

async function ensureDatabase() {
  if (!connection) {
    connection = dbConnection().catch((error) => {
      connection = undefined;
      throw error;
    });
  }
  return connection;
}

export default async function handler(req, res) {
  await ensureDatabase();
  return app(req, res);
}
