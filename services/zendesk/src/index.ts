import { Inferable, fromOpenAPI } from "inferable";
import path from "path";
import { z } from "zod";

const TicketCreatedType = "zendesk.ticket.created";
const pkg = require(path.join(__dirname, "..", "package.json"));

export const configSchema = z.object({
  ZENDESK_ADMIN_EMAIL: z
    .string()
    .describe("The email address of the Zendesk admin who owns the API token"),
  ZENDESK_API_TOKEN: z
    .string()
    .describe(
      "The API token for the Zendesk account created at https://inferable.zendesk.com/admin/apps-integrations/apis/zendesk-api/"
    ),
  ZENDESK_SUBDOMAIN: z
    .string()
    .describe("The subdomain of the Zendesk account")
    .regex(/^[a-z0-9]+$/),
});

export const initialize = async (
  inferable: Inferable,
  env = configSchema.parse(process.env)
) => {
  const authHeader = `Basic ${Buffer.from(
    `${env.ZENDESK_ADMIN_EMAIL}/token:${env.ZENDESK_API_TOKEN}`
  ).toString("base64")}`;

  const functions = await fromOpenAPI({
    schema: path.join(__dirname, "oas.yaml"),
    baseUrl: `https://${env.ZENDESK_SUBDOMAIN}.zendesk.com`,
    axiosDefaultConfig: {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
    },
  });

  const service = inferable.service({
    name: "zendesk",
    functions: functions,
  });

  return service;
};

export default {
  type: "inferable-integration",
  name: pkg.name,
  version: pkg.version,
  initialize,
};
