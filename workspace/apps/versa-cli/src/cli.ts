import { build } from "gluegun";
import { Options } from "gluegun/build/types/domain/options";
import versaCommand from "./commands/versa";

/**
 * Create the cli and kick it off
 */
export const run = async (argv: string | Options) => {
  // create a CLI runtime
  const cli = build()
    .brand("versa")
    .src(__dirname)
    .plugins(`${__dirname}/../node_modules/@versa-stack`, {
      matching: "versa-cli-*",
      hidden: true,
    })
    .defaultCommand(versaCommand)
    .help() // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    .create();
  const toolbox = await cli.run(argv);

  // send it back (for testing, mostly)
  return toolbox;
};
