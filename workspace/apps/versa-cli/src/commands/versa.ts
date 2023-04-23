import { GluegunCommand } from "gluegun";

const command: GluegunCommand = {
  name: "versa",
  run: async (toolbox) => {
    const { print } = toolbox;
    print.printHelp(toolbox);
  },
};

module.exports = command;
