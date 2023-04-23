import { expandConfig } from "../src";

describe("expandConfig", () => {
  it("Replaces variable values", async () => {
    const input = {
      hello: "world",
      message: "Hello ${hello}",
    };

    const expectedOutput = {
      hello: "world",
      message: "Hello world",
    };

    const output = await expandConfig(input);
    expect(output).toEqual(expectedOutput);
  });

  it("Copies array values", async () => {
    const input = {
      parts: ["hello", "world"],
      partsParsed: "${parts}",
    };

    const expectedOutput = {
      parts: ["hello", "world"],
      partsParsed: ["hello", "world"],
    };

    const output = await expandConfig(input);
    expect(output).toEqual(expectedOutput);
  });

  it("Calls javascript functions", async () => {
    const input = {
      hello: "world",
      message: "(config) => `Hello ${config.hello}`",
    };

    const expectedOutput = {
      hello: "world",
      message: "Hello world",
    };

    const output = await expandConfig(input);
    expect(output).toEqual(expectedOutput);
  });

  it("Applies filters", async () => {
    const input = {
      hello: "world",
      hello_encode: "${ hello | base64e }",
      hello_decode: "${ hello_encode | base64d }",
      hello_json: "${ 'eyJoZWxsbyI6IndvcmxkIn0=' | base64d | fromJson }",
      hello_yaml: "${ 'aGVsbG86IHdvcmxk' | base64d | fromYaml }",
      hello_file: `\${ '${__dirname}/files/local/bar.yaml' | file | fromYaml \}`,
    };

    const expectedOutput = {
      hello: "world",
      hello_encode: "d29ybGQ=",
      hello_decode: "world",
      hello_json: {
        hello: "world",
      },
      hello_yaml: {
        hello: "world",
      },
      hello_file: {
        bar: "foo",
      },
    };

    const output = await expandConfig(input);
    expect(output).toEqual(expectedOutput);
  });

  it("Handles nested properties", async () => {
    const input = {
      server: {
        host: "localhost",
        port: 8080,
        url: "${protocol}://${server.host}:${server.port}/api",
      },
      protocol: "https",
    };

    const expectedOutput = {
      server: {
        host: "localhost",
        port: 8080,
        url: "https://localhost:8080/api",
      },
      protocol: "https",
    };

    const output = await expandConfig(input);
    expect(output).toEqual(expectedOutput);
  });
});
