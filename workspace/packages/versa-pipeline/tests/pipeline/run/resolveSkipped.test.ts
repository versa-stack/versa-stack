import { VersaConfig } from "@versa-stack/types";
import { PassThrough } from "stream";
import { JobStatusEnum, TaskRunFilterRecord } from "../../../src/model";
import { resolveSkipped } from "../../../src/pipeline/run/resolveSkipped";
import { pipelineStore } from "../../../src/pipeline/store";

describe("resolveSkipped", () => {
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
  it("resolves payload as skipped", () => {
    const filters: TaskRunFilterRecord = {
      alwaysSkip: () => ({ skip: true }),
    };

    const task = {
      name: "test",
      pipeline: "test",
      stage: "test",
      scripts: [],
    };

    pipelineStore.actions.setFilters(filters);

    const resolved = resolveSkipped({
      output: () => new PassThrough(),
      task,
      config: {} as any as VersaConfig,
      options: {},
    });
    const pipelineStatus = pipelineStore.state.status[task.pipeline];

    expect(resolved).not.toBeNull();
    expect(pipelineStatus).not.toBeNull();
    expect(pipelineStatus[`${task.stage}:${task.name}`]?.status).toEqual(
      JobStatusEnum.SKIPPED
    );
  });

  it("resolves payload as not skipped", () => {
    const filters: TaskRunFilterRecord = {
      neverSkip: () => ({ skip: false }),
    };

    pipelineStore.actions.setFilters(filters);

    const task = {
      name: "test",
      pipeline: "test",
      stage: "test",
      scripts: [],
    };

    const resolved = resolveSkipped({
      output: () => new PassThrough(),
      task,
      config: {} as any as VersaConfig,
      options: {},
    });

    const pipelineStatus = pipelineStore.state.status[task.pipeline];

    expect(resolved).toBeNull();
    expect(pipelineStatus).toBeUndefined();
  });
});
