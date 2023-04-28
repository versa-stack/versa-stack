import { VersaConfig } from "@versa-stack/types";
import { fetchMergeExpand } from "@versa-stack/versa-config";
import { glob } from "glob";
import { Pipeline } from "../model";
import schema from "../schema";
import { buildPipeline } from "./buildPipeline";
import { runPipeline } from "./run/runPipeline";
import { runPipelines } from "./run/runPipelines";

export type CreatePipelinePayload<C extends VersaConfig = VersaConfig> = {
  glob: string | string[];
  config: C;
};

export const createPipeline = async <C extends VersaConfig = VersaConfig>(
  payload: CreatePipelinePayload<C>
) => {
  const { config } = payload;

  const resolvedSources = await glob(
    payload.glob,
    config.runconfig.glob ?? { ignore: "node_modules/**" }
  );

  if (!resolvedSources?.length) return null;

  for (const source of resolvedSources) {
    const fetchMergeExpandPayload: Pipeline & {
      config: VersaConfig;
    } = {
      config,
      name: source
        .substring(source.lastIndexOf("/") + 1 ?? 0)
        .replace(/\.[^/.]+$/, ""),
      stages: {},
      order: [],
    };

    const pipelineConfig = await fetchMergeExpand(
      source,
      fetchMergeExpandPayload
    );

    const { config: _, ...pipeline } = pipelineConfig;

    schema.validate(pipeline);

    buildPipeline({
      pipeline,
    });
  }

  return {
    runOne: runPipeline,
    runAll: runPipelines,
  };
};
