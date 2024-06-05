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
exports.InferableClient = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const inferable_1 = require("inferable");
const zod_1 = require("zod");
dotenv_1.default.config();
const { ZENDESK_DOMAIN, ZENDESK_EMAIL, ZENDESK_API_TOKEN, INFERABLE_API_SECRET, } = process.env;
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
const zendeskAPI = axios_1.default.create({
    baseURL: `https://${ZENDESK_DOMAIN}.zendesk.com/api/v2`,
    auth: {
        username: `${ZENDESK_EMAIL}/token`,
        password: ZENDESK_API_TOKEN,
    },
    headers: {
        "Content-Type": "application/json",
    },
});
class InferableClient {
    createTicket(ticket) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield zendeskAPI.post("/tickets", {
                ticket,
            });
            return response.data;
        });
    }
    getTickets() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield zendeskAPI.get("/tickets");
            return response.data;
        });
    }
    getTicketById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield zendeskAPI.get(`/tickets/${id}`);
            return response.data;
        });
    }
    updateTicket(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield zendeskAPI.put(`/tickets/${id}`, {
                ticket: updates,
            });
            return response.data;
        });
    }
    deleteTicket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield zendeskAPI.delete(`/tickets/${id}`);
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield zendeskAPI.get("/users");
            return response.data;
        });
    }
    assignTicket(ticketId, assigneeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.updateTicket(ticketId, {
                assignee_id: assigneeId,
            });
            return response;
        });
    }
    prioritizeTicket(ticketId, priority) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.updateTicket(ticketId, { priority });
            return response;
        });
    }
}
exports.InferableClient = InferableClient;
const client = new inferable_1.Inferable({
    apiSecret: INFERABLE_API_SECRET,
});
const zendeskService = client.service({ name: "zendeskService" });
const inferableClient = new InferableClient();
// Register the createTicket function
zendeskService.register({
    name: "createTicket",
    schema: {
        input: zod_1.z.object({
            subject: zod_1.z.string(),
            description: zod_1.z.string(),
            requesterName: zod_1.z.string(),
            requesterEmail: zod_1.z.string(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        const ticket = {
            subject: input.subject,
            description: input.description,
            requester: {
                name: input.requesterName,
                email: input.requesterEmail,
            },
        };
        return yield inferableClient.createTicket(ticket);
    }),
});
// Register the getTickets function
zendeskService.register({
    name: "getTickets",
    schema: {
        input: zod_1.z.object({}),
    },
    func: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield inferableClient.getTickets();
    }),
});
// Register the getTicketById function
zendeskService.register({
    name: "getTicketById",
    schema: {
        input: zod_1.z.object({
            id: zod_1.z.number(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield inferableClient.getTicketById(input.id);
    }),
});
// Register the updateTicket function
zendeskService.register({
    name: "updateTicket",
    schema: {
        input: zod_1.z.object({
            id: zod_1.z.number(),
            updates: zod_1.z.object({
                subject: zod_1.z.string().optional(),
                description: zod_1.z.string().optional(),
                priority: zod_1.z.string().optional(),
                status: zod_1.z.string().optional(),
                requester: zod_1.z
                    .object({
                    name: zod_1.z.string(),
                    email: zod_1.z.string(),
                })
                    .optional(),
            }),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield inferableClient.updateTicket(input.id, input.updates);
    }),
});
// Register the deleteTicket function
zendeskService.register({
    name: "deleteTicket",
    schema: {
        input: zod_1.z.object({
            id: zod_1.z.number(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield inferableClient.deleteTicket(input.id);
    }),
});
// Register the getUsers function
zendeskService.register({
    name: "getUsers",
    schema: {
        input: zod_1.z.object({}),
    },
    func: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield inferableClient.getUsers();
    }),
});
// Register the assignTicket function
zendeskService.register({
    name: "assignTicket",
    schema: {
        input: zod_1.z.object({
            ticketId: zod_1.z.number(),
            assigneeId: zod_1.z.number(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield inferableClient.assignTicket(input.ticketId, input.assigneeId);
    }),
});
// Register the prioritizeTicket function
zendeskService.register({
    name: "prioritizeTicket",
    schema: {
        input: zod_1.z.object({
            ticketId: zod_1.z.number(),
            priority: zod_1.z.string(),
        }),
    },
    func: (input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield inferableClient.prioritizeTicket(input.ticketId, input.priority);
    }),
});
exports.default = zendeskService;
