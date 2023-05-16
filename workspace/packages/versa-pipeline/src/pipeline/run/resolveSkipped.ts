import * as Bluebird from "bluebird";
import {
  JobStatusEnum,
  RunJobPayload,
  TaskRunResult,
  TaskRunResultCodeEnum,
} from "../../model";
import { pipelineStore } from "../store";
import { applyFilters } from "../taskRunFilter/index";

export const resolveSkipped = (payload: RunJobPayload) => {
  const filteredJob = applyFilters(payload);

  if (filteredJob.skip) {
    pipelineStore.actions.setStatus(payload.task.pipeline, {
      path: `${payload.task.stage}:${payload.task.name}`,
      status: JobStatusEnum.SKIPPED,
      task: payload.task,
    });

    return Bluebird.Promise.resolve([
      {
        status: {
          code: TaskRunResultCodeEnum.SKIPPED,
          msg: filteredJob.msg,
        },
        task: payload.task,
      } as TaskRunResult,
    ]);
  }

  return null;
};
