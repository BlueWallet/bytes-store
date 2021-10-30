import "reflect-metadata";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
require("dotenv").config();
const cors = require("cors");

// create express app
const app = express();
app.use(bodyParser.text());
app.use(cors());

// register express routes from defined application routes
Routes.forEach((route) => {
  (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
    const result = new (route.controller as any)()[route.action](req, res, next);
    if (result instanceof Promise) {
      result.then((result) => (result !== null && result !== undefined ? res.send(result) : undefined));
    } else if (result !== null && result !== undefined) {
      res.json(result);
    }
  });
});

app.set("trust proxy", 1);
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
});
app.use(limiter);

app.listen(process.env.PORT || 3001);

console.log("Express server has started on port ", process.env.PORT || 3001);
