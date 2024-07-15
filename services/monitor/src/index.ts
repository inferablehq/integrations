import { Inferable } from "inferable";
import path from "path";

const pkg = require(path.join(__dirname, "..", "package.json"));

async function live() {
  return true;
}

export const teardown = async () => {};

export const initialize = (inferable: Inferable, env = process.env) => {
  const service = inferable.service({
    name: pkg.name.replace("@inferable/", ""),
  });

  service.register;

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
