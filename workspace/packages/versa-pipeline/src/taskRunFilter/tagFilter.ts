import LEP from "logical-expression-parser";
import { TaggedTask, Task, TaskRunFilter, TaskRunFilterResult } from "../model";

export const tagFilter: TaskRunFilter<Task & TaggedTask> = (payload) => {
  const { tags } = payload.task;
  const tagsExpr = payload.options?.tags;
  if (!tagsExpr) {
    return { skip: false };
  }

  return filterResult(
    !LEP.parse(`(${tagsExpr}|always)`, (t) => (tags ?? ["always"]).includes(t)),
    tags ?? ["always"],
    tagsExpr
  );
};

const filterResult = (skip: boolean, tags: string[], expr: string) =>
  ({
    skip,
    msg: skip
      ? `skipped because "${expr ?? ""}" did not match tags "${tags.join(
          ", "
        )}"`
      : "",
  } as TaskRunFilterResult);
