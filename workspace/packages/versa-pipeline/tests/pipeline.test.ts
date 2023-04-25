import pipeline, {
  Pipeline,
  TaskRunResult,
  TaskRunResultCodeEnum,
  defaultFilterRegistry,
  defaultRegistry,
  pipelineRunnerStore,
} from "../src";

describe("Runs pipelines in parallel for a given glob.", () => {
  it("Loads a test pipeline", async () => {
    return await pipeline([`${__dirname}/files/pipeline-simple.yaml`]).then(
      () => {
        const actualPipeline = pipelineRunnerStore.getters.pipeline(
          "pipeline-simple"
        ) as Pipeline | null;
        expect(actualPipeline).not.toBeNull();

        if (!actualPipeline) {
          return;
        }

        for (const stage of actualPipeline?.order) {
          const jobs = pipelineRunnerStore.getters.jobsByStage(
            actualPipeline.name,
            stage
          );
          expect(jobs).not.toBeNull();
          if (!jobs) continue;
          expect(jobs.length).toEqual(stage === "third" ? 2 : 1);
        }
      }
    );
  });

  it("Uses jsonpath to fetch values from configBag.", async () => {
    const configs = {
      repository: {
        exampleTask: {
          scripts: ['echo "hello world"'],
        },
      },
    };

    return pipeline(
      [`${__dirname}/files/dynamic-pipeline.yaml`],
      {
        handler: defaultRegistry,
        filters: defaultFilterRegistry,
      },
      configs
    ).then(() => {
      const actualPipeline = pipelineRunnerStore.getters.pipeline(
        "dynamic-pipeline"
      ) as Pipeline | null;

      expect(actualPipeline).not.toBeNull();

      if (!actualPipeline) {
        return;
      }

      for (const stage of actualPipeline?.order) {
        const jobs = pipelineRunnerStore.getters.jobsByStage(
          actualPipeline.name,
          stage
        );
        expect(jobs).not.toBeNull();
        if (!jobs) continue;
        expect(jobs.length).toEqual(1);
      }
    });
  });

  it("Runs a test pipeline", async () => {
    const runner = await pipeline([`${__dirname}/files/pipeline-simple.yaml`]);

    expect(runner).not.toBeNull();

    if (!runner) {
      return;
    }

    return await runner
      .runPipeline({
        pipelineName: "pipeline-simple",
        output: () => process.stdout,
        filters: defaultFilterRegistry,
      })

      .then((pipelineResults) => {
        expect(pipelineResults.length).toEqual(4);
        expect((pipelineResults[3] as TaskRunResult).status.code).toEqual(
          TaskRunResultCodeEnum.SKIPPED as number
        );
        return pipelineResults;
      });
  }, 120000);
});
