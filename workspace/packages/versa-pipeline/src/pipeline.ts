import { fetchMergeExpand } from "@versa-stack/versa-config";
import globby from "globby";
import {
  BuildPipelinePayload,
  DockerTask,
  Pipeline,
  Task,
  TaskRunFilterRegistry,
  TaskRunHandlerRegistry,
  TaskRunHandlerResult,
  VersaOutputFactory,
} from "./model";
import { runPipeline } from "./run";
import schema from "./schema";
import { buildPipeline } from "./store/build";
import { pipelineRunnerStore } from "./store/runner";
import { whenFilter } from "./taskRunFilter/whenFilter";
import taskRunHandler, { runInDocker, runInShell } from "./taskRunHandler";
import { tagFilter } from './taskRunFilter/tagFilter';

export const defaultRegistry: TaskRunHandlerRegistry = {
  runInShell: (t: Task & DockerTask) => ({
    weight: !!t.scripts && !t.image ? 10 : 0,
    handler: runInShell,
  }),
  runInDocker: (t: Task & DockerTask) => ({
    weight: !!t.scripts && !!t.image ? 10 : 0,
    handler: runInDocker,
  }),
};

export const defaultFilterRegistry = {
  whenFilter,
  tagFilter
};

export default async <C extends Record<string, any> = Record<string, any>>(
  glob: string[],
  registries: {
    handler: TaskRunHandlerRegistry;
    filters: TaskRunFilterRegistry;
  } = {
    handler: defaultRegistry,
    filters: defaultFilterRegistry,
  },
  configs = {} as C
) => {
  const resolvedSources = await resolveGlob(glob);

  if (!resolvedSources) return null;
  for (const source of resolvedSources) {
    const pipelineConfig = await fetchMergeExpand(source, {
      configs,
      name: source
        .substring(source.lastIndexOf("/") + 1 ?? 0)
        .replace(/\.[^/.]+$/, ""),
      stages: {},
      order: [],
    } as Pipeline & { configs: C });

    const { configs: _, ...pipeline } = pipelineConfig;

    schema.validate(pipeline);

    buildPipeline({
      pipeline,
      handler: taskRunHandler(registries.handler),
    });
  }

  return {
    runPipeline,
    run: async (output: VersaOutputFactory, sequential: boolean = false) => {
      if (!sequential) {
        const promises: TaskRunHandlerResult[] = [];
        for (const pipelineName in pipelineRunnerStore.state.pipelines) {
          promises.push(
            runPipeline({ pipelineName, output, filters: registries.filters })
          );
        }
        return Promise.all(promises).then((r) => r.flat());
      }
      const results = [];
      for (const pipelineName in pipelineRunnerStore.state.pipelines) {
        results.push(
          await runPipeline({
            pipelineName,
            output,
            filters: registries.filters,
          })
        );
      }
      return results.flat();
    },
  };
};

const resolveGlob = async (glob: string[] | string) => {
  if (!glob) return null;
  if (Array.isArray(glob)) {
    return (
      await Promise.all(glob.map((g) => globby(g, { onlyFiles: true })))
    ).flat();
  }

  return globby([glob as string], { onlyFiles: true });
};
