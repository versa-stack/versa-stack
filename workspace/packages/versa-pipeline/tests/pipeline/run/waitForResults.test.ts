import { pipelineStore } from "../../../src/pipeline/store";
import { waitForResults } from "../../../src/pipeline/run/waitForResults";

describe("waitForResults", () => {
  it("waits for results from store to resolve", async () => {
    const pipeline = "test-pipeline";
    const path = "waitforme";
    const results = (async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        task: {
          name: "waitforme",
        },
      };
    })();

    const awaitedResults = waitForResults(pipeline, [path]).then(
      (awaitedResults) => {
        expect(awaitedResults[0]?.task?.name).toEqual("waitforme");
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    pipelineStore.actions.setResults({ results, pipeline, path });

    await awaitedResults;
  });

  it("returns an empty array if no paths were provided", async () => {
    const awaitedResults = await waitForResults("test-pipeline", []);
    expect(awaitedResults).toEqual([]);
  });
});
