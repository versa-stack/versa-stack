import { AddressInfo } from "net";
import fetchConfig from "../src/fme/fetchConfig";
import mockHttp from "./mocks/http-server";
import { DynamicConfig } from "../src";

describe("It parses yaml and merges it with path or uri imports.", () => {
  let httpPort = 8080;

  beforeAll((done) => {
    mockHttp.listen(() => {
      httpPort = (mockHttp.address() as AddressInfo).port;
      done();
    });
  });

  afterAll(() => {
    mockHttp.close();
  });

  test("It should parse plain yaml.", async () => {
    const input = `foo: bar`;
    const output = await fetchConfig(input, {});

    expect(output).toHaveProperty("foo", "bar");
  });

  test("It should parse local yaml files.", async () => {
    const input = "./tests/files/local/foo.yaml";
    const output = await fetchConfig(input, {});

    expect(output).toHaveProperty("foo", "bar");
    expect(output).toHaveProperty("bar", "foo");
  });

  test("It should allow for dynamic imports.", async () => {
    const input = "./tests/files/local/foo-dynamic.yaml";
    const output = await fetchConfig(input, { foo: "bar" });

    expect(output).not.toHaveProperty("foo", "bar");
    expect(output).toHaveProperty("bar", "foo");
  });

  test("It should parse a remote yaml file's content.", async () => {
    const input = `http://127.0.0.1:${httpPort}/foz.yaml`;
    const output = await fetchConfig(input, {});

    expect(output).toHaveProperty("foo", "bar");
    expect(output).toHaveProperty("bar", "foo");
  });

  test("It should mix remote with local content.", async () => {
    const input = `./tests/files/local/foo-with-remote.yaml`;
    const output = await fetchConfig(input, {
      port: httpPort,
    } as DynamicConfig);

    expect(output).toHaveProperty("foo", "bar");
    expect(output).toHaveProperty("bar", "foo");
    expect(output).toHaveProperty("some_list");
    expect(output.some_list).toHaveLength(6);
  });
});
