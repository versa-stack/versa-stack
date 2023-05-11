import { TaskRunResult } from "../model";

class JobFailedError extends Error {
  public result: TaskRunResult;
  constructor(msg: string, result: TaskRunResult) {
    super(msg);
    this.result = result;
  }
}

export default JobFailedError;
