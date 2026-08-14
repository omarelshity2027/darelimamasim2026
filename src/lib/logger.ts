type Level = "info" | "warn" | "error";

const queue: Array<{ level: Level; message: string; meta?: unknown }> = [];
let flushing = false;

function flush() {
  flushing = true;
  while (queue.length > 0) {
    const entry = queue.shift()!;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level: entry.level,
      msg: entry.message,
      meta: entry.meta === undefined ? undefined : entry.meta,
    });
    if (entry.level === "error") console.error(line);
    else if (entry.level === "warn") console.warn(line);
    else console.log(line);
  }
  flushing = false;
}

function log(level: Level, message: string, meta?: unknown) {
  queue.push({ level, message, meta });
  if (!flushing) setImmediate(flush);
}

export const logger = {
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
};
