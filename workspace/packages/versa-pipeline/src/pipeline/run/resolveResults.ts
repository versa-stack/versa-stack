import * as Bluebird from "bluebird";
import { filterSensitiveData } from "../../filterSensitiveData";
import {
  RunJobPayload,
  TaskRunHandlerResult,
  TaskRunResultCodeEnum,
} from "../../model";
import { applyFilters } from "../taskRunFilter/index";
import { runTask } from "./runTask";
import { waitForResults } from "./waitForResults";
import { pipelineStore } from "../store";
import { JobStatusEnum } from "../../model";

export const resolveResults = (
  payload: RunJobPayload
): TaskRunHandlerResult => {
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
      },
    ]);
  }

  pipelineStore.actions.setStatus(payload.task.pipeline, {
    path: `${payload.task.stage}:${payload.task.name}`,
    status: JobStatusEnum.PENDING,
    task: payload.task,
  });

  return waitForResults(payload.task.pipeline, payload.task.depends || []).then(
    () => {
      pipelineStore.actions.setStatus(payload.task.pipeline, {
        path: `${payload.task.stage}:${payload.task.name}`,
        status: JobStatusEnum.RUNNING,
        task: payload.task,
      });

      return runTask({
        ...payload,
        output: payload.output(filterSensitiveData(payload)),
      }).then((results) => {
        pipelineStore.actions.setStatus(payload.task.pipeline, {
          path: `${payload.task.stage}:${payload.task.name}`,
          status: JobStatusEnum.DONE,
          task: payload.task,
        });

        return results;
      });
    }
  );
};
