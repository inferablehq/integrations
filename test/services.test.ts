import monitor from "../services/monitor/src/index";
import zendesk from "../services/zendesk/src/index";

import { Inferable } from "inferable";
import test from "node:test";
import assert from "node:assert";

const inferable = new Inferable({
  apiSecret:
    "sk_a510800ed2d431342e896c3aefb810f0b8057deddef889e1b59d5b3eddbbec2b",
});

test("zendesk", async (t) => {
  const svc = await zendesk.initialize(inferable, {
    ZENDESK_ADMIN_EMAIL: "1",
    ZENDESK_API_TOKEN: "2",
    ZENDESK_SUBDOMAIN: "3",
  });

  await svc.start();

  assert.equal(svc.definition.name, "zendesk");
});

test("monitor", async (t) => {
  const svc = await monitor.initialize(inferable);

  await svc.start();

  assert.equal(svc.definition.name, "monitor");
});
