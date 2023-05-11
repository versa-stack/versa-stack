import { VersaToolbox } from "@versa-stack/types";
import {
  PipelineHooks,
  VersaPipelineToolbox,
} from "@versa-stack/versa-pipeline";

import { GluegunToolbox } from "gluegun";
import { printPipelineStatus } from "../terminal/printPipelineStatus";
import { VersaLoggingToolbox } from "../model";
import { waitFor } from "../waitFor";

type Toolbox = GluegunToolbox &
  VersaPipelineToolbox &
  VersaToolbox &
  VersaLoggingToolbox;

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

  printPipelineStatus(toolbox);

  toolbox.versa.pipeline?.hooks.addHooks({
    [`${PipelineHooks.setStatus}`]: async (...args) => {
      printPipelineStatus(toolbox);
    },
  });
};
