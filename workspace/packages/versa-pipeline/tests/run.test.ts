import { PassThrough } from "stream";
import { RunTaskPayload, Task, pipelineRunnerStore } from "../src";
import { runPipeline, runTask, waitForDependencies } from "../src/run";

describe("runPipeline", () => {
  it("should return an empty array if pipeline has no stages", async () => {
    const pipelineName = "emptyPipeline";
    pipelineRunnerStore.getters.pipeline = jest.fn().mockReturnValue({
      name: pipelineName,
      order: [],
    });

    const result = await runPipeline({
      pipelineName,
      output: () => new PassThrough(),
    });
    expect(result).toEqual([]);
  });

  it("should execute each stage in pipeline", async () => {
    const pipelineName = "testPipeline";
    pipelineRunnerStore.getters.pipeline = jest.fn().mockReturnValue({
      name: pipelineName,
      order: ["stage1", "stage2"],
      stages: {
        stage1: [{}],
        stage2: [{}]
      }
    });
    pipelineRunnerStore.getters.job = jest
      .fn()
      .mockImplementation((_, stage) => {
        return jest.fn().mockResolvedValue({
          stage,
          result: "success",
        });
      });

    const result = await runPipeline({
      pipelineName,
      output: () => new PassThrough(),
    });
    expect(result).toEqual([
      { stage: "stage1", result: "success" },
      { stage: "stage2", result: "success" },
    ]);
  });
});

describe("runTask", () => {
  it("should call taskRunHandler with the task", async () => {
    const payload = {
      task: {
        name: "testTask",
        pipeline: "testPipeline",
      } as Task,
      output: new PassThrough(),
      handler: jest.fn((task) =>
        Promise.resolve([
          {
            task,
            status: {
              code: 0,
            },
          },
        ])
      ),
    };
    const result = await runTask(payload);
    expect(payload.handler).toHaveBeenCalledWith(payload);
    expect(result);
  });
});

describe("waitForDependencies", () => {
  it("should wait for dependencies to complete", async () => {
    const task = {
      name: "testTask",
      pipeline: "testPipeline",
    } as Task;
    const payload = {
      task,
      taskHandler: jest.fn().mockReturnValue({}),
    } as unknown as RunTaskPayload;
    pipelineRunnerStore.getters.results = jest
      .fn()
      .mockResolvedValue([{ result: "dep2" }]);

    const result = await waitForDependencies(payload, ["dep2"]);
    expect(result.length).toEqual(1);
  });
});
