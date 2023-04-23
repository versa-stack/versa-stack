import { VersaConfig, VersaToolbox } from "@versa-stack/types";
import {
  VersaPipelineToolbox,
  pipelineRunnerStore,
} from "@versa-stack/versa-pipeline";
import { GluegunToolbox } from "gluegun";
import { waitFor } from "../utilities";

export default async (
  toolbox: GluegunToolbox & VersaToolbox & VersaPipelineToolbox
) => {
  const { configs } = (await toolbox.versa?.config) || {
    configs: {} as VersaConfig,
  };
  if (!configs?.runconfig.pipeline) return;
  waitFor(() => toolbox.versa);
  if (!toolbox.versa) {
    return;
  }

  toolbox.versa.pipeline = {
    store: pipelineRunnerStore.getters,
    hooks: pipelineRunnerStore.hooks,
  };
};
