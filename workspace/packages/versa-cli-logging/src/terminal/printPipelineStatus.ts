import { VersaToolbox } from "@versa-stack/types";
import {
  JobStatus,
  JobStatusEnum,
  TaskRunHandlerResult,
  VersaPipelineToolbox,
} from "@versa-stack/versa-pipeline";
import { GluegunToolbox } from "gluegun";
import { terminal } from "terminal-kit";
import { VersaLoggingToolbox } from "../model";
import { Job } from "@versa-stack/versa-pipeline";

type Toolbox = GluegunToolbox &
  VersaPipelineToolbox &
  VersaToolbox &
  VersaLoggingToolbox;

const tableOptions = {
  hasBorder: true,
  contentHasMarkup: true,
};
export const printPipelineStatus = (toolbox: Toolbox) => {
  terminal.clear();
  terminal.table(tableData(toolbox), tableOptions);
};

const tableData = (toolbox: Toolbox) => {
  if (!toolbox.versa.pipeline?.store) {
    return [];
  }

  const data: string[][] = [
    ["^KPipeline^", "^KStage^", "^KTask^", "^KStatus^", "^KOutput"],
  ];
  const store = toolbox.versa.pipeline?.store;

  Object.entries(store.state.results).forEach(([pipelineName, results]) => {
    Object.entries(store.state.results[pipelineName]).forEach(
      ([path]: [string, TaskRunHandlerResult]) => {
        const pathParts = path.split(":");

        if (pathParts.length < 2) {
          return;
        }

        const [stage, task] = pathParts;

        const jobStatus = store.state.status[pipelineName][path];
        data.push([
          `^m${pipelineName}^`,
          `^c${stage}^`,
          `${task}`,
          printStatus(jobStatus.status),
          `${printStdOut(jobStatus)}${printErrors(jobStatus)}`,
        ]);
      }
    );
  });

  return data;
};

const printStdOut = (jobStatus: JobStatus) => {
  return (jobStatus.stdout ?? "")
    .split("\n")
    .slice(-14)
    .map((line) => (line ? `^K${line}^` : ""))
    .join("\n");
};

const printErrors = (jobStatus: JobStatus) => {
  if (jobStatus.results) {
    const errorMessages = jobStatus.results
      .filter((r) => !!r.error)
      .map((result) => `^r^-${result.status.msg} (${result.error})^` ?? "");

    return errorMessages.join("\n");
  }

  return "";
};

const printStatus = (status: JobStatusEnum) => {
  if (status === JobStatusEnum.DONE) {
    return `^g${status}^`;
  }

  if (status === JobStatusEnum.RUNNING) {
    return `^[bg:blue]${status}^`;
  }

  if (status === JobStatusEnum.ERROR) {
    return `^r${status}^`;
  }

  if (status === JobStatusEnum.CANCELLED) {
    return `^y^-${status}^`;
  }

  return `^y${status}^`;
};
