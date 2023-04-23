import { VersaConfigBag, VersaToolbox } from "@versa-stack/types";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import * as util from "util";
import { waitFor } from "../utilities";

const command: GluegunCommand = {
  name: "config",
  description: "prints expanded configuration",
  alias: "c",
  run: async (toolbox: GluegunToolbox & Partial<VersaToolbox>) => {
    const { parameters, versa } = toolbox;
    await waitFor(() => versa?.config);
    if (!versa?.config) {
      return;
    }

    const versaConfig = versa?.config
      ? await versa.config
      : ({ configs: {} } as VersaConfigBag);

    if (parameters.options.raw || parameters.options.r) {
      console.log(JSON.stringify(versaConfig.configs));
      return;
    }

    console.log(
      util.inspect(versaConfig.configs, {
        showHidden: false,
        depth: null,
        colors: true,
      })
    );
  },
};

module.exports = command;
