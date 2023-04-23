import { VersaConfigBag } from "./versa-config";

export type VersaToolbox = {
  versa: {
    config: Promise<VersaConfigBag>;
  };
};
