import { VersaConfig } from "@versa-stack/types";
import { RunPipelinesPayload } from "../run/runPipelinesSync";
import { TaskRunHandlerResult } from "../../model";
import { pipelineStore } from "../store";
import { runPipeline } from "./runPipeline";

export const runPipelinesAsync = async <C extends VersaConfig = VersaConfig>(
  payload: RunPipelinesPayload<C>
) => {
  const promises: TaskRunHandlerResult[] = [];
  for (const pipeline in pipelineStore.state.pipelines) {
    promises.push(
      runPipeline<C>({
        pipeline,
        ...payload,
      })
    );
  }
  return Promise.all(promises).then((r) => r.flat());
};
