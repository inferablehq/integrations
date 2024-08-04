import monitor from "../services/monitor/src/index";
import zendesk from "../services/zendesk/src/index";

import { Inferable } from "inferable";
import test from "node:test";
import assert from "node:assert";

const inferable = new Inferable({
  apiSecret: process.env.INFERABLE_API_SECRET,
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
