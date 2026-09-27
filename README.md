# Bytes store

### Installation

```shell script
bun install
bun start
```

One SQLite file (`bytes.sqlite` by default). `entries` holds `namespace`, `key`, and a `BLOB` value. `sequences` holds the namespace-to-counter relation, with `seq` as an `INTEGER`.

### Environment variables

Set them as env variables or put them into `.env` file in project root dir.

- `PORT` — HTTP port (default `3001`)
- `DB_PATH` — SQLite file path (default `bytes.sqlite`)

### OpenAPI

- [pew](https://editor.swagger.io/?url=https://raw.githubusercontent.com/BlueWallet/bytes-store/master/openapi.yaml)

### License

MIT
