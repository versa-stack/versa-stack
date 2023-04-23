import { Pipeline } from "../model";
import { DefinedError } from "ajv";

class PipelineInvalidError extends Error {
  pipeline: Pipeline;
  validationErrors: DefinedError[];
  constructor(pipeline: Pipeline, validationErrors: DefinedError[]) {
    const message = `Pipeline is invalid: 
    ${validationErrors.map((e) => e.message).join("; ")}
    `;
    super(message);
    this.pipeline = pipeline;
    this.validationErrors = validationErrors;
  }
}

export default PipelineInvalidError;
