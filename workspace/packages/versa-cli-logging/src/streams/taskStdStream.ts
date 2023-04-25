import { VersaOutputFactory } from "@versa-stack/versa-pipeline";
import { Writable } from "stream";
import { VersaLoggingToolbox } from "../model";

const outputFactory: (toolbox: VersaLoggingToolbox) => VersaOutputFactory =
  (toolbox) => (payload?: any) =>
    new Writable({
      write(chunk: Buffer, _, callback: () => void) {
        toolbox.versa.log.info({
          payload,
          stdout: chunk.toString(),
        });
        callback();
      },
    });

export default outputFactory;
