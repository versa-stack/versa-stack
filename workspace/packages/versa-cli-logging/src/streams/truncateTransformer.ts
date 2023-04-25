import { Transform } from "stream";

interface TruncateOptions {
  lines: number;
}

export default ({ lines }: TruncateOptions) =>
  new Transform({
    transform(chunk: Buffer, encoding: string, callback: () => void) {
      const linesToKeep = chunk.toString().split("\n").slice(-lines);
      if (linesToKeep[linesToKeep.length - 1] === "") {
        linesToKeep.pop();
      }
      const truncated = linesToKeep.slice(-lines).join("\n");

      this.push(Buffer.from(truncated));
      callback();
    },
  });
