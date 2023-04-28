import { DockerTask, TaskRunVoterRecord } from "../../model";

import { runInDocker } from "./runInDocker";
import { runInShell } from "./runInShell";

export { runInDocker, runInShell };

export const defaultTaskRunVoterRecord: TaskRunVoterRecord = {
  runInShell: (payload) => ({
    id: "runInShell",
    weight:
      !!payload.task.scripts && !(payload.task as DockerTask).image ? 10 : 0,
    handler: runInShell,
  }),
  runInDocker: (payload) => ({
    id: "runInDocker",
    weight:
      !!payload.task.scripts && !!(payload.task as DockerTask).image ? 10 : 0,
    handler: runInDocker,
  }),
};
