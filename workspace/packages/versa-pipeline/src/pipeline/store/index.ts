import { PipelineStoreState } from "../../model";
import { createStore } from "../../store";
import actions from "./actions";
import getters from "./getters";

export const pipelineStore = createStore("pipeline", {
  state: {
    filters: {},
    jobs: {},
    pipelines: {},
    results: {},
    status: {},
    voters: {},
  } as PipelineStoreState,
  actions,
  getters,
});

