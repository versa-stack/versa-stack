import { AddJobPayload, pipelineRunnerStore } from "../../src";
import { Job, Pipeline } from "../../src/model";
import { defaultFilterRegistry } from "../../src/pipeline";

const addTestPipeline = () => {
  const pipeline: Pipeline = {
    name: "example-pipeline",
    order: ["stage-1", "stage-2"],
    stages: {
      "stage-1": [
        {
          name: "task-1",
          scripts: ["echo 'hello world'"],
          stage: "stage-1",
          pipeline: "example-pipeline",
        },
      ],
      "stage-2": [
        {
          name: "task-2",
          scripts: ["echo 'hello world'"],
          stage: "stage-1",
          pipeline: "example-pipeline",
        },
      ],
    },
  };

  return pipelineRunnerStore.actions.addPipeline(pipeline);
};

describe("pipelineRunnerStore", () => {
  it("should add a pipeline to the store", () => {
    const pipeline = addTestPipeline();
    expect(pipelineRunnerStore.getters.pipeline(pipeline.name)).toEqual(
      pipeline
    );
  });
  it("should return null if pipeline is not in store", () => {
    const pipeline = pipelineRunnerStore.getters.pipeline("nope");
    expect(pipeline).toBeNull();
  });

  it("should get jobs by stage.", () => {
    const payloads: AddJobPayload[] = [
      {
        path: "stage1:job1",
        job: ((o, defaultFilterRegistry) => {}) as Job,
        pipeline: "pipeline",
      },
      {
        path: "stage1:job2",
        job: ((o, defaultFilterRegistry) => {}) as Job,
        pipeline: "pipeline",
      },
      {
        path: "stage2:job1",
        job: ((o, defaultFilterRegistry) => {}) as Job,
        pipeline: "pipeline",
      },
    ];

    payloads.forEach((p) => pipelineRunnerStore.actions.addJob(p));

    const stage1 = pipelineRunnerStore.getters.jobsByStage(
      "pipeline",
      "stage1"
    );
    const stage2 = pipelineRunnerStore.getters.jobsByStage(
      "pipeline",
      "stage2"
    );

    expect(stage1).toHaveLength(2);
    expect(stage2).toHaveLength(1);
  });

  it("should return empty when stage or pipeline does not exist", () => {
    let nullStage = pipelineRunnerStore.getters.jobsByStage(
      "does not exsits",
      "does not exist"
    );
    expect(nullStage).toEqual([]);

    const pipeline = addTestPipeline();

    nullStage = pipelineRunnerStore.getters.jobsByStage(
      pipeline.name,
      "does not exist"
    );
    expect(nullStage).toEqual([]);
  });

  it("should reutrn null if job does not exist", () => {
    let nullJob = pipelineRunnerStore.getters.job("nope", "nope");
    expect(nullJob).toBeNull();

    const pipeline = addTestPipeline();
    nullJob = pipelineRunnerStore.getters.job(pipeline.name, "nope");
    expect(nullJob).toBeNull();
  });

  it("should reutrn null if result does not exist", () => {
    let nullResult = pipelineRunnerStore.getters.results("nope", "nope");
    expect(nullResult).toBeNull();

    const pipeline = addTestPipeline();
    nullResult = pipelineRunnerStore.getters.results(pipeline.name, "nope");
    expect(nullResult).toBeNull();
  });

  it("should call hooks", (done) => {
    const handler = jest.fn((pipeline: Pipeline) => {
      expect(handler).toHaveBeenCalled();
      done();
    });

    pipelineRunnerStore.hooks.addHooks({
      addPipeline: handler,
    });

    addTestPipeline();
  });
});
