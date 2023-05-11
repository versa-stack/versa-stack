import { Writable } from "stream";
import { JobStatus, JobStatusEnum, VersaOutputFactory } from "../../model";
import { pipelineStore } from "../store";

const outputFactory: (parent?: VersaOutputFactory) => VersaOutputFactory =
  (parent) => (payload) => {
    let writeTo = parent ? parent(payload) : null;

    return new Writable({
      write(chunk: Buffer, _, callback: () => void) {
        const stdout = chunk.toString();
        const path = `${payload.task.stage}:${payload.task.name}`;
        const pipeline = pipelineStore.state.status[payload.task.pipeline];

        if (!pipeline) return;

        pipelineStore.actions.setStatus(payload.task.pipeline, {
          path,
          stdout,
        });

        writeTo?.write(chunk, callback);
      },
    });
  };

export default outputFactory;
