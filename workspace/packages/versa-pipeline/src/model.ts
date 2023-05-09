import { VersaConfig } from "@versa-stack/types";
import { Writable } from "stream";
import { pipelineStore } from "./pipeline/store";

export type VersaOutputFactory = (payload: RunJobPayload) => Writable;

export type VersaPipelineToolbox = {
  versa: {
    pipeline?: VersaPipeline;
  };
};

export type VersaPipeline = {
  store: typeof pipelineStore;
  hooks: typeof pipelineStore.hooks;
  output?: VersaOutputFactory;
  voters?: TaskRunVoterRecord;
  filters?: TaskRunFilterRecord;
};

export type TaskRunHandlerVote = {
  weight: number;
  handler: TaskRunHandler;
  id: string;
};

export type TaskRunVoter = (payload: RunTaskPayload) => TaskRunHandlerVote;

export type TaskRunVoterRecord = Record<string, TaskRunVoter>;

export type TaskRunFilterRecord = Record<string, TaskRunFilter>;

export type AddJobPayload = {
  job: Job;
  pipeline: string;
  path: string;
};

export type AddPipelinePayload = {
  pipeline: Pipeline;
};

export type SetResultPayload = {
  results: TaskRunHandlerResult;
  pipeline: string;
  path: string;
};

export interface Pipeline {
  name: string;
  order: string[];
  stages: Record<string, Task[]>;
}

export type Task = {
  depends?: string[];
  name: string;
  pipeline: string;
  scripts: string[];
  stage: string;
  workingDir?: string;
  tags?: string[];
};

export type DockerTask = {
  image?: string;
  volumeBinds?: string[];
  user?: {
    uid: number;
    gid?: number;
    username: string;
  };
};

export type WhenTask = {
  when?: string;
};

export type TaggedTask = {
  tags?: string[];
};

export enum TaskRunResultCodeEnum {
  EOC = -2,
  SUCCESS = -1,
  SKIPPED = 85,
}
export type TaskRunResult = {
  task: Task;
  status: {
    code: TaskRunResultCodeEnum | number;
    msg?: string;
  };
  error?: any;
  output?: Record<string, any>;
};
export type TaskRunHandlerResult = Promise<TaskRunResult[]>;
export type TaskRunHandler<
  C extends VersaConfig = VersaConfig,
  T extends Task = Task
> = (
  payload: RunTaskPayload<C, T>,
  chain?: TaskRunHandler<C, T>
) => TaskRunHandlerResult;

export type TaskRunFilter = <
  C extends VersaConfig = VersaConfig,
  T extends Task = Task
>(
  payload: RunJobPayload
) => TaskRunFilterResult;

export type TaskRunFilterResult = {
  skip: boolean;
  msg?: string;
};

export type RunTaskPayload<
  C extends VersaConfig = VersaConfig,
  T extends Task = Task
> = Omit<RunJobPayload<C, T>, "output"> & {
  output: ReturnType<VersaOutputFactory>;
};

export type Job = <C extends VersaConfig = VersaConfig, T extends Task = Task>(
  payload: RunJobPayload<C, T>
) => TaskRunHandlerResult;

export type RunJobPayload<
  C extends VersaConfig = VersaConfig,
  T extends Task = Task
> = {
  config: C;
  options: RunPipelineOptions;
  output: VersaOutputFactory;
  task: T;
};

export type DonePayload<P> = P & {
  results: TaskRunResult[];
};

export type BuildPipelinePayload = {
  pipeline: Pipeline;
};

export type RunPipelineOptions = {
  tagsExpr?: string;
  sequential?: boolean;
} & Record<string, string | boolean | number>;

export type RunTaskOutputPayload = {
  output: string;
} & RunTaskPayload;

export enum PipelineHooks {
  addPipeline = "addPipeline",
  runPipeline = "runPipeline",
  runPipelineDone = "runPipelineDone",
  addJob = "addJob",
  runJob = "runJob",
  runJobDone = "runJobDone",
  runTask = "runTask",
  runTaskOutput = "runTaskOutput",
  runTaskDone = "runTaskDone",
  setResults = "setResults",
  setStatus = "setStatus",
}

export type PipelineStatus = Record<string, Record<string, JobStatus>>;

export type JobStatus = {
  path: string;
  status: JobStatusEnum;
  task: Task;
};

export enum JobStatusEnum {
  ADDED = "added",
  PENDING = "pending",
  RUNNING = "running",
  DONE = "done",
  CANCELLED = "cancelled",
  SKIPPED = "skipped",
}
