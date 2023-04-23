import Docker from "dockerode";
import * as os from "os";
import {
  DockerTask,
  RunTaskPayload,
  Task,
  TaskRunHandler,
  TaskRunResult,
} from "../model";
import { runInShell } from "./runInShell";

export const runInDocker: TaskRunHandler = async (
  payload: RunTaskPayload<Task & Partial<DockerTask>>
) => {
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
      // `${__dirname}/scripts:/usr/local/bin/scripts`,
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
    output,
    task: {
      name: "docker-pull-task-image",
      pipeline: task.pipeline,
      scripts: [`docker pull ${task.image}`],
      stage: task.stage,
      workingDir: process.cwd(),
    },
  } as RunTaskPayload);

  const userinfo = task.user
    ? {
        ...task.user,
        gid: task.user.gid ?? task.user.uid,
      }
    : os.userInfo();

  const addUser =
    userinfo.uid === 0
      ? ``
      : `/usr/local/bin/script/adduser.sh ${userinfo.username} ${userinfo.uid} ${userinfo.gid} && su -s /bin/sh ${userinfo.username} -c`;

  return Promise.all(
    task.scripts.map((command) =>
      docker
        .run(
          task.image as string,
          ["/bin/sh", "-c", `${addUser}${command}`],
          output,
          {
            WorkingDir: task.workingDir,
            Volumes: volumeConfig?.volumes ?? [],
            Env: Object.entries(process.env).map(([k, v]) => `${k}=${v}`),
            Hostconfig: {
              Binds: volumeConfig?.binds ?? {},
            },
          }
        )
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
            error: output.Error,
            details: [[output, container]],
          } as TaskRunResult;
        })
    )
  );
};
