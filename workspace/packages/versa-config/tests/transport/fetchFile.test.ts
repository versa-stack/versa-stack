import { AddressInfo } from "net";
import { fetchFile } from "../../src/transport/fetchFile";
import createMockFtp from "../mocks/ftp-server";
import mockHttp from "../mocks/http-server";
import mockHttps from "../mocks/https-server";

describe("fetchFile", () => {
  let httpPort = 8080;
  let httpsPort = 8443;
  let ftpPort = 2121;

  const mockFtp = createMockFtp(ftpPort);

  const uriMap = (scheme: string) =>
    ({
      http: `http://127.0.0.1:${httpPort}/file.txt`,
      https: `https://localhost:${httpsPort}/file.txt`,
      file: `file://${__dirname}/../files/served/file.txt`,
      data: `data://text/plain;base64,ZXhhbXBsZSBjb250ZW50`,
      ftp: `ftp://localhost:${ftpPort}/file.txt`,
    }[scheme] || "");

  beforeAll((done) => {
    mockHttps.listen(() => {
      httpsPort = (mockHttps.address() as AddressInfo).port;
      mockHttp.listen(() => {
        httpPort = (mockHttp.address() as AddressInfo).port;
        mockFtp.listen().then(() => {
          done();
        });
      });
    });
  });

  afterAll(() => {
    mockHttp.close();
    mockFtp.close();
    mockHttps.close();
  });

  it.each(["http"])("should fetch file from valid URL", async (scheme) => {
    const fileUri = uriMap(scheme);
    const result = await fetchFile(fileUri);
    expect(typeof result).toBe("string");
    expect(result).toContain("example content");
  });

  it("should return undefined if it is not a valid URL or local file path", async () => {
    const fileUri = "invalid-protocol://example.com/file.txt";
    const result = await fetchFile(fileUri);
    expect(result).toBeUndefined();
  });
});
