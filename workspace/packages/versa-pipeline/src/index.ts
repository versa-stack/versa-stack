export * from "./errors";
export * from "./pipeline";
export * from "./schema";
export * from "./model";

import * as Bluebird from "bluebird";
interface Promise<T> extends Bluebird<T> {}
global.Promise = Promise;
