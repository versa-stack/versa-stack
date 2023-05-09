import { TaskRunHandlerResult } from "../../model";
import { pipelineStore } from "../store";
import * as Bluebird from "bluebird";

export const waitForResults = async (pipeline: string, paths: string[]) => {
  if (!paths.length) {
    return [];
  }

  const deps: TaskRunHandlerResult[] = [];
  for (const path of paths) {
    while (!pipelineStore.getters.results(pipeline, path)) {
      await new Bluebird.Promise((resolve) => setTimeout(resolve, 5));
    }

    deps.push(pipelineStore.getters.results(pipeline, path));
  }

  return await Bluebird.Promise.all(deps.flat()).then((r) => r.flat());
};
