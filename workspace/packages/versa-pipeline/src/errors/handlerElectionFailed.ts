import { Pipeline } from "../model";
import { DefinedError } from "ajv";

export enum HandlerElectionFailedEnum {
  NO_VOTES = "no votes were casted",
}

class HandlerElectionFailedError extends Error {
  constructor(reason: HandlerElectionFailedEnum) {
    super(reason as string);
  }
}

export default HandlerElectionFailedError;
