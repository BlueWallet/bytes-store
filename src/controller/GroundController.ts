import "../openapi/api";
import { NextFunction, Request, Response } from "express";
import { Database } from "bun:sqlite";
require("dotenv").config();
const pck = require("../../package.json");

const db = new Database(process.env.DB_PATH || "bytes.sqlite", { create: true });

const entryColumns = db.query<{ name: string }, []>("PRAGMA table_info(entries)").all();
if (entryColumns.some((column) => column.name === "seq")) {
  db.exec(`
    CREATE TABLE entries_next (
      namespace TEXT NOT NULL,
      key TEXT NOT NULL,
      value BLOB NOT NULL,
      PRIMARY KEY (namespace, key)
    );
    INSERT INTO entries_next (namespace, key, value)
      SELECT namespace, key, value FROM entries;
    CREATE TABLE IF NOT EXISTS sequences (
      namespace TEXT PRIMARY KEY,
      seq INTEGER NOT NULL
    );
    INSERT INTO sequences (namespace, seq)
      SELECT namespace, MAX(seq) FROM entries GROUP BY namespace
      ON CONFLICT(namespace) DO UPDATE SET seq = excluded.seq;
    DROP TABLE entries;
    ALTER TABLE entries_next RENAME TO entries;
  `);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    value BLOB NOT NULL,
    PRIMARY KEY (namespace, key)
  );
  CREATE TABLE IF NOT EXISTS sequences (
    namespace TEXT PRIMARY KEY,
    seq INTEGER NOT NULL
  );
`);

const getValue = db.query<{ value: Uint8Array }, [string, string]>("SELECT value FROM entries WHERE namespace = ? AND key = ?");
const readSeq = db.query<{ seq: number }, [string]>("SELECT seq FROM sequences WHERE namespace = ?");
const bumpSeq = db.query<{ seq: number }, [string]>(
  `INSERT INTO sequences (namespace, seq) VALUES (?, 1)
   ON CONFLICT(namespace) DO UPDATE SET seq = seq + 1
   RETURNING seq`
);
const upsertValue = db.query(
  `INSERT INTO entries (namespace, key, value) VALUES (?, ?, ?)
   ON CONFLICT(namespace, key) DO UPDATE SET value = excluded.value`
);
const sumSize = db.query<{ total: number }, [string]>("SELECT COALESCE(SUM(length(value)), 0) AS total FROM entries WHERE namespace = ?");
const listKeys = db.query<{ key: string }, [string]>("SELECT key FROM entries WHERE namespace = ?");

function asString(value: Uint8Array | null): string {
  if (!value) return "";
  return Buffer.from(value).toString("utf8");
}

export class GroundController {
  async namespaceGet(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespace$Namespace$Key.Get.PathParameters;
    try {
      if (params.key === "seqnum") {
        const row = readSeq.get(params.namespace);
        response.status(200).send(String(row?.seq ?? 0));
        return;
      }
      const row = getValue.get(params.namespace, params.key);
      response.status(200).send(asString(row?.value ?? null));
    } catch (error) {
      console.error(error.message);
      response.status(500).send(error.message);
    }
  }

  async namespacePost(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespace$Namespace$Key.Post.PathParameters;
    const body = request.body;
    if (params.key === "seqnum") {
      response.status(400).send("seqnum is reserved");
      return;
    }
    try {
      const bytes = Buffer.from(typeof body === "string" ? body : String(body ?? ""), "utf8");
      const write = db.transaction(() => {
        upsertValue.run(params.namespace, params.key, bytes);
        return bumpSeq.get(params.namespace).seq;
      });
      response.status(201).send(String(write()));
    } catch (error) {
      console.error(error.message);
      response.status(500).send(error.message);
    }
  }

  async namespaceSeq(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespaceseq$Namespace.Get.PathParameters;
    try {
      const row = readSeq.get(params.namespace);
      response.status(200).send(String(row?.seq ?? 0));
    } catch (error) {
      console.error(error.message);
      response.status(500).send(error.message);
    }
  }

  async namespaceSize(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespacesize$Namespace.Get.PathParameters;
    const stored = sumSize.get(params.namespace)?.total ?? 0;
    const seq = readSeq.get(params.namespace)?.seq ?? 0;
    const seqBytes = seq === 0 ? 0 : Buffer.byteLength(String(seq));
    response.status(200).send(String(stored + seqBytes));
  }

  async namespaceKeys(request: Request, response: Response, next: NextFunction) {
    const params = (request.params as unknown) as Paths.Namespacekeys$Namespace.Get.PathParameters;
    try {
      const keys = listKeys.all(params.namespace).map((row) => row.key);
      response.status(200).send(keys.join(","));
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
