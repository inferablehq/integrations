import { FunctionRegistrationInput } from "inferable/bin/types";
import { z } from "zod";

export const config: {
  source: string;
  transformer?: (
    s: FunctionRegistrationInput<any>
  ) => FunctionRegistrationInput<any>;
}[] = [
  {
    source: "CreateTicket",
  },
  { source: "ListTicketComments" },
  { source: "ListTickets" },
  { source: "ListUsers" },
  { source: "ShowComment" },
  { source: "UpdateTicket" },
  { source: "ShowTicket" },
  { source: "ShowUser" },
  { source: "PutTagsTicket" },
  { source: "ListViews" },
  { source: "ShowView" },
  {
    source: "UpdateTicket",
    transformer: (s) => {
      return {
        ...s,
        name: "AddInternalNote",
        description: "Add an internal note to a ticket",
        schema: {
          input: {
            ...s.schema.input,
            properties: {
              ticket_id: s.schema.input.properties.ticket_id,
              ticket: {
                type: "object",
                properties: {
                  comment: {
                    type: "object",
                    properties: {
                      body: {
                        type: "string",
                        description: "The body of the comment",
                      },
                      public: {
                        type: "boolean",
                        description:
                          "Whether the comment is public. Must be false",
                        const: false,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
    },
  },
  {
    source: "ListSearchResults",
    transformer: (s) => {
      return {
        ...s,
        name: "SearchResolvedTickets",
        description: "Search resolved tickets",
        schema: {
          input: {
            ...s.schema.input,
            properties: {
              query: {
                ...s.schema.input.properties.query,
                description:
                  "The search query. Must be like 'type:ticket status:closed <query>'",
              },
              sorty_by: {
                ...s.schema.input.properties.sorty_by,
                description: "The sort order. Must be like 'updated_at'",
              },
              sort_order: {
                ...s.schema.input.properties.sort_order,
                description: "The sort order. Must be like 'desc'",
              },
            },
          },
        },
      };
    },
  },
];

export const transform = (s: FunctionRegistrationInput<any>[]) => {
  return config.map((m) => {
    const f = s.find((f) => f.name === m.source);

    if (!f) {
      throw new Error(`Function ${m.source} not found`);
    }

    if (!m.transformer) {
      return f;
    } else {
      return m.transformer(f);
    }
  });
};
