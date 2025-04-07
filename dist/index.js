import { app } from "./app.js";
import cookieParser from 'cookie-parser';
import { dbConnection } from './db/mongo.js';
dbConnection();
const PORT = process.env.PORT || 5000;
app.disable('x-powered-by');
app.use(cookieParser());
app.listen(PORT, () => {
    console.log("Server running on port:", PORT);
});
