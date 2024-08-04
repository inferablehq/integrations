import { Inferable, fromGraphQL } from "inferable";
import { z } from "zod";
import path from "path";

import { openPullRequests } from "./operations";

export const configSchema = z.object({
  GITHUB_TOKEN: z
    .string()
    .describe("The GitHub token used to authenticate with the GitHub API")
});

const pkg = require(path.join(__dirname, "..", "package.json"));

export const initialize = (inferable: Inferable, env = process.env) => {
  const config = configSchema.parse(process.env);

  const service = inferable.service({
    name: pkg.name.replace("@inferable/", ""),
    functions: fromGraphQL({
      schema: path.resolve(__dirname, "./schema.graphql"),
      operations: [
        openPullRequests
      ],
      baseUrl: "https://api.github.com",
      axiosDefaultConfig: {
        headers: {
          Authorization: `bearer ${config.GITHUB_TOKEN}`,
        }
      }
    }),
  });


  return service;
};

export default {
  type: "inferable-integration",
  name: pkg.name,
  version: pkg.version,
  initialize,
  setup: async () => {},
  teardown: async () => {},
};
