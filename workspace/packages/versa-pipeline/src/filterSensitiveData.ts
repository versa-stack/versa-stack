import { SensitiveParamFilter } from "@amaabca/sensitive-param-filter";

export const filterSensitiveData = (payload: any) =>
  new SensitiveParamFilter({
    filterUnknown: false,
    replacement: "*********",
  }).filter(payload);
