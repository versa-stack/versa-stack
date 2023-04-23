import { DynamicConfig } from "..";
import deepmerge from "deepmerge";
import jsonpath from "jsonpath";
import path from "path";
import { parse } from "yaml";
import {
  fetchFile,
  supportedSchemes,
  validateUriOrPath,
} from "../transport/fetchFile";
import validateUrl from "../transport/validateUrl";

const fetchConfig = async <L extends DynamicConfig, D extends Partial<L> = L>(
  uriOrDocument: string,
  lookupConfig: L
) =>
  getContentFromUriOrDocument(uriOrDocument)
    .then((raw) => parse(raw) as D)
    .then(async (document) =>
      document?.imports
        ? await processImports<L, D>(document, uriOrDocument, lookupConfig)
        : document || {}
    );

export const getContentFromUriOrDocument = async (uriOrDocument: string) =>
  validateUriOrPath(uriOrDocument)
    ? fetchFile(uriOrDocument).then((r) => r || "")
    : uriOrDocument;

const processImports = async <
  L extends DynamicConfig,
  D extends Partial<L> = L
>(
  document: D,
  base: string,
  lookupConfig: L
) => {
  if (!document.imports) {
    return document;
  }

  const isBaseUrlValid = validateUrl(base, supportedSchemes);
  const imports = expandImports(document.imports.reverse(), lookupConfig);
  delete document.imports;

  for (let fileToImport of imports) {
    const isImportValidUrl = validateUrl(fileToImport, supportedSchemes);

    if (!isImportValidUrl && !isBaseUrlValid) {
      fileToImport = path.resolve(path.dirname(base), fileToImport);
    }

    if (!isImportValidUrl && isBaseUrlValid) {
      fileToImport = new URL(fileToImport, base).toString();
    }

    document = await fetchConfig<L, D>(fileToImport, lookupConfig).then(
      (imported) => deepmerge(document, imported) as unknown as D
    );
  }
  return document;
};

const expandImports = (imports: string[], lookupConfig: any) =>
  imports.map((i) => {
    const matches = /(?<!\\)\$\{([^}]+)\}/.exec(i);

    if (matches && matches[1]) {
      return i.replace(
        `\${${matches[1]}}`,
        jsonpath.query(lookupConfig, matches[1]) as any
      );
    }

    return i;
  });

export default fetchConfig;
