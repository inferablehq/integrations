import axios from "axios";
import dotenv from "dotenv";
import {
  Ticket,
  TicketResponse,
  TicketsResponse,
  UsersResponse,
} from "./types";
import { Inferable } from "inferable";
import { z } from "zod";

dotenv.config();

const {
  ZENDESK_DOMAIN,
  ZENDESK_EMAIL,
  ZENDESK_API_TOKEN,
  INFERABLE_API_SECRET,
} = process.env;

if (!ZENDESK_DOMAIN) {
  throw new Error("ZENDESK_DOMAIN is required");
}

if (!ZENDESK_EMAIL) {
  throw new Error("ZENDESK_EMAIL is required");
}

if (!ZENDESK_API_TOKEN) {
  throw new Error("ZENDESK_API_TOKEN is required");
}

if (!INFERABLE_API_SECRET) {
  throw new Error("INFERABLE_API_SECRET is required");
}

const zendeskAPI = axios.create({
  baseURL: `https://${ZENDESK_DOMAIN}.zendesk.com/api/v2`,
  auth: {
    username: `${ZENDESK_EMAIL}/token`,
    password: ZENDESK_API_TOKEN!,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export class InferableClient {
  async createTicket(ticket: Ticket): Promise<TicketResponse> {
    const response = await zendeskAPI.post<TicketResponse>("/tickets", {
      ticket,
    });
    return response.data;
  }

  async getTickets(): Promise<TicketsResponse> {
    const response = await zendeskAPI.get<TicketsResponse>("/tickets");
    return response.data;
  }

  async getTicketById(id: number): Promise<TicketResponse> {
    const response = await zendeskAPI.get<TicketResponse>(`/tickets/${id}`);
    return response.data;
  }

  async updateTicket(
    id: number,
    updates: Partial<Ticket>
  ): Promise<TicketResponse> {
    const response = await zendeskAPI.put<TicketResponse>(`/tickets/${id}`, {
      ticket: updates,
    });
    return response.data;
  }

  async deleteTicket(id: number): Promise<void> {
    await zendeskAPI.delete(`/tickets/${id}`);
  }

  async getUsers(): Promise<UsersResponse> {
    const response = await zendeskAPI.get<UsersResponse>("/users");
    return response.data;
  }

  async assignTicket(
    ticketId: number,
    assigneeId: number
  ): Promise<TicketResponse> {
    const response = await this.updateTicket(ticketId, {
      assignee_id: assigneeId,
    });
    return response;
  }

  async prioritizeTicket(
    ticketId: number,
    priority: string
  ): Promise<TicketResponse> {
    const response = await this.updateTicket(ticketId, { priority });
    return response;
  }
}

const client = new Inferable({
  apiSecret: INFERABLE_API_SECRET,
});

const zendeskService = client.service({ name: "zendeskService" });

const inferableClient = new InferableClient();

// Register the createTicket function
zendeskService.register({
  name: "createTicket",
  schema: {
    input: z.object({
      subject: z.string(),
      description: z.string(),
      requesterName: z.string(),
      requesterEmail: z.string(),
    }),
  },
  func: async (input: {
    subject: string;
    description: string;
    requesterName: string;
    requesterEmail: string;
  }) => {
    const ticket = {
      subject: input.subject,
      description: input.description,
      requester: {
        name: input.requesterName,
        email: input.requesterEmail,
      },
    };
    return await inferableClient.createTicket(ticket);
  },
});

// Register the getTickets function
zendeskService.register({
  name: "getTickets",
  schema: {
    input: z.object({}),
  },
  func: async () => {
    return await inferableClient.getTickets();
  },
});

// Register the getTicketById function
zendeskService.register({
  name: "getTicketById",
  schema: {
    input: z.object({
      id: z.number(),
    }),
  },
  func: async (input: { id: number }) => {
    return await inferableClient.getTicketById(input.id);
  },
});

// Register the updateTicket function
zendeskService.register({
  name: "updateTicket",
  schema: {
    input: z.object({
      id: z.number(),
      updates: z.object({
        subject: z.string().optional(),
        description: z.string().optional(),
        priority: z.string().optional(),
        status: z.string().optional(),
        requester: z
          .object({
            name: z.string(),
            email: z.string(),
          })
          .optional(),
      }),
    }),
  },
  func: async (input: {
    id: number;
    updates: Partial<{
      subject: string;
      description: string;
      priority: string;
      status: string;
      requester: { name: string; email: string };
    }>;
  }) => {
    return await inferableClient.updateTicket(input.id, input.updates);
  },
});

// Register the deleteTicket function
zendeskService.register({
  name: "deleteTicket",
  schema: {
    input: z.object({
      id: z.number(),
    }),
  },
  func: async (input: { id: number }) => {
    return await inferableClient.deleteTicket(input.id);
  },
});

// Register the getUsers function
zendeskService.register({
  name: "getUsers",
  schema: {
    input: z.object({}),
  },
  func: async () => {
    return await inferableClient.getUsers();
  },
});

// Register the assignTicket function
zendeskService.register({
  name: "assignTicket",
  schema: {
    input: z.object({
      ticketId: z.number(),
      assigneeId: z.number(),
    }),
  },
  func: async (input: { ticketId: number; assigneeId: number }) => {
    return await inferableClient.assignTicket(input.ticketId, input.assigneeId);
  },
});

// Register the prioritizeTicket function
zendeskService.register({
  name: "prioritizeTicket",
  schema: {
    input: z.object({
      ticketId: z.number(),
      priority: z.string(),
    }),
  },
  func: async (input: { ticketId: number; priority: string }) => {
    return await inferableClient.prioritizeTicket(
      input.ticketId,
      input.priority
    );
  },
});

export default zendeskService;
