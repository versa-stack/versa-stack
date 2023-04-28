import { RunPipelinesPayload, runPipelinesSync } from "./runPipelinesSync";
import { runPipelinesAsync } from "./runPipelinesAsync";

export const runPipelines = async (payload: RunPipelinesPayload) =>
  payload.options.sequential
    ? await runPipelinesSync(payload)
    : runPipelinesAsync(payload);
