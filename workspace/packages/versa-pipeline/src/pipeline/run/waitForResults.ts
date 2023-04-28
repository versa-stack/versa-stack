import { TaskRunHandlerResult } from "../../model";
import { pipelineStore } from "../store";

export const waitForResults = async (
  pipeline: string,
  paths: string[]
) => {
  if (!paths.length) {
    return [];
  }

  const deps: TaskRunHandlerResult[] = [];
  for (const path of paths) {
    while (!pipelineStore.getters.results(pipeline, path)) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    deps.push(pipelineStore.getters.results(pipeline, path));
  }

  return await Promise.all(deps.flat()).then((r) => r.flat());
};
