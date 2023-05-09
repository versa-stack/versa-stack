import { VersaConfig } from "@versa-stack/types";
import { execa } from "execa";
import process from "process";
import { DockerTask, Task, TaskRunHandler } from "../../model";
import * as Bluebird from 'bluebird';

export const runInShell: TaskRunHandler<VersaConfig, Task & DockerTask> = (
  payload
) => {
  const { task, output } = payload;
  return Bluebird.Promise.all(
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
          };
        })
        .catch((r) => {
          return {
            task,
            output: r,
            status: {
              code: r.exitCode,
              msg: r.shortMessage,
            },
          };
        });
    })
  );
};
