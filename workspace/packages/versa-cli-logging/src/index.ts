import * as Bluebird from "bluebird";
export * from "./model";
export * from "./streams";

interface Promise<T> extends Bluebird<T> {}
global.Promise = Promise;
