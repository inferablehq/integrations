import { Inferable } from "inferable";
import index, { searchResolvedTickets } from "./index";

describe("Zendesk", () => {
  const { name, type, version, initialize, setup } = index;

  it("should be able to set up with a valid config", async () => {
    expect(setup()).resolves.not.toThrow();
  });

  it("should print metadata", () => {
    expect(name).toBe("@inferable/zendesk");
    expect(type).toBe("inferable-integration");
    expect(version).toBe(require("../package.json").version);
  });

  it("should return a service", () => {
    const inferable = new Inferable({
      apiSecret: process.env.INFERABLE_API_SECRET!,
    });

    const service = initialize(inferable);

    expect(service.definition).toStrictEqual({
      name: "zendesk",
    });
  });

  describe("functions", () => {
    it("searchResolvedTickets", async () => {
      const ticket = await searchResolvedTickets({ query: "hello" });

      expect(ticket.results[0].id).toBeDefined();
    });
  });
});
