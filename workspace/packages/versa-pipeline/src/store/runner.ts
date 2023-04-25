import {
  AddJobPayload,
  Job,
  Pipeline,
  RunPipelinePayload,
  RunTaskPayload,
  SetResultPayload,
  TaskRunHandlerResult,
} from "../model";
import { createStore } from "./store";

export const pipelineRunnerStore = createStore(
  {
    pipelines: {} as Record<string, Pipeline>,
    results: {} as Record<string, TaskRunHandlerResult>,
    jobs: {} as Record<string, Record<string, Job>>,
  },
  {
    addPipeline: (state, pipeline: Pipeline) =>
      (state.pipelines[pipeline.name] = fixTasks(pipeline)),
    addJob: (state, { job, pipeline, path }: AddJobPayload) => {
      if (!state.jobs[pipeline]) {
        state.jobs[pipeline] = {};
      }

      return (state.jobs[pipeline][path] = job);
    },
    setResults: (state, { results, pipeline, path }: SetResultPayload) => {
      if (!state.results[pipeline]) {
        state.results[pipeline] = {};
      }

      return (state.results[pipeline][path] = results);
    },
    runPipeline: async (
      _,
      { pipelineName, output, filters }: RunPipelinePayload
    ) => {
      const pipeline: Pipeline =
        pipelineRunnerStore.getters.pipeline(pipelineName);

      if (!pipeline.stages) {
        return Promise.resolve([]);
      }

      const promises: TaskRunHandlerResult[] = [];
      const definedStages = Object.keys(pipeline.stages);
      const stagesToBuild = pipeline.order.filter((s) =>
        definedStages.includes(s)
      );

      for (const stageName of stagesToBuild) {
        promises.push(
          pipelineRunnerStore.getters.job(pipelineName, `${stageName}`)(
            output,
            filters
          )
        );
      }

      return Promise.all(promises.flat()).then((results) => {
        pipelineRunnerStore.hooks.callHook("runPipelineDone", {
          pipeline,
          results,
        });
        return results.flat();
      });
    },
    runTask: async (_, payload: RunTaskPayload) => {
      return payload.handler(payload).then((results) => {
        pipelineRunnerStore.hooks.callHook("runTaskDone", {
          task: payload.task,
          results,
        });
        return results;
      });
    },
  },
  {
    pipelines: (state) => state.pipelines as Record<string, Pipeline>,
    pipeline:
      (state) =>
      (name: string): Pipeline | null =>
        state.pipelines[name] ?? null,
    job:
      (state) =>
      (name: string, path: string): Job | null =>
        state.jobs[name] && state.jobs[name][path]
          ? state.jobs[name][path]
          : null,
    results:
      (state) =>
      (name: string, path: string): TaskRunHandlerResult =>
        state.results[name] && state.results[name][path]
          ? state.results[name][path]
          : null,
    jobsByStage: (state) => (name: string, stage: string) => {
      if (!state.jobs[name]) {
        return [];
      }

      const jobs: Job[] = [];

      for (const path in state.jobs[name]) {
        if (path.indexOf(stage) !== 0 || path === stage) {
          continue;
        }

        jobs.push(state.jobs[name][path]);
      }

      return jobs;
    },
  }
);

const fixTasks = ({ name, order, stages }: Pipeline) => {
  const definedStages = Object.keys(stages);
  order
    .filter((stage) => definedStages.includes(stage))
    .forEach((s) => {
      stages[s].forEach((t, i) => {
        stages[s][i] = {
          ...t,
          stage: s,
          pipeline: name,
        };
      });
    });

  return {
    name,
    order,
    stages,
  };
};
