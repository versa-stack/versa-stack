import { Job, RunJobPayload } from "../../model";
import { pipelineStore } from "../store";
import { waitForResults } from "./waitForResults";

export const runStageJob: Job = async (payload: RunJobPayload) => {
  const jobs: Job[] = pipelineStore.getters.jobsByStage(
    payload.task.pipeline,
    payload.task.stage
  );
  const jobPaths: string[] = pipelineStore.getters.jobPathsByStage(
    payload.task.pipeline,
    payload.task.stage
  );

  for (const index in jobs) {
    const path = jobPaths[index];
    if (!path) continue;
    const jobTask = pipelineStore.getters.taskByPath(
      payload.task.pipeline,
      path
    );
    jobs[index]({
      ...payload,
      task: jobTask,
    });
  }

  return pipelineStore.actions.setResults({
    results: waitForResults(payload.task.pipeline, jobPaths),
    pipeline: payload.task.pipeline,
    path: payload.task.stage,
  });
};
