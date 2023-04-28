import LEP from "logical-expression-parser";
import { TaskRunFilter, TaskRunFilterResult } from "../../model";

export const tagFilter: TaskRunFilter = (payload) => {
  const { tags } = payload.task;
  const { tagsExpr } = payload.options;
  if (!tagsExpr) {
    return { skip: false };
  }

  return filterResult(
    !LEP.parse(`always|(${tagsExpr})`, (t) => (tags ?? []).includes(t)),
    tags ?? [] as string[],
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
