import { VersaConfig } from "@versa-stack/types";
import { TaskRunHandler } from "../model";
import HandlerElectionFailedError, {
  HandlerElectionFailedEnum,
} from "../errors/handlerElectionFailed";
import {
  RunTaskPayload,
  Task,
  TaskRunHandlerVote,
  TaskRunVoterRecord,
} from "../model";

export const handlerElection = <
  C extends VersaConfig = VersaConfig,
  T extends Task = Task
>(
  voters: TaskRunVoterRecord,
  payload: RunTaskPayload<C, T>
) => {
  const votes: Record<string, TaskRunHandlerVote> = {};

  Object.entries(voters).forEach(([k, v]) => {
    const vote = v(payload);
    if (!votes[vote.id]) {
      votes[vote.id] = vote;
      return;
    }

    votes[vote.id].weight += vote.weight;
  });

  const sorted = Object.values(votes);

  if (!sorted.length) {
    throw new HandlerElectionFailedError(HandlerElectionFailedEnum.NO_VOTES);
  }
  sorted.sort((lv, rv) =>
    lv.weight == rv.weight ? 0 : lv.weight > rv.weight ? 1 : -1
  );

  return (sorted.pop() as TaskRunHandlerVote).handler;
};
