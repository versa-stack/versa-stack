import {
  AddJobPayload,
  Job,
  Pipeline,
  SetResultPayload,
  Task,
  TaskRunFilterRecord,
  TaskRunHandlerResult,
  TaskRunVoterRecord,
} from "../model";
import { createStore } from "../store";

export const pipelineStore = createStore(
  {
    pipelines: {} as Record<string, Pipeline>,
    results: {} as Record<string, TaskRunHandlerResult>,
    jobs: {} as Record<string, Record<string, Job>>,
    filters: {} as TaskRunFilterRecord,
    voters: {} as TaskRunVoterRecord,
  },
  {
    setFilters: (state, filters: TaskRunFilterRecord) =>
      (state.filters = filters),
    setVoters: (state, voters: TaskRunVoterRecord) => (state.voters = voters),
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
    taskByPath: (state) => (pipeline: string, path: string) => {
      const [stage, task] = path.split(":");
      return (state.pipelines[pipeline].stages[stage] as Task[]).find(
        (t) => t.name === task
      );
    },
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
    jobPathsByStage: (state) => (name: string, stage: string) => {
      if (!state.jobs[name]) {
        return [];
      }

      const jobs: string[] = [];

      for (const path in state.jobs[name]) {
        if (path.indexOf(stage) !== 0 || path === stage) {
          continue;
        }

        jobs.push(path);
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
