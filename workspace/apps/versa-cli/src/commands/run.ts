import { VersaConfig, VersaToolbox } from "@versa-stack/types";
import createPipeline, {
  VersaPipelineToolbox,
  defaultFilterRegistry,
  defaultRegistry,
} from "@versa-stack/versa-pipeline";
import { GluegunToolbox } from "gluegun";
import { waitFor } from "../utilities";

export default {
  name: "run",
  description: "runs pipeline by their glob",
  alias: "r",
  run: async (
    toolbox: GluegunToolbox & VersaPipelineToolbox & VersaToolbox
  ) => {
    const { versa } = toolbox;
    const { options } = toolbox.parameters;
    const { p, pipeline } = toolbox.parameters.options;
    const { configs } = (await versa?.config) || { configs: {} as VersaConfig };

    await waitFor(() => versa.pipeline, {
      maxWaitSeconds: 5,
      waitMs: 10,
    });

    if (!versa.pipeline) {
      return;
    }

    if (!versa.pipeline?.output) {
      versa.pipeline.output = () => {
        return process.stdout;
      };
    }

    const additionalHandlers = versa?.pipeline.handlers ?? {};
    const glob = p ?? pipeline ?? configs.runconfig.pipeline;

    const runner = await createPipeline(
      typeof glob === "string" ? [glob] : glob,
      {
        handler: {
          ...defaultRegistry,
          ...additionalHandlers,
        },
        filters: {
          ...defaultFilterRegistry,
        },
      },
      configs
    );

    if (!runner) {
      return;
    }

    await runner
      .run(versa.pipeline.output, options.s || options.sequential)
      .then(() => {});
  },
};
