import { Pipeline } from "../model";
import schema from "./schema.json";

import Ajv, { DefinedError } from "ajv";
import { PipelineInvalidError } from "../errors";

const validator = new Ajv().compile(schema);

export default (document: Pipeline) => {
  if (!validator(document)) {
    throw new PipelineInvalidError(
      document,
      validator.errors as DefinedError[]
    );
  }
  return true;
};
