import {
  RunTaskPayload,
  TaskRunFilterResult,
  TaskRunFilterRegistry,
} from "../model";

const registryTaskRunFilterHandler =
  (r: TaskRunFilterRegistry) => (payload: RunTaskPayload) =>
    Object.values(r).reduce(
      (previous, current) => {
        if (previous.skip) {
          return previous;
        }
        return current(payload.task);
      },
      { skip: false }
    ) as unknown as TaskRunFilterResult;

export default registryTaskRunFilterHandler;
