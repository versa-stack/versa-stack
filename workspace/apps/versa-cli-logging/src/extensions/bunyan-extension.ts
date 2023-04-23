import { VersaToolbox } from "@versa-stack/types";
import { VersaPipelineToolbox } from "@versa-stack/versa-pipeline";
import bunyan from "bunyan";
import { GluegunToolbox } from "gluegun";
import { LoggerRunConfig, VersaLoggingToolbox } from "../model";
import { waitFor } from "./logging-extension";

const defaultLoggerOptions: bunyan.LoggerOptions = {
  name: "versa-cli",
};

export default async (
  toolbox: GluegunToolbox &
    VersaPipelineToolbox &
    VersaToolbox &
    VersaLoggingToolbox
) => {
  await waitFor(() => toolbox?.versa?.config);
  if (!toolbox.versa?.config) {
    return;
  }
  const { configs } = await toolbox.versa.config;
  const { runconfig } = configs as { runconfig?: LoggerRunConfig };

  toolbox.versa.log = bunyan.createLogger(
    runconfig?.loggerOptions ?? defaultLoggerOptions
  );
};
