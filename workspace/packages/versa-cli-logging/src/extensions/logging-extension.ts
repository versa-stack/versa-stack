import { VersaToolbox } from "@versa-stack/types";
import {
  AddJobPayload,
  Pipeline,
  RunTaskPayload,
  SetResultPayload,
  VersaPipelineToolbox,
} from "@versa-stack/versa-pipeline";
import { GluegunToolbox } from "gluegun";
import { Writable } from "stream";
import { VersaLoggingToolbox } from "../model";
import { taskStdStream as taskRunnerLogStream } from "../streams";
import { RunPipelinePayload } from "@versa-stack/versa-pipeline/lib/types/pipeline/run/runPipeline";

const writables: Record<string, Writable> = {};

type Toolbox = GluegunToolbox &
  VersaPipelineToolbox &
  VersaToolbox &
  VersaLoggingToolbox;

const waitForDependencies = async (toolbox: Toolbox) => {
  await waitFor(() => toolbox?.versa?.config);
  if (!toolbox?.versa?.config) {
    return;
  }

  await toolbox.versa.config;

  await waitFor(() => toolbox?.versa?.pipeline);
  if (!toolbox?.versa?.pipeline) {
    return;
  }

  await waitFor(() => toolbox?.versa?.log);
  if (!toolbox?.versa?.log) {
    return;
  }
};

export default async (toolbox: Toolbox) => {
  await waitForDependencies(toolbox);

  if (toolbox?.versa?.pipeline) {
    toolbox.versa.pipeline.output = (payload) => {
      const { task } = payload;
      const path = Buffer.from(
        `${task.pipeline}:${task.stage}:${task.name}`,
        "utf-8"
      ).toString("base64");

      if (!writables[path]) {
        writables[path] = taskRunnerLogStream(toolbox)(payload);
      }

      return writables[path];
    };
  }

  toolbox.versa.pipeline?.hooks.addHooks({
    addPipeline: async (payload: Pipeline) => {
      toolbox.versa.log.info({
        msg: `added pipeline "${payload.name}"`,
        action: "appPipeline",
        payload,
      });
    },
    addJob: async (payload: AddJobPayload) => {
      toolbox.versa.log.info({
        msg: `added job ${payload.path} to pipeline "${payload.pipeline}"`,
        action: "addJob",
        payload,
      });
    },
    setResults: async (payload: SetResultPayload) => {
      toolbox.versa.log.info({
        msg: `results from job "${payload.path}" in pipeline "${payload.pipeline}"`,
        action: "setResults",
        payload,
      });
    },
    runPipeline: async (payload: RunPipelinePayload) => {
      toolbox.versa.log.info({
        msg: `running pipeline "${payload.pipeline}"`,
        action: "runPipeline",
        payload,
      });
    },
    runPipelineDone: async (payload: any) => {
      toolbox.versa.log.info({
        msg: `done running pipeline "${payload.pipeline.name}"`,
        action: "runPipelineDone",
        payload,
      });
    },
    runTask: async (payload: RunTaskPayload) => {
      toolbox.versa.log.info({
        msg: `running task "${payload.task.name}" in stage "${payload.task.name}" for pipeline "${payload.task.pipeline}"`,
        action: "runTask",
        payload,
      });
    },
    runTaskDone: async (payload: any) => {
      toolbox.versa.log.info({
        msg: `done running task "${payload.task.name}" in stage "${payload.task.stage}" for pipeline "${payload.task.pipeline}"`,
        action: "runTaskDone",
        payload,
      });
    },
  });
};

export const waitFor = async (
  value: () => any,
  options: {
    maxWaitSeconds: number;
    waitMs: number;
  } = {
    maxWaitSeconds: 3,
    waitMs: 5,
  }
) => {
  const { maxWaitSeconds, waitMs } = options;
  const maxWait = maxWaitSeconds * 1000;
  let counter = 0;

  while (!value() && maxWait > counter) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    counter += waitMs;
  }
};
