import { filterSensitiveData } from "../../filterSensitiveData";
import {
  JobStatusEnum,
  RunJobPayload,
  TaskRunHandlerResult,
} from "../../model";
import { pipelineStore } from "../store";
import { resolveCancelled } from "./resolveCancelled";
import { resolveDone } from "./resolveDone";
import { resolveSkipped } from "./resolveSkipped";
import { runTask } from "./runTask";
import { waitForResults } from "./waitForResults";

export const resolveResults = async (
  payload: RunJobPayload
): TaskRunHandlerResult => {
  const skipResolved = await resolveSkipped(payload);

  if (skipResolved) {
    return skipResolved;
  }

  pipelineStore.actions.setStatus(payload.task.pipeline, {
    path: `${payload.task.stage}:${payload.task.name}`,
    status: JobStatusEnum.PENDING,
    task: payload.task,
  });

  return waitForResults(payload.task, payload.task.depends || []).then(
    async (dependsResults) => {
      const path = `${payload.task.stage}:${payload.task.name}`;

      const cancelledResolved = resolveCancelled(payload, dependsResults);
      if (cancelledResolved) {
        return cancelledResolved;
      }

      pipelineStore.actions.setStatus(payload.task.pipeline, {
        path,
        status: JobStatusEnum.RUNNING,
        task: payload.task,
      });

      const taskResults = await runTask({
        ...payload,
        output: payload.output(filterSensitiveData(payload)),
      });

      return resolveDone(payload, taskResults);
    }
  );
};
