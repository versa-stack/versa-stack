import { TaskRunFilterResult } from "../../model";
import { pipelineStore } from "../store";
import { tagFilter } from "./tagFilter";
import { whenFilter } from "./whenFilter";

export const applyFilters = (payload: any) =>
  Object.values(pipelineStore.state.filters).reduce<TaskRunFilterResult>(
    (previous, current) => {
      if (previous.skip) {
        return previous;
      }
      return current(payload);
    },
    { skip: false }
  );

export { tagFilter, whenFilter };

export const defaultTaskRunFilterRecord = {
  whenFilter,
  tagFilter,
};
