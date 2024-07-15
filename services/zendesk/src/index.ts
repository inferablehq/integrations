import { Inferable } from "inferable";
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

const config = configSchema.parse(process.env);

const zendeskError = z.object({
  error: z.object({
    title: z.string(),
    message: z.string(),
  }),
});

const TicketSchema = z.object({
  id: z.number().int(),
  subject: z.string(),
  description: z.string().nullable(),
  priority: z.string().nullable(),
  status: z.string(),
  requester_id: z.number().int(),
  assignee_id: z.number().int().nullable(),
  tags: z.array(z.string()).nullable(),
  created_at: z.string().datetime(), // ISO 8601 format
  updated_at: z.string().datetime().nullable(), // ISO 8601 format
});

const TicketCommentSchema = z.array(
  z.object({
    plain_body: z.string(),
    created_at: z.string().datetime(),
    author_id: z.number().int(),
  })
);

const SearchResultsSchema = z.object({
  count: z.number().int(),
  facets: z.any(),
  next_page: z.any(),
  previous_page: z.any(),
  results: z.array(TicketSchema),
});

const defaultHeaders = {
  "Content-Type": "application/json",
  Authorization: `Basic ${Buffer.from(
    `${config.ZENDESK_ADMIN_EMAIL}/token:${config.ZENDESK_API_TOKEN}`
  ).toString("base64")}`,
  Accept: "application/json",
};

const baseUrl = `https://${config.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2`;

export const getTicket = async ({ ticketId }: { ticketId: string }) => {
  const response = await fetch(`${baseUrl}/tickets/${ticketId}`, {
    headers: defaultHeaders,
    method: "GET",
  });

  if (response.status !== 200) {
    throw new Error(`Failed to get ticket: ${response.status}`);
  }

  const data: any = await response.json();

  const ticket = TicketSchema.parse(data.ticket);

  return ticket;
};

export const canAccessZendesk = async () => {
  const response = await fetch(`${baseUrl}/tickets.json?limit=1`, {
    headers: defaultHeaders,
    method: "GET",
  });

  return {
    accessible: response.status === 200,
    status: response.status,
    body: await response.json(),
  };
};

export const getAllTicketComments = async ({
  ticketId,
}: {
  ticketId: string;
}) => {
  const response = await fetch(`${baseUrl}/tickets/${ticketId}/comments`, {
    headers: defaultHeaders,
    method: "GET",
  });

  if (response.status !== 200) {
    throw new Error(`Failed to get ticket comments: ${response.status}`);
  }

  const data: any = await response.json();

  const comments = TicketCommentSchema.parse(data.comments);

  return comments.map((c) => ({
    plain_body: c.plain_body,
    created_at: c.created_at,
    author_id: c.author_id,
  }));
};

export const addInternalNoteToTicket = async ({
  ticketId,
  note,
}: {
  ticketId: string;
  note: string;
}) => {
  const response = await fetch(`${baseUrl}/tickets/${ticketId}`, {
    headers: defaultHeaders,
    method: "PUT",
    body: JSON.stringify({
      ticket: {
        comment: {
          body: note,
          public: false,
        },
      },
    }),
  });

  if (response.status !== 200) {
    throw new Error(
      `Failed to add internal note to ticket: ${response.status}`
    );
  }

  const data = await response.json();

  return data;
};

export const searchHelpCenter = async ({ query }: { query: string }) => {
  const response = await fetch(
    `${baseUrl}/guide/search?query=${encodeURIComponent(query)}`,
    {
      headers: defaultHeaders,
      method: "GET",
    }
  );

  if (response.status !== 200) {
    throw new Error(`Failed to search articles: ${response.status}`);
  }

  const data = await response.json();

  return data;
};

export const searchResolvedTickets = async ({ query }: { query: string }) => {
  const searchQuery = `query=${encodeURIComponent(
    query
  )} type:ticket status:solved&sort_by:updated_at&sort_order:desc`;

  console.log(searchQuery);

  const response = await fetch(`${baseUrl}/search.json?${searchQuery}`, {
    headers: defaultHeaders,
    method: "GET",
  });

  if (response.status !== 200) {
    const body = await response.json();

    const error = zendeskError.safeParse(body);

    if (error.success) {
      throw new Error(`${error.data.error.title}: ${error.data.error.message}`);
    } else {
      throw new Error(`Failed to search tickets: ${response.status}`);
    }
  }

  const data = await response.json();

  return SearchResultsSchema.parse(data);
};

