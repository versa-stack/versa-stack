import { filesystem, system } from "gluegun";

const src = filesystem.path(__dirname, "..");

const cli = async (cmd: string) =>
  system.run("node " + filesystem.path(src, "bin", "versa-cli") + ` ${cmd}`);

test("outputs version", async () => {
  const output = await cli("--version");
  expect(output).toContain("0.4.0");
});

test("outputs help", async () => {
  const output = await cli("--help");
  expect(output).toContain("0.4.0");
});

test("outputs config", async () => {
  const output = await cli("config");
  expect(output).toContain("repository");
  expect(output).toContain("runconfig");
});

test("outputs parsable json", async () => {
  const output = JSON.parse(await cli("config --raw"));
  expect(output).not.toBeNull();
  expect(output.runconfig.pipeline).toEqual(["**/pipeline.yaml"]);
});
