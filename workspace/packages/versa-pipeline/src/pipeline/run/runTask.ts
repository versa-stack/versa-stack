import { TaskRunHandler } from "../../model";
import { handlerElection } from "../handlerElection";
import { pipelineStore } from "../store";
import { filterSensitiveData } from '../../filterSensitiveData';

export const runTask: TaskRunHandler = async (payload) => {
  pipelineStore.hooks.callHook("runTask", filterSensitiveData(payload));
  const voters = pipelineStore.state.voters;

  return handlerElection(
    voters,
    payload
  )(payload).then((results) => {
    pipelineStore.hooks.callHook("runTaskDone", {
      ...filterSensitiveData(payload),
      results,
    });

    return results;
  });
};
