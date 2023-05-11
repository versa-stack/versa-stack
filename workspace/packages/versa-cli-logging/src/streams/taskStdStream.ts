import {
  VersaOutputFactory,
  VersaPipelineToolbox,
} from "@versa-stack/versa-pipeline";
import { Writable } from "stream";
import { VersaLoggingToolbox } from "../model";

const outputFactory: (
  toolbox: VersaLoggingToolbox & VersaPipelineToolbox
) => VersaOutputFactory = (toolbox) => (payload) => {
  return new Writable({
    write(chunk: Buffer, _, callback: () => void) {
      const stdOut = chunk.toString();
      toolbox.versa.log.info(
        `[Pipeline: ${payload.task.pipeline}] --> ${payload.task.stage}:${payload.task.name}`,
        `${stdOut}`
      );

      toolbox.versa.pipeline?.hooks.callHook("runTaskOutput", {
        output: chunk.toString(),
        payload,
      });
      callback();
    },
  });
};

export default outputFactory;
