import { VersaConfig } from "@versa-stack/types";
import { PassThrough } from "stream";
import {
  RunTaskPayload,
  Task,
  TaskRunResult,
  TaskRunVoterRecord,
} from "../../../src/model";
import { runTask } from "../../../src/pipeline/run/runTask";
import { pipelineStore } from "../../../src/pipeline/store";

describe("runTask", () => {
  beforeEach(
    () =>
      (pipelineStore.state = {
        filters: {},
        jobs: {},
        pipelines: {},
        results: {},
        status: {},
        voters: {},
      })
  );
    it("runs a task with an elected handler", async () => {
      const expectedPayload: RunTaskPayload = {
        config: {} as VersaConfig,
        options: {},
        output: new PassThrough(),
        task: {
          name: "test-task",
        } as Task,
      };
      const voters: TaskRunVoterRecord = {
        pickMe: () => ({
          id: "pickMe",
          weight: 100,
          handler: (payload) => {
            expect(payload).toEqual(expectedPayload);
            return Promise.resolve([
              {
                task: {
                  name: "test-task",
                },
              } as TaskRunResult,
            ]);
          },
        }),
      };

      pipelineStore.actions.setVoters(voters);

      const result = await runTask(expectedPayload);
      expect(result[0].task.name).toEqual("test-task");
    });
});
