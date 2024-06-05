export interface Ticket {
  id?: number;
  subject: string;
  description: string;
  priority?: string;
  status?: string;
  requester?: {
    name: string;
    email: string;
  };
  assignee_id?: number;
}

export interface TicketResponse {
  ticket: Ticket;
}

export interface TicketsResponse {
  tickets: Ticket[];
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UsersResponse {
  users: User[];
}
