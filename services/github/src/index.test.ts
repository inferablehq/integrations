import { Inferable } from "inferable";
import { initialize } from "./index";

describe("initialize", () => {
  it("should initialize the Github service", async () => {
    const inferable = new Inferable();

    const service = initialize(inferable, {
      GITHUB_TOKEN: "1",
    });

    expect(service.definition.name).toBe("github");
  });
});
