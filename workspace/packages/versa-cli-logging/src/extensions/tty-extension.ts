import { VersaToolbox } from "@versa-stack/types";
import {
  Pipeline,
  PipelineHooks,
  TaskRunHandlerResult,
  VersaPipelineToolbox
} from "@versa-stack/versa-pipeline";

import { GluegunToolbox } from "gluegun";
import { terminal } from "terminal-kit";
import { VersaLoggingToolbox } from "../model";
import { waitFor } from "../waitFor";

type Toolbox = GluegunToolbox &
  VersaPipelineToolbox &
  VersaToolbox &
  VersaLoggingToolbox;

const tableData = (toolbox: Toolbox) => {
  if (!toolbox.versa.pipeline?.store) {
    return [];
  }

  const data: string[][] = [["Pipeline", "Stage", "Task", "Status"]];
  const store = toolbox.versa.pipeline?.store;

  Object.entries(store.state.results).forEach(([pipelineName, results]) => {
    Object.entries(store.state.results[pipelineName]).forEach(
      ([path, promise]: [string, TaskRunHandlerResult]) => {
        const pathParts = path.split(":");

        if (pathParts.length < 2) {
          return;
        }

        const [stage, task] = pathParts;

        data.push([pipelineName, stage, task, store.state.status[pipelineName][path].status]);
      }
    );
  });

  return data;
};

const tableOptions = {
  hasBorder: true,
  contentHasMarkup: true,
};

const waitForDependencies = async (toolbox: Toolbox) => {
  await waitFor(() => toolbox?.versa?.config);
  if (!toolbox?.versa?.config) {
    return;
  }

  await toolbox.versa.config;

  await waitFor(() => toolbox?.versa?.pipeline);
  if (!toolbox?.versa?.pipeline) {
    return;
  }

  await waitFor(() => toolbox?.versa?.log);
  if (!toolbox?.versa?.log) {
    return;
  }
};

export default async (toolbox: Toolbox) => {
  await waitForDependencies(toolbox);

  if (!toolbox.command && toolbox.commandName !== "run") {
    return;
  }

  drawTable(toolbox);

  toolbox.versa.pipeline?.hooks.addHooks({
    [`${PipelineHooks.setStatus}`]: async () => {
      drawTable(toolbox);
    },
  });
};

const drawTable = (toolbox: Toolbox) => {
  terminal.clear();
  terminal.table(tableData(toolbox), tableOptions);
};
