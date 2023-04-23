import * as ip from "ip";
import * as os from "os";

export interface HostInfo {
  ip: string;
  hostname: string;
  platform: string;
  arch: string;
}

export default (): HostInfo => ({
  ip: ip.address(),
  hostname: os.hostname(),
  platform: os.platform(),
  arch: os.arch()
});
