import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import * as configs from "./utils/configs.js";
import * as routes from "./routes/auth.js";


// declare global variables
const server = express();
const PORT = process.env.PORT || 8080;


// initialize middleware
server.use(cors())
  .use(configs.limiter)
  .use(cookieParser());


server.get("/login", routes.login);
server.get("/callback", routes.callback);
server.get("/refresh_token", routes.getRefreshToken);

server.listen(PORT);
console.log("🚀  Server ready on port ", PORT);