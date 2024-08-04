import { Inferable } from "inferable";
import { initialize } from "./index";

describe("initialize", () => {
  it("should initialize the zendesk service", async () => {
    const inferable = new Inferable();

    const service = await initialize(inferable, {
      ZENDESK_ADMIN_EMAIL: "1",
      ZENDESK_API_TOKEN: "2",
      ZENDESK_SUBDOMAIN: "3",
    });

    expect(service.definition.name).toBe("zendesk");
  });
});
