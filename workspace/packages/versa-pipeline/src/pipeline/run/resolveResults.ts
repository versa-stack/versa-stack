import { filterSensitiveData } from "../../filterSensitiveData";
import {
  RunJobPayload,
  TaskRunHandlerResult,
  TaskRunResultCodeEnum,
} from "../../model";
import { applyFilters } from "../taskRunFilter/index";
import { runTask } from "./runTask";
import { waitForResults } from "./waitForResults";

export const resolveResults = (
  payload: RunJobPayload
): TaskRunHandlerResult => {
  const filteredJob = applyFilters(payload);
  return filteredJob.skip
    ? Promise.resolve([
        {
          status: {
            code: TaskRunResultCodeEnum.SKIPPED,
            msg: filteredJob.msg,
          },
          task: payload.task,
        },
      ])
    : waitForResults(payload.task.pipeline, payload.task.depends || []).then(
        () =>
          runTask({
            ...payload,
            output: payload.output(filterSensitiveData(payload)),
          })
      );
};
