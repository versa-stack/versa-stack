import { VersaConfig } from "@versa-stack/types";
import Docker from "dockerode";
import { DockerTask, Task, TaskRunHandler, TaskRunResult } from "../../model";
import { runInShell } from "./runInShell";

export const runInDocker: TaskRunHandler<
  VersaConfig,
  Task & DockerTask
> = async (payload) => {
  const { task, output } = payload;
  const docker = new Docker();

  if (!task.image) {
    throw {
      message: "Cannot run in docker without image.",
      task,
    };
  }

  const volumeConfig = {
    binds: [
      `${task.workingDir}:/opt/repository`,
      `${__dirname}/scripts:/usr/local/bin/scripts`,
    ],
    volumes: {
      "/opt/repository": {},
    } as Record<string, {}>,
  };

  task.volumeBinds?.forEach((bind) => {
    volumeConfig.binds.push(bind);
    volumeConfig.volumes[bind.split(":")[0] as string] = {};
  });

  await runInShell({
    ...payload,
    task: {
      name: `${task.name}-pull-docker-image`,
      pipeline: task.pipeline,
      scripts: [`docker pull ${task.image}`],
      stage: task.stage,
      workingDir: process.cwd(),
    },
  });

  return Promise.all(
    task.scripts.map((command) =>
      docker
        .run(task.image as string, ["/bin/sh", "-c", `${command}`], output, {
          WorkingDir: task.workingDir,
          Volumes: volumeConfig?.volumes ?? [],
          Env: Object.entries(process.env).map(([k, v]) => `${k}=${v}`),
          Hostconfig: {
            Binds: volumeConfig?.binds ?? {},
          },
        })
        .then(([output, container]) => {
          container.remove();
          return [output, container];
        })
        .then(([output, container]) => {
          return {
            task,
            status: {
              code: output.StatusCode,
              msg: output.Error,
            },
            output,
            error:
              output.Error ?? output.StausCode !== 0 ? output.StatusCode : null,
            details: [[output, container]],
          } as TaskRunResult;
        })
    )
  );
};
