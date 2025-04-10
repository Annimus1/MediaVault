import { app } from "./app.js";
import { dbConnection } from './db/mongo.js'

dbConnection();
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');

app.listen(PORT, () => {
    console.log("Server running on port:", PORT)
})