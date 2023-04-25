import registryTaskRunFilterHandler from "../taskRunFilter";
import {
  AddJobPayload,
  BuildJobPayload,
  BuildPipelinePayload,
  Job,
  RunTaskPayload,
  TaskRunFilterRegistry,
  TaskRunHandlerResult,
  TaskRunResult,
  TaskRunResultCodeEnum,
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
      job: (output, filters) => {
        const stagePromises: TaskRunHandlerResult[] = [];
        for (const job of pipelineRunnerStore.getters.jobsByStage(
          payload.pipeline.name,
          stage
        ) as Job[]) {
          stagePromises.push(job(output, filters));
        }
        return pipelineRunnerStore.actions.setResults({
          results: Promise.all(stagePromises).then((r) => r.flat()),
          pipeline: payload.pipeline.name,
          path: stage,
        });
      },
    } as AddJobPayload);

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
    return async (output, filters) => {
      const runPayload = {
        ...payload,
        output: output({ payload }),
      };

      const filterTaskResult = applyFilters(runPayload, filters);
      if (!!filterTaskResult) {
        return pipelineRunnerStore.actions.setResults({
          results: Promise.resolve([filterTaskResult]),
          ...resultTemplate,
        });
      }

      return pipelineRunnerStore.actions.setResults({
        results: waitForDependencies(payload, taskDependencies).then((r) =>
          pipelineRunnerStore.actions.runTask(runPayload)
        ),
        ...resultTemplate,
      });
    };
  }

  return async (output, filters) => {
    const runPayload = {
      ...payload,
      output: output({ payload }),
    };

    const filterTaskResult = applyFilters(runPayload, filters);
    if (!!filterTaskResult) {
      return pipelineRunnerStore.actions.setResults({
        results: Promise.resolve([filterTaskResult]),
        ...resultTemplate,
      });
    }

    return pipelineRunnerStore.actions.setResults({
      results: pipelineRunnerStore.actions.runTask({
        ...payload,
        output: output({ payload }),
      }),
      ...resultTemplate,
    });
  };
};

const applyFilters = (
  payload: RunTaskPayload,
  filters: TaskRunFilterRegistry
): TaskRunResult | false => {
  const filterResult = registryTaskRunFilterHandler(filters)(payload);
  return filterResult.skip
    ? ({
        task: payload.task,
        status: {
          code: TaskRunResultCodeEnum.SKIPPED,
          msg: filterResult.msg,
        },
        pipeline: payload.task.pipeline,
        path: `${payload.task.stage}:${payload.task.name}`,
      } as TaskRunResult)
    : false;
};
