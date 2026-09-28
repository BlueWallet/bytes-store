import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
require("dotenv").config();
const cors = require("cors");

// create express app
const app = express();
const proxyHops = Number(process.env.TRUST_PROXY);
if (proxyHops > 0) app.set("trust proxy", proxyHops);
app.use(bodyParser.text());
app.use(cors());
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
});
app.use(limiter);

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

app.listen(process.env.PORT || 3001);

console.log("Express server has started on port ", process.env.PORT || 3001);
