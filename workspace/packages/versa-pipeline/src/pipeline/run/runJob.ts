import { filterSensitiveData } from "../../filterSensitiveData";
import { Job, RunJobPayload, PipelineHooks } from '../../model';
import { pipelineStore } from "../store";
import { resolveResults } from "./resolveResults";

export const runJob: Job = async (payload: RunJobPayload) => {
  const { task } = payload;

  pipelineStore.hooks.callHook(PipelineHooks.runJob, filterSensitiveData(payload));

  return pipelineStore.actions.setResults({
    path: `${task.stage}:${task.name}`,
    pipeline: task.pipeline,
    results: resolveResults(payload).then((results) => {
      pipelineStore.hooks.callHook(PipelineHooks.runJobDone, {
        ...filterSensitiveData(payload),
        results,
      });
      return results;
    }),
  });
};