export const getHelpCenterSections = async () => {
  const response = await fetch(`${baseUrl}/help_center/sections`, {
    headers: defaultHeaders,
    method: "GET",
  });

  if (response.status !== 200) {
    throw new Error(`Failed to get help center sections: ${response.status}`);
  }

  const data = await response.json();

  return data;
};

export const createDraftHelpCenterArticle = async ({
  sectionId,
  title,
  body,
  permissionGroupId,
}: {
  sectionId: string;
  title: string;
  body: string;

  permissionGroupId: string;
}) => {
  const response = await fetch(
    `${baseUrl}/help_center/sections/${sectionId}/articles`,
    {
      headers: defaultHeaders,
      method: "POST",
      body: JSON.stringify({
        article: {
          title,
          body,
          draft: true,
          user_segment_id: null,
          permission_group_id: permissionGroupId,
        },
      }),
    }
  );

  if (response.status !== 201) {
    throw new Error(`Failed to create article: ${response.status}`);
  }

  const data = await response.json();

  return data;
};

const getHelpCenterPermissionGroups = async () => {
  const response = await fetch(`${baseUrl}/guide/permission_groups`, {
    headers: defaultHeaders,
    method: "GET",
  });

  if (response.status !== 200) {
    throw new Error(
      `Failed to get help center permission groups: ${response.status}`
    );
  }

  const data = await response.json();

  return data;
};

export const functions = [
  {
    name: "addInternalNoteToTicket",
    func: addInternalNoteToTicket,
    description: "Add an internal note to a Zendesk ticket",
    schema: z.object({
      ticketId: z.number().describe("The ID of the ticket"),
      note: z.string().describe("The private note to add to the ticket"),
    }),
  },
  {
    name: "getTicket",
    func: getTicket,
    description: "Get a Zendesk ticket",
    schema: z.object({
      ticketId: z.number().describe("The ID of the ticket"),
    }),
  },
  {
    name: "searchHelpCenter",
    func: searchHelpCenter,
    description: "Search articles in the Zendesk help center",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  },
  {
    name: "searchResolvedTickets",
    func: searchResolvedTickets,
    description: "Search previously resolved Zendesk tickets",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  },
  {
    name: "getAllTicketComments",
    func: getAllTicketComments,
    description: "Get all comments for a Zendesk ticket",
    schema: z.object({
      ticketId: z.number().describe("The ID of the ticket"),
    }),
  },
  {
    name: "getHelpCenterSections",
    func: getHelpCenterSections,
    description: "Get all sections in the Zendesk help center",
    schema: z.object({}),
  },
  {
    name: "createDraftHelpCenterArticle",
    func: createDraftHelpCenterArticle,
    description: "Create a draft article in the Zendesk help center",
    schema: z.object({
      sectionId: z.number().int().describe("The ID of the section"),
      title: z.string().describe("The title of the article"),
      body: z.string().describe("The body of the article"),
      permissionGroupId: z
        .number()
        .int()
        .describe("The ID of the permission group"),
    }),
  },
  {
    name: "getHelpCenterPermissionGroups",
    func: getHelpCenterPermissionGroups,
    description: "Get all permission groups in the Zendesk help center",
    schema: z.object({}),
  },
];

export const webhooks = [
  {
    type: TicketCreatedType,
    handler: async () => {
      throw new Error("Not implemented");
    },
  },
];

export const setup = async () => {
  const { accessible, body, status } = await canAccessZendesk();

  if (!accessible) {
    throw new Error(
      `Unable to access Zendesk with the provided credentials: status=${status}`
    );
  }

  return {};
};

export const teardown = async () => {};

export const initialize = (inferable: Inferable) => {
  console.log(`${pkg.name}@${pkg.version}`);

  const service = inferable.service({
    name: pkg.name.replace("@inferable/", ""),
  });

  for (const { name, func, description, schema } of functions) {
    service.register({
      func,
      name,
      schema: { input: schema } as any,
    });
  }

  return service;
};

export default {
  type: "inferable-integration",
  name: pkg.name,
  version: pkg.version,
  initialize,
  setup,
  teardown,
};
