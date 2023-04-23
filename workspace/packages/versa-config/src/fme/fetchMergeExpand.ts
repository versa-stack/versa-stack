import { DynamicConfig } from "..";
import deepmerge from "deepmerge";
import expandConfig from "./expandConfig";
import fetchConfig from "./fetchConfig";

export const fetchExpand = async <
  L extends DynamicConfig,
  D extends Partial<L> = L,
  R extends Partial<L & D> = L & D
>(
  uri: string,
  lookup: L
) => expandConfig<D, R>(await fetchConfig<L, D>(uri, lookup));

export const fetchMergeExpand = async <
  L extends DynamicConfig,
  D extends Partial<L> = L,
  R extends Partial<L & D> = L & D
>(
  uri: string,
  lookup: L
) => mergeExpand<L, D, R>(await fetchConfig<L, D>(uri, lookup), lookup);

export const mergeExpand = <
  L extends DynamicConfig,
  D extends Partial<L> = L,
  R extends Partial<L & D> = L & D
>(
  document: D,
  lookup: L
) => expandConfig<R>(deepmerge(lookup, document) as unknown as R);
