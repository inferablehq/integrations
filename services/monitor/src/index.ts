import { Inferable } from "inferable";
import path from "path";
import { z } from "zod";
import os from "os";

const pkg = require(path.join(__dirname, "..", "package.json"));

async function live() {
  return true;
}

export async function stats() {
  return {
    cpu: os.cpus(),
    memory: os.totalmem(),
    platform: os.platform(),
    release: os.release(),
    uptime: os.uptime(),
  };
}

export const teardown = async () => {};

export const initialize = (inferable: Inferable, env = process.env) => {
  const service = inferable.service({
    name: pkg.name.replace("@inferable/", ""),
  });

  service.register({
    name: "live",
    func: live,
    schema: {
      input: z.object({}),
    },
  });

  service.register({
    name: "stats",
    func: stats,
    schema: {
      input: z.object({}),
    },
  });

  return service;
};

export default {
  type: "inferable-integration",
  name: pkg.name,
  version: pkg.version,
  initialize,
  setup: async () => {},
  teardown,
};
