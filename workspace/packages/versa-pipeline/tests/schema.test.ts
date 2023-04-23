import { Pipeline } from "../src";
import { PipelineInvalidError } from "../src";
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
});
