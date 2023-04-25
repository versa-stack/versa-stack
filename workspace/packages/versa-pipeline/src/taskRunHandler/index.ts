import {
  RunTaskPayload,
  TaskRunHandler,
  TaskRunHandlerRegistry,
  TaskRunHandlerVote,
} from "../model";
import { runInDocker } from "./runInDocker";
import { runInShell } from "./runInShell";
import { whenFilter } from "../taskRunFilter/whenFilter";

const registryTaskRunHandler =
  (r: TaskRunHandlerRegistry): TaskRunHandler =>
  (payload: RunTaskPayload) => {
    const votes: Record<string, TaskRunHandlerVote> = {};
    Object.entries(r).forEach(([k, v]) => {
      const vote = v(payload.task);
      if (!votes[k]) {
        votes[k] = vote;
        return;
      }

      votes[k].weight += vote.weight;
    });

    return Object.values(votes)
      .sort((lv, rv) => (lv.weight > rv.weight ? 1 : 0))[0]
      .handler(payload, registryTaskRunHandler(r));
  };

export default registryTaskRunHandler;

export { runInDocker, runInShell, whenFilter as whenHandler };
