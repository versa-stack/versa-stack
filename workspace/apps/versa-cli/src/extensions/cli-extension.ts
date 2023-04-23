import { VersaToolbox } from "@versa-stack/types";
import { GluegunToolbox } from "gluegun";
import { loadConfigBag } from "../config";

export default async (toolbox: GluegunToolbox & VersaToolbox) => {
  const config = loadConfigBag(`${process.cwd()}/.versarc`, process.cwd());
  toolbox.versa = {
    ...(toolbox.versa ?? {}),
    config,
  };
};
