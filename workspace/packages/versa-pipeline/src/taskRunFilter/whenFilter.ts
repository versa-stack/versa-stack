import { Task, TaskRunFilter, TaskRunFilterResult, WhenTask } from "../model";

const filterResult = (skip: boolean, when?: string) =>
  ({
    skip,
    msg: skip ? `skipped because "${when ?? ""}" was truhty` : "",
  } as TaskRunFilterResult);

export const whenFilter: TaskRunFilter<WhenTask & Task> = (task) => {
  const matches = /([^==|!=]+)(!=|==)(.*)/.exec(task.when as string);

  if (task.when === undefined) {
    return filterResult(false);
  }

  if (!matches && !task.when) {
    return filterResult(true, task.when);
  }

  if (
    matches &&
    !compare(matches[1].trim(), matches[2].trim(), matches[3].trim())
  ) {
    return filterResult(true, task.when);
  }

  return filterResult(false, task.when);
};

type scalarType = string | number | boolean;

const compare = (left: scalarType, operator: string, right: scalarType) =>
  ((
    {
      "==": (left, right) => left === right,
      "!=": (left, right) => left !== right,
      "<=": (left, right) => left <= right,
      "<": (left, right) => left < right,
      ">=": (left, right) => left >= right,
      ">": (left, right) => left > right,
    } as Record<string, (l: scalarType, r: scalarType) => boolean>
  )[operator](left, right));
