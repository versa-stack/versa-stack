import jsonpath from "jsonpath";
import { parse, stringify } from "yaml";
import { FilterParam, filters } from "../filters";

const expressionTest =
  /(\((?:[^)]*)\)\s*=>\s*(?:\{(?:.*?)\}|[^;]*))|(\$(\[|\{)[^}]+(\}|\]))/;

export default async <
  D extends Record<string, any> = Record<string, any>,
  R extends Partial<D> = D
>(
  config: Partial<D>
) => {
  if (!config) {
    return {} as R;
  }

  let configString = stringify(config);
  const maxIterations = Math.pow(Object.values(config).length, 2);
  let iteration = 0;

  while (expressionTest.test(configString) && maxIterations > iteration) {
    ++iteration;
    const parsedConfig = parse(configString);
    const ephemeralConfig = await recurseEphemeralConfig(
      parsedConfig,
      parsedConfig
    );
    configString = stringify(ephemeralConfig);
  }

  return parse(configString) as R;
};

const recurseEphemeralConfig = async (
  ephemeralConfig: Record<string, any>,
  parent: any
) => {
  if (!ephemeralConfig) {
    return;
  }

  for (const key in ephemeralConfig) {
    const entry = ephemeralConfig[key];
    if (typeof entry === "object") {
      ephemeralConfig[key] = await recurseEphemeralConfig(entry, parent);
      continue;
    }

    const entryMatches = expressionTest.exec(entry);

    if (!entryMatches) {
      continue;
    }

    const { path, filters, source } = getReplacementParams(
      entryMatches[1] ?? entryMatches[2],
      !!entryMatches[1]
    );
    const replaceValue = await filters(getReplaceValueFor(path, parent));

    ephemeralConfig[key] = ["string", "number", "boolean"].includes(
      typeof replaceValue
    )
      ? entry.replace(source, replaceValue)
      : replaceValue;
  }

  return ephemeralConfig;
};

const getReplacementParams = (source: string, isFunction: boolean) => {
  if (!isFunction && source.indexOf("|") !== -1) {
    const parts = source
      .slice(2, -1)
      .split("|")
      .map((e) => e.trim());

    return {
      source,
      path: parts.shift() as string,
      filters: async (input: string) => {
        let returnValue: FilterParam = input;
        for (const filter of parts) {
          returnValue = await filters[filter](returnValue as string);
          if (typeof returnValue !== "string") {
            break;
          }
        }

        return returnValue;
      },
    };
  }

  return {
    path: isFunction ? source : source.slice(2, -1),
    filters: async (i: string) => i as FilterParam,
    source,
  };
};

const stringIsFunction = (input: string) => {
  try {
    return typeof eval(input) === "function";
  } catch (e) {
    return false;
  }
};

export const getReplaceValueFor = (
  path: string,
  document: Record<string, any>
) => {
  const literalMatches = stringIsLiteral(path);
  if (literalMatches) {
    return literalMatches.groups?.content as string;
  }

  if (stringIsFunction(path)) {
    return evalFunction(path, document);
  }

  if (isArrayPath(path)) {
    return jsonpath.query(document, path);
  }

  return jsonpath.value(document, path);
};

const stringIsLiteral = (input: string) =>
  /(['"])(?<content>[^"']+)\1/.exec(input);

const evalFunction = (configFunction: string, document: Record<string, any>) =>
  ((func: (config: Record<string, any>) => any) =>
    typeof func !== "function"
      ? configFunction
      : func.call({ ...filters }, document))(eval(configFunction));

const isArrayPath = (path: string) => {
  return /\[[*?]|[?([]/.test(path);
};
