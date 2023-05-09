import {
  Task,
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
      if (!toolbox.versa.pipeline?.hooks) {
        toolbox.versa.log.trace(stdOut, {
          payload,
        });
        callback();
        return;
      }

      toolbox.versa.pipeline?.hooks.callHook("runTaskOutput", {
        output: chunk.toString(),
        payload,
      });
      callback();
    },
  });
};

export default outputFactory;
