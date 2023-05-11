import * as Bluebird from "bluebird";
import { filterSensitiveData } from "../../filterSensitiveData";
import {
  JobStatus,
  JobStatusEnum,
  RunJobPayload,
  TaskRunHandlerResult,
  TaskRunResultCodeEnum,
} from "../../model";
import { pipelineStore } from "../store";
import { applyFilters } from "../taskRunFilter/index";
import { runTask } from "./runTask";
import { waitForResults } from "./waitForResults";

export const resolveResults = async (
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

  return waitForResults(payload.task, payload.task.depends || []).then(
    async (results) => {
      if (
        results.find((i) => i.status.code === TaskRunResultCodeEnum.CANCELLED)
      ) {
        pipelineStore.actions.setStatus(payload.task.pipeline, {
          path: `${payload.task.stage}:${payload.task.name}`,
          status: JobStatusEnum.CANCELLED,
          task: payload.task,
          results,
        } as JobStatus);
        return results;
      }

      pipelineStore.actions.setStatus(payload.task.pipeline, {
        path: `${payload.task.stage}:${payload.task.name}`,
        status: JobStatusEnum.RUNNING,
        task: payload.task,
      });

      const taskResults = await runTask({
        ...payload,
        output: payload.output(filterSensitiveData(payload)),
      });

      const status = {
        path: `${payload.task.stage}:${payload.task.name}`,
        status: JobStatusEnum.DONE,
        task: payload.task,
        results,
      } as JobStatus;

      taskResults.forEach((r) => {
        if (r.error) {
          status.status = JobStatusEnum.ERROR;
        }
      });

      pipelineStore.actions.setStatus(payload.task.pipeline, status);

      return taskResults;
    }
  );
};
