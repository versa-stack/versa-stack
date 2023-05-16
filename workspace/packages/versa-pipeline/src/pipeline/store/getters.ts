import { Job, Pipeline, PipelineStoreState, Task } from "../../model";

export default {
  pipelines: (state: PipelineStoreState) =>
    state.pipelines as Record<string, Pipeline>,
  pipeline: (state: PipelineStoreState) => (name: string) =>
    state.pipelines[name] ?? null,
  job: (state: PipelineStoreState) => (name: string, path: string) =>
    state.jobs[name] && state.jobs[name][path] ? state.jobs[name][path] : null,
  results: (state: PipelineStoreState) => (name: string, path: string) =>
    state.results?.[name]?.[path] ?? null,
  taskByPath:
    (state: PipelineStoreState) => (pipeline: string, path: string) => {
      const [stage, task] = path.split(":");
      return (state.pipelines[pipeline].stages[stage] as Task[]).find(
        (t) => t.name === task
      );
    },
  jobsByStage: (state: PipelineStoreState) => (name: string, stage: string) => {
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
  jobPathsByStage:
    (state: PipelineStoreState) => (name: string, stage: string) => {
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
};
