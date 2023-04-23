import { URL, parse } from "url";

export default (input: string, protocols: string[]) => {
  try {
    new URL(input);
    const parsed = parse(input);
    return protocols
      ? parsed.protocol
        ? protocols.map((x) => `${x.toLowerCase()}:`).includes(parsed.protocol)
        : false
      : true;
  } catch (err) {
    return false;
  }
};
