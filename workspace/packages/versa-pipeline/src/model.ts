import { Writable } from "stream";
import { pipelineRunnerStore } from "./store/runner";

export type VersaOutputFactory = (...args: any) => Writable;

export type VersaPipelineToolbox = {
  versa: {
    pipeline?: VersaPipeline;
  };
};
export type VersaPipeline = {
  store: typeof pipelineRunnerStore.getters;
  hooks: typeof pipelineRunnerStore.hooks;
  output?: VersaOutputFactory;
  handlers?: TaskRunHandlerRegistry;
};

export type TaskRunHandlerVote = {
  weight: number;
  handler: TaskRunHandler;
};

export type TaskRunHandlerRegistry = Record<
  string,
  (t: Task) => TaskRunHandlerVote
>;

export type TaskRunFilterRegistry = Record<string, TaskRunFilter>;

export type AddJobPayload = {
  job: Job;
  pipeline: string;
  path: string;
};

export type AddPipelinePayload = {
  pipeline: Pipeline;
  filters: TaskRunFilterRegistry;
};

export type SetResultPayload = {
  results: TaskRunHandlerResult;
  pipeline: string;
  path: string;
};

export type RunPipelinePayload = {
  pipelineName: string;
  output: VersaOutputFactory;
  filters: TaskRunFilterRegistry;
};

export type RunTaskPayload<T extends Task = Task> = {
  task: T;
  handler: TaskRunHandler<T>;
  output: ReturnType<VersaOutputFactory>;
};

export type BuildJobPayload<T extends Task = Task> = {
  dependsOn?: string;
} & Omit<RunTaskPayload<T>, "output">;

export type BuildPipelinePayload<T extends Task = Task> = {
  handler: TaskRunHandler<T>;
  pipeline: Pipeline;
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
export type TaskRunHandler<T extends Task = Task> = (
  payload: RunTaskPayload<T>,
  main?: TaskRunHandler<T>
) => TaskRunHandlerResult;

export type TaskRunFilter<T extends Task = Task> = (
  payload: T
) => TaskRunFilterResult;

export type TaskRunFilterResult = {
  skip: boolean;
  msg?: string;
};

export type Job = (
  output: VersaOutputFactory,
  filters: TaskRunFilterRegistry
) => TaskRunHandlerResult;
