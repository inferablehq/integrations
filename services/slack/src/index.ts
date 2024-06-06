import axios from "axios";
import dotenv from "dotenv";
import { Inferable } from "inferable";
import { z } from "zod";

dotenv.config();

const { SLACK_TOKEN, INFERABLE_API_SECRET } = process.env;

if (!SLACK_TOKEN) {
  throw new Error("SLACK_TOKEN is required");
}

if (!INFERABLE_API_SECRET) {
  throw new Error("INFERABLE_API_SECRET is required");
}

const slackAPI = axios.create({
  baseURL: "https://slack.com/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SLACK_TOKEN}`,
  },
});

export class SlackClient {
  async sendMessage(channelId: string, text: string): Promise<any> {
    const response = await slackAPI.post("/chat.postMessage", {
      channel: channelId,
      text,
    });
    return response.data;
  }

  async getChannelInfo(channelId: string): Promise<any> {
    const response = await slackAPI.get("/conversations.info", {
      params: { channel: channelId },
    });
    return response.data;
  }

  async listChannels(): Promise<any> {
    const response = await slackAPI.get("/conversations.list");
    return response.data;
  }

  async searchChannels(query: string): Promise<any> {
    const response = await slackAPI.get("/search.all", {
      params: { query, type: "channels" },
    });
    return response.data;
  }

  async getUserInfo(userId: string): Promise<any> {
    const response = await slackAPI.get("/users.info", {
      params: { user: userId },
    });
    return response.data;
  }

  async searchUserByEmail(email: string): Promise<any> {
    const response = await slackAPI.get("/users.lookupByEmail", {
      params: { email },
    });
    return response.data;
  }

  async searchUserByName(name: string): Promise<any> {
    const response = await slackAPI.get("/users.list");
    const users = response.data.members;
    return users.filter((user: any) =>
      user.profile.real_name.toLowerCase().includes(name.toLowerCase())
    );
  }

  async searchMessageHistory(query: string): Promise<any> {
    const response = await slackAPI.get("/search.messages", {
      params: { query, count: 10, sort: "relevance" },
    });
    return response.data;
  }
}

const client = new Inferable({
  apiSecret: INFERABLE_API_SECRET,
});

const slackService = client.service({ name: "slackService" });

const slackClient = new SlackClient();

// Register the sendMessage function
slackService.register({
  name: "sendMessage",
  schema: {
    input: z.object({
      channelId: z.string(),
      text: z.string(),
    }),
  },
  func: async (input: { channelId: string; text: string }) => {
    return await slackClient.sendMessage(input.channelId, input.text);
  },
});

// Register the getChannelInfo function
slackService.register({
  name: "getChannelInfo",
  schema: {
    input: z.object({
      channelId: z.string(),
    }),
  },
  func: async (input: { channelId: string }) => {
    return await slackClient.getChannelInfo(input.channelId);
  },
});

// Register the listChannels function
slackService.register({
  name: "listChannels",
  schema: {
    input: z.object({}),
  },
  func: async () => {
    return await slackClient.listChannels();
  },
});

// Register the searchChannels function
slackService.register({
  name: "searchChannels",
  schema: {
    input: z.object({
      query: z.string(),
    }),
  },
  func: async (input: { query: string }) => {
    return await slackClient.searchChannels(input.query);
  },
});

// Register the getUserInfo function
slackService.register({
  name: "getUserInfo",
  schema: {
    input: z.object({
      userId: z.string(),
    }),
  },
  func: async (input: { userId: string }) => {
    return await slackClient.getUserInfo(input.userId);
  },
});

// Register the searchUserByEmail function
slackService.register({
  name: "searchUserByEmail",
  schema: {
    input: z.object({
      email: z.string().email(),
    }),
  },
  func: async (input: { email: string }) => {
    return await slackClient.searchUserByEmail(input.email);
  },
});

// Register the searchUserByName function
slackService.register({
  name: "searchUserByName",
  schema: {
    input: z.object({
      name: z.string(),
    }),
  },
  func: async (input: { name: string }) => {
    return await slackClient.searchUserByName(input.name);
  },
});

// Register the searchMessageHistory function
slackService.register({
  name: "searchMessageHistory",
  schema: {
    input: z.object({
      query: z.string(),
    }),
  },
  func: async (input: { query: string }) => {
    return await slackClient.searchMessageHistory(input.query);
  },
});

export default slackService;
