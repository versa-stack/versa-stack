import { TaskRunHandler, PipelineHooks } from "../../model";
import { handlerElection } from "../handlerElection";
import { pipelineStore } from "../store";
import { filterSensitiveData } from "../../filterSensitiveData";

export const runTask: TaskRunHandler = async (payload) => {
  pipelineStore.hooks.callHook(
    PipelineHooks.runTask,
    filterSensitiveData(payload)
  );
  const voters = pipelineStore.state.voters;

  return handlerElection(
    voters,
    payload
  )(payload)
    .then((results) => {
      pipelineStore.hooks.callHook(PipelineHooks.runTaskDone, {
        ...filterSensitiveData(payload),
        results,
      });

      return results;
    })
    .catch((err) => {
      const a = 0;
      return err;
    });
};
