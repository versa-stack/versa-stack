import { VersaConfig } from "@versa-stack/types";
import { pipelineStore } from "../store";
import { RunPipelinePayload, runPipeline } from "./runPipeline";

export type RunPipelinesPayload<C extends VersaConfig = VersaConfig> = Omit<
  RunPipelinePayload<C>,
  "pipeline"
>;

export const runPipelinesSync = async <C extends VersaConfig = VersaConfig>(
  payload: RunPipelinesPayload<C>
) => {
  const results = [];
  for (const pipeline in pipelineStore.state.pipelines) {
    results.push(
      await runPipeline<C>({
        pipeline,
        ...payload,
      })
    );
  }
  return results.flat();
};
