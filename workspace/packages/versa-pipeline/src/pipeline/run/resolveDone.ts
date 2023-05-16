import { TaskRunResult } from '../../model';
import { pipelineStore } from '../store';
import {
  JobStatus,
  JobStatusEnum,
  RunJobPayload
} from "../../model";

export const resolveDone = (
  payload: RunJobPayload,
  results: TaskRunResult[]
) => {
  const status = {
    path: `${payload.task.stage}:${payload.task.name}`,
    status: JobStatusEnum.DONE,
    task: payload.task,
    results,
  } as JobStatus;

  results.forEach((r) => {
    if (r.error) {
      status.status = JobStatusEnum.ERROR;
    }
  });

  pipelineStore.actions.setStatus(payload.task.pipeline, status);

  return results;
};
