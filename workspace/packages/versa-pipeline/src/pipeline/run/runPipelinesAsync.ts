import { VersaConfig } from "@versa-stack/types";

import { TaskRunHandlerResult } from "../../model";
import { RunPipelinesPayload } from "../run/runPipelinesSync";
import { pipelineStore } from "../store";
import { runPipeline } from "./runPipeline";
import * as Bluebird from 'bluebird';

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
  return Bluebird.Promise.all(promises).then((r) => r.flat());
};
