import { fetchMergeExpand } from "@versa-stack/versa-config";
import globby from "globby";
import {
  DockerTask,
  Pipeline,
  RunTaskPayloadOptions,
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
import { tagFilter } from "./taskRunFilter/tagFilter";
import { whenFilter } from "./taskRunFilter/whenFilter";
import taskRunHandler, { runInDocker, runInShell } from "./taskRunHandler";

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
  tagFilter,
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
  configs = {} as C,
  options: RunTaskPayloadOptions = defaultRunOptions
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
      options,
    });
  }

  return {
    runPipeline,
    run: async (
      output: VersaOutputFactory,
      options: RunTaskPayloadOptions = defaultRunOptions
    ) =>
      options.sequential
        ? await runSync(output, registries.filters, options)
        : runAsync(output, registries.filters, options),
  };
};

const runAsync = async (
  output: VersaOutputFactory,
  filters: TaskRunFilterRegistry,
  options: RunTaskPayloadOptions
) => {
  const promises: TaskRunHandlerResult[] = [];
  for (const pipelineName in pipelineRunnerStore.state.pipelines) {
    promises.push(
      runPipeline({
        pipelineName,
        output,
        filters,
        ...options,
      })
    );
  }
  return Promise.all(promises).then((r) => r.flat());
};

const runSync = async (
  output: VersaOutputFactory,
  filters: TaskRunFilterRegistry,
  options: RunTaskPayloadOptions
) => {
  const results = [];
  for (const pipelineName in pipelineRunnerStore.state.pipelines) {
    results.push(
      await runPipeline({
        pipelineName,
        output,
        filters,
        ...options,
      })
    );
  }
  return results.flat();
};

export const defaultRunOptions = {
  sequential: false,
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
