import { BuildPipelinePayload } from "../model";
import { runJob, runStageJob } from "./run";
import { pipelineStore } from "./store";

export const buildPipeline = (payload: BuildPipelinePayload) => {
  const loopVars = {
    stage: "",
  };

  pipelineStore.actions.addPipeline(payload.pipeline);

  const definedStages = Object.keys(payload.pipeline.stages);
  const stagesToRun = payload.pipeline.order.filter((s) =>
    definedStages.includes(s)
  );

  for (const stage of stagesToRun) {
    for (const task of payload.pipeline.stages[stage]) {
      if (!task.depends && loopVars.stage) {
        task.depends = [loopVars.stage];
      }

      pipelineStore.actions.addJob({
        job: runJob,
        pipeline: task.pipeline,
        path: `${stage}:${task.name}`,
      });
    }

    pipelineStore.actions.addJob({
      pipeline: payload.pipeline.name,
      path: stage,
      job: runStageJob,
    });

    loopVars.stage = stage;
  }

  return payload;
};
