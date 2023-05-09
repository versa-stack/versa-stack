import { VersaConfig } from "@versa-stack/types";
import { filterSensitiveData } from "../../filterSensitiveData";
import {
  Pipeline,
  RunJobPayload,
  TaskRunHandlerResult,
  PipelineHooks,
} from "../../model";
import { pipelineStore } from "../store";

export type RunPipelinePayload<C extends VersaConfig = VersaConfig> = {
  pipeline: string;
} & Omit<RunJobPayload<C>, "task">;

export const runPipeline = async <C extends VersaConfig = VersaConfig>(
  payload: RunPipelinePayload<C>
) => {
  pipelineStore.hooks.callHook(
    PipelineHooks.runPipeline,
    filterSensitiveData(payload)
  );
  const pipeline: Pipeline = pipelineStore.getters.pipeline(payload.pipeline);

  if (!pipeline.stages) {
    return Promise.resolve([]);
  }

  const promises: TaskRunHandlerResult[] = [];
  const definedStages = Object.keys(pipeline.stages);
  const stagesToBuild = pipeline.order.filter((s) => definedStages.includes(s));

  for (const stageName of stagesToBuild) {
    promises.push(
      pipelineStore.state.jobs[pipeline.name][stageName]({
        ...payload,
        task: {
          name: stageName,
          pipeline: pipeline.name,
          stage: stageName,
          scripts: [],
        },
      })
    );
  }

  return Promise.all(promises.flat()).then((results) => {
    pipelineStore.hooks.callHook(PipelineHooks.runPipelineDone, {
      ...filterSensitiveData(payload),
      results,
    });
    return results.flat();
  });
};
