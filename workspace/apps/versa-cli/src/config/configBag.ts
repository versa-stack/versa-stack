import { VersaConfig, VersaConfigBag } from "@versa-stack/types";
import {
  fetchConfig,
  fetchMergeExpand,
  mergeExpand,
} from "@versa-stack/versa-config";
import * as fs from "fs";
import hostinfo from "./hostinfo";

const loadRunConfig = async (rcPath: string) =>
  (configBag.configs.runconfig = fs.existsSync(rcPath)
    ? await fetchMergeExpand(rcPath, configBag.configs.runconfig)
    : configBag.configs.runconfig);

const loadRepositoryConfig = async (basePath: string) =>
  (configBag.configs = fs.existsSync(
    `${basePath}/${configBag.configs.runconfig.configPath}`
  )
    ? await mergeExpand<VersaConfig>({ ...configBag.configs }, {
        repository: await fetchConfig(
          `${basePath}/${configBag.configs.runconfig.configPath}`,
          configBag.configs.runconfig
        ),
      } as any as VersaConfig)
    : configBag.configs);

export const loadConfigBag = async (rcPath: string, basePath: string) => {
  await loadRunConfig(rcPath);
  await loadRepositoryConfig(basePath);
  return configBag;
};

export const configBag: VersaConfigBag = {
  configs: {
    runconfig: {
      pipeline: ["**/pipeline.yaml"],
      configPath: ".versa",
      env: process.env,
      hostinfo: hostinfo(),
    },
    repository: {
      workingDir: process.cwd(),
    },
  },
};
