import getUri from "get-uri";
import path from "path";
import validateUrl from "./validateUrl";

export const supportedSchemes = ["http", "https", "file", "data", "ftp"];
export const validateUriOrPath = (input: string) =>
  /^(?:(?:[A-Za-z]+:)?\/\/)?(?:[\w.-]+(?::[\w.-]+)?(?:@[\w.-]+(?:\.[\w.-]+)*|localhost)?(?::\d+)?)?(?:\/[\w._-]+)*(?:\??[\w_-]+(?:=[\w_-]+)?(?:&[\w_-]+(?:=[\w_-]+)?)*)?(?:#[\w_-]+)?$/.test(
    input
  );

export const validatePath = (path: string) => {
  const filePathRegex = /^\/?(?:(?:[\w\.-]+)\/)*[\w\.-]+$/;
  return filePathRegex.test(path);
};

export const fetchFile = async (uri: string) => {
  const isUriValid = validateUrl(uri, supportedSchemes);
  const filePathTest = validatePath(uri);

  if (!isUriValid && filePathTest) {
    uri = `file://${path.resolve(uri)}`;
  }

  if (!isUriValid && !filePathTest) {
    return;
  }

  return getUri(uri).then((res) => streamToString(res));
};

const streamToString = async (stream: any) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
};
