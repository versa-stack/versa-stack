import FtpSrv from "ftp-srv";
import nullLogger from "bunyan-blackhole"

export default (port: number) => {
  const ftpServer = new FtpSrv({
    url: "ftp://localhost:" + port,
    anonymous: true,
    log: nullLogger("null")
  });

  ftpServer.on("login", (_, resolve, __) =>
    resolve({ root: `${__dirname}/../files/served` })
  );

  return ftpServer;
};
