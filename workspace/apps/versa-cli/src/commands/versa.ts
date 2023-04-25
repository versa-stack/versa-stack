import { GluegunCommand } from "gluegun";

export default {
  name: "versa",
  hidden: true,
  run: async (toolbox) => {
    const { print } = toolbox;
    print.printHelp(toolbox);
  },
} as GluegunCommand;
