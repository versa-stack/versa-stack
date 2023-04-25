import { VersaToolbox } from "@versa-stack/types";
import { VersaPipelineToolbox } from "@versa-stack/versa-pipeline";
import bunyan from "bunyan";
import bformat from "bunyan-format";
import { GluegunToolbox } from "gluegun";
import { VersaLoggingToolbox } from "../model";
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
  const { runconfig } = configs;
  const formatStream = bformat({
    outputMode: runconfig?.outputMode ?? "simple",
    color: true,
    levelInString: true,
  });

  toolbox.versa.log = bunyan.createLogger({
    ...defaultLoggerOptions,
    stream: formatStream,
    ...(runconfig?.loggerOptions ?? {}),
  });
};
