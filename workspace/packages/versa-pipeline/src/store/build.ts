import {
  BuildJobPayload,
  BuildPipelinePayload,
  Job,
  RunTaskPayload,
  TaskRunHandlerResult,
  VersaOutputFactory,
} from "../model";
import { waitForDependencies } from "../run";
import { pipelineRunnerStore } from "./runner";

export const buildPipeline = (payload: BuildPipelinePayload) => {
  const loopVars = {
    stage: "",
  };

  pipelineRunnerStore.actions.addPipeline(payload.pipeline);

  const definedStages = Object.keys(payload.pipeline.stages);
  const stagesToRun = payload.pipeline.order.filter((s) =>
    definedStages.includes(s)
  );

  for (const stage of stagesToRun) {
    for (const task of payload.pipeline.stages[stage]) {
      const job = buildJob({
        task,
        handler: payload.handler,
        dependsOn: loopVars.stage,
      });

      pipelineRunnerStore.actions.addJob({
        job,
        pipeline: task.pipeline,
        path: `${stage}:${task.name}`,
      });
    }

    pipelineRunnerStore.actions.addJob({
      pipeline: payload.pipeline.name,
      path: stage,
      job: (output: VersaOutputFactory): TaskRunHandlerResult => {
        const stagePromises: TaskRunHandlerResult[] = [];
        for (const job of pipelineRunnerStore.getters.jobsByStage(
          payload.pipeline.name,
          stage
        ) as Job[]) {
          stagePromises.push(job(output));
        }
        return pipelineRunnerStore.actions.setResults({
          results: Promise.all(stagePromises).then((r) => r.flat()),
          pipeline: payload.pipeline.name,
          path: stage,
        });
      },
    });

    loopVars.stage = stage;
  }

  return payload;
};

export const buildJob = (payload: BuildJobPayload): Job => {
  const taskDependencies: string[] = payload.task.depends
    ? payload.task.depends
    : [];

  if (payload.dependsOn && !taskDependencies.length) {
    taskDependencies.push(`${payload.dependsOn}`);
  }

  const resultTemplate = {
    pipeline: payload.task.pipeline,
    path: `${payload.task.stage}:${payload.task.name}`,
  };

  if (taskDependencies.length) {
    return async (output: VersaOutputFactory) =>
      pipelineRunnerStore.actions.setResults({
        results: waitForDependencies(payload, taskDependencies).then((r) =>
          pipelineRunnerStore.actions.runTask({
            ...payload,
            output: output({ payload }),
          } as RunTaskPayload)
        ),
        ...resultTemplate,
      });
  }

  return async (output: VersaOutputFactory) =>
    pipelineRunnerStore.actions.setResults({
      results: pipelineRunnerStore.actions.runTask({
        ...payload,
        output: output({ payload }),
      }),
      ...resultTemplate,
    });
};
