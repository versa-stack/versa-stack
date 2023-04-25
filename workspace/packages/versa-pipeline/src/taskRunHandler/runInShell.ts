import { execa } from "execa";
import process from "process";
import type { TaskRunHandler, TaskRunResult } from "../model";
import { RunTaskPayload } from "../model";

export const runInShell: TaskRunHandler = async (payload: RunTaskPayload) => {
  const { task, output } = payload;
  return Promise.all(
    task.scripts.map((command: string) => {
      const taskProcess = execa("/bin/bash", ["-c", command], {
        cwd: task.workingDir,
        ...(output === process.stdout
          ? {
              stdout: output,
              stderr: output,
            }
          : {}),
      });

      if (taskProcess.stdout && output != process.stdout) {
        taskProcess.stdout.on("data", (d) => output.write(d));
      }
      if (taskProcess.stderr && output != process.stdout) {
        taskProcess.stderr.on("data", (d) => output.write(d));
      }

      return taskProcess
        .then((r) => {
          return {
            task,
            output: r,
            status: {
              code: r.exitCode,
              msg: r.stdout,
            },
          } as TaskRunResult;
        })
        .catch((r) => {
          return {
            task,
            output: r,
            status: {
              code: r.exitCode,
              msg: r.shortMessage,
            },
          } as any as TaskRunResult;
        });
    })
  );
};
