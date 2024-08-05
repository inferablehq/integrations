import { Inferable } from "inferable";
import zendesk from "./index";

(function main() {
  const inferable = new Inferable();

  return zendesk.initialize(inferable).then((s) => s.start());
})();
