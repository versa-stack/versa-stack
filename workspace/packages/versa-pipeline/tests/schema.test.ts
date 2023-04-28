import { Pipeline, PipelineInvalidError, Task, WhenTask } from "../src";
import schema from "../src/schema";

describe("validatePipeline", () => {
  const validPipeline = {
    order: ["one", "two", "three"],
    stages: {
      one: [
        {
          name: "one",
          scripts: ["hello"],
        },
      ],
    },
  };

  const invalidPipeline = {};

  test("should not throw an error when given a valid pipeline", () => {
    expect(() =>
      schema.validate(validPipeline as unknown as Pipeline)
    ).not.toThrow();
  });

  test("should throw a PipelineInvalidError error when given an invalid pipeline", () => {
    expect(() =>
      schema.validate(invalidPipeline as unknown as Pipeline)
    ).toThrowError(PipelineInvalidError);
  });

  test("should throw an error with the correct error message when given an invalid pipeline", () => {
    try {
      schema.validate(invalidPipeline as unknown as Pipeline);
    } catch (error: any) {
      expect(error.message).toEqual(
        expect.stringContaining("Pipeline is invalid:")
      );
    }
  });

  test("should allow additional task properties", () => {
    (validPipeline.stages["one"][0] as Task & WhenTask).when =
      "something == something_else";

    const result = schema.validate(validPipeline as unknown as Pipeline);
    expect((validPipeline.stages["one"][0] as Task & WhenTask).when).toEqual(
      "something == something_else"
    );
    expect(result).toBe(true);
  });
});
