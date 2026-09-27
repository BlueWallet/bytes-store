declare module "bun:sqlite" {
  interface Statement<T, P extends unknown[]> {
    get(...args: P): T | null;
    all(...args: P): T[];
    run(...args: P): void;
  }

  export class Database {
    constructor(filename: string, options?: { readonly?: boolean; create?: boolean });
    exec(sql: string): void;
    query<T = unknown, P extends unknown[] = unknown[]>(sql: string): Statement<T, P>;
    transaction<F extends (...args: never[]) => unknown>(fn: F): F;
  }
}
