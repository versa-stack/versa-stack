export * from "./fme";
export type DynamicConfig = {
  imports?: string[];
} & Record<string, any>;
