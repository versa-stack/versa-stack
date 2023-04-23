import { createHash } from "crypto";
import { getContentFromUriOrDocument } from "./fme/fetchConfig";
import yaml from "yaml";

export type Filter = (
  input: string,
  ...args: any[]
) => Promise<FilterParam>;

export type FilterParam = string | unknown | (unknown | string)[]

export type Filters = Record<string, Filter>;

export const filters: Filters = {
  base64d: async (input: string) =>
    Buffer.from(input, "base64").toString("utf8"),
  base64e: async (input: string) =>
    Buffer.from(input, "utf8").toString("base64"),
  sha256: async (input: string) =>
    createHash("sha256").update(input).digest("hex"),
  sha512: async (input: string) =>
    createHash("sha512").update(input).digest("hex"),
  file: async (input: string) => getContentFromUriOrDocument(input),
  fromJson: async (input: string) => JSON.parse(input),
  fromYaml: async (input: string) => yaml.parse(input),
  toJson: async (input: string) => JSON.stringify(input),
  toYaml: async (input: string) => yaml.stringify(input),
};
