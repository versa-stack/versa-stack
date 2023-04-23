import {
  RunTaskPayload,
  Task,
  TaskRunHandler,
  TaskRunResult,
  TaskRunResultCodeEnum,
  WhenTask,
} from "../model";

export const whenHandler: TaskRunHandler = (
  payload: RunTaskPayload<WhenTask & Task>,
  main?: TaskRunHandler
) => {
  const { task } = payload;

  if (!main) {
    return Promise.resolve([
      {
        task,
        status: {
          code: TaskRunResultCodeEnum.SKIPPED as number,
          msg: "Skipped because no main handler was found.",
        },
      } as TaskRunResult,
    ]);
  }

  const matches = /([^==|!=]+)(!=|==)(.*)/.exec(task.when as string);
  let skip = false;

  if (!matches && !task.when) {
    skip = true;
  }

  if (
    !skip &&
    matches &&
    !compare(matches[1].trim(), matches[2].trim(), matches[3].trim())
  ) {
    skip = true;
  }

  if (skip)
    return Promise.resolve([
      {
        task,
        status: {
          msg: `Skipped due to "when" condition "${
            matches ? matches[0] : task.when
          }"`,
          code: TaskRunResultCodeEnum.SKIPPED as number,
        },
      } as TaskRunResult,
    ]);

  delete payload.task.when;

  return main(payload);
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
