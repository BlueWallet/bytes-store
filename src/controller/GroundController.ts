import "../openapi/api";
import { NextFunction, Request, Response } from "express";
require("dotenv").config();
const pck = require("../../package.json");
const Redis = require("ioredis");

const url = require("url");
const parsed = url.parse(process.env.REDISCLOUD_URL);
if (!process.env.REDISCLOUD_URL) {
  console.error("not all env variables set");
  process.exit();
}

const redis = new Redis({
  port: parsed.port,
  host: parsed.hostname,
  password: parsed.auth.split(":")[1],
});

redis.info((err, result) => {
  // console.warn(result);
});

export class GroundController {
  async namespaceGet(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespace$Namespace$Key.Get.PathParameters;
    try {
      const value = (await redis.get(params.namespace + "_" + params.key)) || "";
      response.status(200).send(value + "");
    } catch (error) {
      console.error(error.message);
      response.status(500).send(error.message);
    }
  }

  async namespacePost(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespace$Namespace$Key.Post.PathParameters;
    const body = request.body;
    try {
      await redis.set(params.namespace + "_" + params.key, body);
      const seqnum = await redis.incr(params.namespace + "_" + "seqnum");
      response.status(201).send(seqnum + "");
    } catch (error) {
      console.error(error.message);
      response.status(500).send(error.message);
    }
  }

  async namespaceSeq(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespaceseq$Namespace.Get.PathParameters;
    try {
      const seqnum = (await redis.get(params.namespace + "_" + "seqnum")) || 0;
      response.status(200).send(seqnum + "");
    } catch (error) {
      console.error(error.message);
      response.status(500).send(error.message);
    }
  }

  async namespaceSize(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespacesize$Namespace.Get.PathParameters;
    const keys: string[] = await redis.keys(params.namespace + "_" + "*");
    let totalSize = 0;
    for (const key of keys) {
      const value = await redis.get(key);
      if (value) totalSize += value.length;
    }
    response.status(200).send(totalSize + "");
  }

  async namespaceKeys(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespacekeys$Namespace.Get.PathParameters;
    try {
      const keys: string[] = await redis.keys(params.namespace + "_" + "*");
      const result = [];
      for (const key of keys) {
        const keyWithoutNs = key.split("_").slice(1).join("_");
        if (keyWithoutNs === "seqnum") continue;
        result.push(keyWithoutNs);
      }
      response.status(200).send(result.join(","));
    } catch (error) {
      console.error(error.message);
      response.status(500).send(error.message);
    }
  }

  async ping() {
    return {
      name: pck.name,
      description: pck.description,
      version: pck.version,
      uptime: Math.floor(process.uptime()),
    };
  }
}
