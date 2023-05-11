import { VersaConfig, VersaToolbox } from "@versa-stack/types";
import {
  RunPipelineOptions,
  VersaPipelineToolbox,
  createPipeline,
  defaultTaskRunFilterRecord,
  defaultTaskRunVoterRecord,
  pipelineStore,
  stdOutStream,
} from "@versa-stack/versa-pipeline";
import { GluegunToolbox } from "gluegun";
import { Toolbox } from "gluegun/build/types/domain/toolbox";
import { waitFor } from "../utilities";

export default {
  name: "run",
  description: "runs pipeline by their glob",
  alias: "r",
  run: async (
    toolbox: GluegunToolbox & VersaPipelineToolbox & VersaToolbox & Toolbox
  ) => {
    const { versa } = toolbox;
    const { options } = toolbox.parameters;
    const { p, pipeline, t, tags, s, sequential } = options;
    const { configs } = (await versa?.config) || { configs: {} as VersaConfig };

    await waitFor(() => versa.pipeline, {
      maxWaitSeconds: 60,
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

    const additionalVoters = versa?.pipeline.voters ?? {};
    const additionalFilters = versa?.pipeline.filters ?? {};
    const glob: string | string[] =
      (p ?? pipeline)?.trim() ?? configs.runconfig.pipeline;
    const pipelineOptions = {
      sequential: s || sequential,
      tagsExpr: t || tags,
    } as RunPipelineOptions;

    versa.pipeline.store.actions.setVoters({
      ...defaultTaskRunVoterRecord,
      ...additionalVoters,
    });

    versa.pipeline.store.actions.setFilters({
      ...defaultTaskRunFilterRecord,
      ...additionalFilters,
    });

    const versaPipeline = await createPipeline({
      config: configs,
      glob,
    });

    if (!versaPipeline) {
      throw new Error(
        `No pipelines found in "${
          typeof glob === "string" ? glob : glob.join(", ")
        }"`
      );
    }

    await versaPipeline?.runAll({
      config: configs,
      options: pipelineOptions,
      output: stdOutStream(versa.pipeline?.output ?? (() => process.stdout)),
    });
  },
};
