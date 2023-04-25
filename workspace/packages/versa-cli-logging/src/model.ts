import bunyan, { LoggerOptions } from "bunyan";

export type VersaLoggingToolbox = {
  versa: {
    log: bunyan;
  };
};

export type LoggerRunConfig = {
  loggerOptions?: LoggerOptions;
};
