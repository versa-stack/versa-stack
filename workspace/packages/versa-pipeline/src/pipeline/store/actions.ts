import {
  AddJobPayload,
  JobStatus,
  Pipeline,
  PipelineStoreState,
  SetResultPayload,
  TaskRunFilterRecord,
  TaskRunVoterRecord,
} from "../../model";
import { Action } from "../../store/model";

export default {
  setStatus: (
    state: PipelineStoreState,
    pipeline: string,
    status: JobStatus
  ) => {
    if (!state.status[pipeline]) {
      state.status[pipeline] = {};
    }

    if (state.status[pipeline][status.path]) {
      const oldStatus = state.status[pipeline][status.path];

      if (oldStatus.stdout && status.stdout) {
        status.stdout = oldStatus.stdout + status.stdout;
      }

      status = {
        ...oldStatus,
        ...status,
      };
    }

    state.status[pipeline][status.path] = status;
  },
  setFilters: (state: PipelineStoreState, filters: TaskRunFilterRecord) =>
    (state.filters = filters),
  setVoters: (state: PipelineStoreState, voters: TaskRunVoterRecord) =>
    (state.voters = voters),
  addPipeline: (state: PipelineStoreState, pipeline: Pipeline) =>
    (state.pipelines[pipeline.name] = fixTasks(pipeline)),

  addJob: (
    state: PipelineStoreState,
    { job, pipeline, path }: AddJobPayload
  ) => {
    if (!state.jobs[pipeline]) {
      state.jobs[pipeline] = {};
    }

    return (state.jobs[pipeline][path] = job);
  },
  setResults: (
    state: PipelineStoreState,
    { results, pipeline, path }: SetResultPayload
  ) => {
    if (!state.results[pipeline]) {
      state.results[pipeline] = {};
    }

    return (state.results[pipeline][path] = results);
  },
} as Record<string, Action<PipelineStoreState>>;

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
