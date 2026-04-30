import pino, { type Logger } from "pino";

export const logger: Logger = pino({
  browser: {
    asObject: true,
  },
  level:
    import.meta.env.MODE === "test"
      ? "silent"
      : import.meta.env.PROD
        ? "warn"
        : "debug",
});
