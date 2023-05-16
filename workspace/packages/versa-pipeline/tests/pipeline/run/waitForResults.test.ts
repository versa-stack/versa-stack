import { Task, TaskRunResult, TaskRunResultCodeEnum } from "../../../src/model";
import { waitForResults } from "../../../src/pipeline/run/waitForResults";
import { pipelineStore } from "../../../src/pipeline/store";

const promisify = (taskRunResult: TaskRunResult, time: number = 15) => {
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, time));
    return [taskRunResult];
  };
};

describe("waitForResults", () => {
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
  it("detects job is a stage when dependencies have errors.", async () => {
    const task: Task = {
      name: "stage-job",
      pipeline: "test-pipeline",
      scripts: [],
    };

    const taskRunResult = {
      task,
      status: {
        code: 1,
        msg: "Failed.",
      },
      error: "Failed.",
    };

    const path = task.name;
    const results = promisify(taskRunResult)();

    pipelineStore.actions.setResults({
      results,
      pipeline: task.pipeline,
      path,
    });

    return waitForResults(task, [path]).then((awaitedResults) => {
      expect(awaitedResults[0]?.task).toEqual(task);
    });
  });

  it("cancelles a task when dependencies fail", async () => {
    const dependency: Task = {
      name: "task1",
      stage: "test",
      pipeline: "test-pipeline",
      scripts: [],
    };

    const dependencyPath = `${dependency.stage}:${dependency.name}`;

    const task: Task = {
      name: "task2",
      stage: "test",
      pipeline: "test-pipeline",
      depends: ["test:task1"],
      scripts: [],
    };

    const dependsResults = promisify({
      task: dependency,
      status: {
        code: 1,
        msg: "Failed.",
      },
      error: "Failed.",
    });

    const expectedTaskResults = {
      task,
      status: {
        code: TaskRunResultCodeEnum.CANCELLED,
      },
    };

    pipelineStore.actions.setResults({
      results: dependsResults(),
      pipeline: dependency.pipeline,
      path: dependencyPath,
    });

    await waitForResults(task, [dependencyPath]).then((awaitedResults) => {
      expect(awaitedResults[0]?.status.code).toEqual(
        expectedTaskResults.status.code
      );
    });
  });

  it("waits for results from store to resolve", async () => {
    const task: Task = {
      name: "task1",
      stage: "test",
      pipeline: "test-pipeline",
      scripts: [],
    };
    const path = `${task.stage}:${task.name}`;

    const promiseResultsToWaitFor = promisify(
      {
        task,
        status: {
          code: 0,
        },
      },
      1500
    );

    const resultsPromise = waitForResults(task, [path]).then(
      (awaitedResults) => {
        expect(awaitedResults[0]?.task?.name).toEqual(task.name);
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    pipelineStore.actions.setResults({
      results: promiseResultsToWaitFor(),
      pipeline: task.pipeline,
      path,
    });

    await resultsPromise;
  });

  it("returns an empty array if no paths were provided", async () => {
    const task: Task = {
      name: "test-task",
      pipeline: "test-pipeline",
      scripts: [],
    };

    const awaitedResults = await waitForResults(task, []);
    expect(awaitedResults).toEqual([]);
  });
});
