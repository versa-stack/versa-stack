import { VersaToolbox } from "@versa-stack/types";
import {
  AddJobPayload,
  DonePayload,
  Pipeline,
  PipelineHooks,
  RunJobPayload,
  RunTaskOutputPayload,
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
    [`${PipelineHooks.addPipeline}`]: async (payload: Pipeline) => {
      toolbox.versa.log.trace(`added pipeline "${payload.name}"`, {
        msg: `added pipeline "${payload.name}"`,
        action: "addPipeline",
        payload,
      });
    },
    [`${PipelineHooks.addJob}`]: async (payload: AddJobPayload) => {
      toolbox.versa.log.trace(
        `added job ${payload.path} to pipeline "${payload.pipeline}"`,
        {
          action: "addJob",
          payload,
        }
      );
    },
    [`${PipelineHooks.setResults}`]: async (payload: SetResultPayload) => {
      toolbox.versa.log.trace(
        `results from job "${payload.path}" in pipeline "${payload.pipeline}"`,
        {
          action: "setResults",
          payload,
        }
      );
    },
    [`${PipelineHooks.runPipeline}`]: async (payload: RunPipelinePayload) => {
      toolbox.versa.log.trace(`running pipeline "${payload.pipeline}"`, {
        action: "runPipeline",
        payload,
      });
    },
    [`${PipelineHooks.runPipelineDone}`]: async (
      payload: DonePayload<RunPipelinePayload>
    ) => {
      toolbox.versa.log.trace(`done running pipeline "${payload.pipeline}"`, {
        action: "runPipelineDone",
        payload,
      });
    },
    [`${PipelineHooks.runJob}`]: async (payload: RunJobPayload) => {},
    [`${PipelineHooks.runJobDone}`]: async (
      payload: DonePayload<RunJobPayload>
    ) => {},
    runTaskOutput: async (payload: RunTaskOutputPayload) => {},
    runTask: async (payload: RunTaskPayload) => {
      toolbox.versa.log.trace(
        `running task "${payload.task.name}" in stage "${payload.task.name}" for pipeline "${payload.task.pipeline}"`,
        {
          action: "runTask",
          payload,
        }
      );
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
