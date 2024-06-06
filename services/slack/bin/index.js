"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackClient = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const inferable_1 = require("inferable");
const zod_1 = require("zod");
dotenv_1.default.config();
const { SLACK_TOKEN, INFERABLE_API_SECRET } = process.env;
if (!SLACK_TOKEN) {
    throw new Error("SLACK_TOKEN is required");
}
if (!INFERABLE_API_SECRET) {
    throw new Error("INFERABLE_API_SECRET is required");
}
const slackAPI = axios_1.default.create({
    baseURL: "https://slack.com/api",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SLACK_TOKEN}`,
    },
});
class SlackClient {
    sendMessage(channelId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield slackAPI.post("/chat.postMessage", {
                channel: channelId,
                text,
            });
            return response.data;
        });
    }
    getChannelInfo(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield slackAPI.get("/conversations.info", {
                params: { channel: channelId },
            });
            return response.data;
        });
    }
    listChannels() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield slackAPI.get("/conversations.list");
            return response.data;
        });
    }
    searchChannels(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield slackAPI.get("/search.all", {
                params: { query, type: "channels" },
            });
            return response.data;
        });
    }
    getUserInfo(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield slackAPI.get("/users.info", {
                params: { user: userId },
            });
            return response.data;
        });
    }
    searchUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield slackAPI.get("/users.lookupByEmail", {
                params: { email },
            });
            return response.data;
        });
    }
    searchUserByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield slackAPI.get("/users.list");
            const users = response.data.members;
            return users.filter((user) => user.profile.real_name.toLowerCase().includes(name.toLowerCase()));
        });
    }
    searchMessageHistory(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield slackAPI.get("/search.messages", {
                params: { query, count: 10, sort: "relevance" },
            });
            return response.data;
        });
    }
}
exports.SlackClient = SlackClient;
const client = new inferable_1.Inferable({
    apiSecret: INFERABLE_API_SECRET,
});
const slackService = client.service({ name: "slackService" });
const slackClient = new SlackClient();
// Register the sendMessage function
slackService.register({
    name: "sendMessage",
    schema: {
        input: zod_1.z.object({
            channelId: zod_1.z.string(),
            text: zod_1.z.string(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield slackClient.sendMessage(input.channelId, input.text);
    }),
});
// Register the getChannelInfo function
slackService.register({
    name: "getChannelInfo",
    schema: {
        input: zod_1.z.object({
            channelId: zod_1.z.string(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield slackClient.getChannelInfo(input.channelId);
    }),
});
// Register the listChannels function
slackService.register({
    name: "listChannels",
    schema: {
        input: zod_1.z.object({}),
    },
    func: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield slackClient.listChannels();
    }),
});
// Register the searchChannels function
slackService.register({
    name: "searchChannels",
    schema: {
        input: zod_1.z.object({
            query: zod_1.z.string(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield slackClient.searchChannels(input.query);
    }),
});
// Register the getUserInfo function
slackService.register({
    name: "getUserInfo",
    schema: {
        input: zod_1.z.object({
            userId: zod_1.z.string(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield slackClient.getUserInfo(input.userId);
    }),
});
// Register the searchUserByEmail function
slackService.register({
    name: "searchUserByEmail",
    schema: {
        input: zod_1.z.object({
            email: zod_1.z.string().email(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield slackClient.searchUserByEmail(input.email);
    }),
});
// Register the searchUserByName function
slackService.register({
    name: "searchUserByName",
    schema: {
        input: zod_1.z.object({
            name: zod_1.z.string(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield slackClient.searchUserByName(input.name);
    }),
});
// Register the searchMessageHistory function
slackService.register({
    name: "searchMessageHistory",
    schema: {
        input: zod_1.z.object({
            query: zod_1.z.string(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield slackClient.searchMessageHistory(input.query);
    }),
});
exports.default = slackService;
