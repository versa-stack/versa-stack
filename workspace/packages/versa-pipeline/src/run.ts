import {
  RunPipelinePayload,
  RunTaskPayload,
  TaskRunHandlerResult,
} from "./model";
import { pipelineRunnerStore } from "./store";

export const runPipeline = async (
  payload: RunPipelinePayload
): TaskRunHandlerResult => pipelineRunnerStore.actions.runPipeline(payload);

export const runTask = (payload: RunTaskPayload): TaskRunHandlerResult =>
  pipelineRunnerStore.actions.runTask(payload);

export const waitForDependencies = async (
  payload: Omit<RunTaskPayload, "output">,
  taskDependencies: string[]
) => {
  const dependencies = [];
  for (const dependency of taskDependencies) {
    while (
      !pipelineRunnerStore.getters.results(payload.task.pipeline, dependency)
    ) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    dependencies.push(
      pipelineRunnerStore.getters.results(payload.task.pipeline, dependency)
    );
  }

  return Promise.all(dependencies.flat()).then((r) => r.flat());
};
