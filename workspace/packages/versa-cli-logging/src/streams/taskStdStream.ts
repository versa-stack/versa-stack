import { Task, VersaOutputFactory } from "@versa-stack/versa-pipeline";
import { Writable } from "stream";
import { VersaLoggingToolbox } from "../model";

const outputFactory: (toolbox: VersaLoggingToolbox) => VersaOutputFactory =
  (toolbox) => (payload) => {
    return new Writable({
      write(chunk: Buffer, _, callback: () => void) {
        toolbox.versa.log.info(
          `[${payload.task.pipeline}][${payload.task.stage}][${
            payload.task.name
          }]:> ${chunk.toString()}`,
          {
            payload,
          }
        );
        callback();
      },
    });
  };

export default outputFactory;
