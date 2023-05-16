import * as Bluebird from "bluebird";
import JobFailedError from "../../errors/jobFailed";
import {
  JobStatusEnum,
  Task,
  TaskRunHandlerResult,
  TaskRunResult,
  TaskRunResultCodeEnum,
} from "../../model";
import { pipelineStore } from "../store";

export const waitForResults = async (task: Task, paths: string[]) => {
  if (!paths.length) {
    return [];
  }

  const deps: TaskRunHandlerResult[] = [];
  for (const path of paths) {
    let r = pipelineStore.getters.results()(task.pipeline, path);
    while (!r) {
      await new Bluebird.Promise((resolve) => setTimeout(resolve, 5));
      r = pipelineStore.getters.results()(task.pipeline, path);
    }

    deps.push(pipelineStore.getters.results()(task.pipeline, path));
  }

  return await Bluebird.Promise.all(deps.flat())
    .then((r) => r.flat())
    .then((results) => {
      if (!task.stage) return results;
      const result = results.find((r) => !!r.error);
      if (result) {
        throw new JobFailedError(
          `Job "${result.task.stage}:${result.task.name}" failed in pipeline "${result.task.pipeline}" (${result.status.msg} code: ${result.status.code}) `,
          result
        );
      }

      return results;
    })
    .catch(() => {
      pipelineStore.actions.setStatus(task.pipeline, {
        path: `${task.stage}`,
        status: JobStatusEnum.CANCELLED,
        task,
      });

      return [
        {
          task,
          status: {
            code: TaskRunResultCodeEnum.CANCELLED,
            msg: "Cancelled due to errors in dependencies.",
          },
          error: JobStatusEnum.CANCELLED,
        },
      ] as TaskRunResult[];
    });
};
