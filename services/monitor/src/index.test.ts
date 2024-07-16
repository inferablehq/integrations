import { stats } from ".";

describe("index", () => {
  describe("stats", () => {
    it("should return stats", async () => {
      expect(await stats()).toEqual({
        cpu: expect.arrayContaining([expect.any(Object)]),
        memory: expect.any(Number),
        platform: expect.any(String),
        release: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });
});
