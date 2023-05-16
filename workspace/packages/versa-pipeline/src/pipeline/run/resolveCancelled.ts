import {
  JobStatusEnum,
  RunJobPayload,
  TaskRunResult,
  TaskRunResultCodeEnum,
} from "../../model";
import { pipelineStore } from "../store";

export const resolveCancelled = (
  payload: RunJobPayload,
  dependsResults: TaskRunResult[]
) => {
  if (
    !dependsResults.find(
      (result) => result.status.code === TaskRunResultCodeEnum.CANCELLED
    )
  ) {
    return null;
  }

  pipelineStore.actions.setStatus(payload.task.pipeline, {
    path: `${payload.task.stage}:${payload.task.name}`,
    status: JobStatusEnum.CANCELLED,
    task: payload.task,
    results: dependsResults,
  });

  return dependsResults;
};
