import { number, unknown, string, tuple } from "../../src/index";
import { expectFail, expectSuccess } from "../utils";

describe("Unknown", () => {
  test("Should always succeed", () => {
    expectSuccess(unknown, ["x", 42]);
    expectSuccess(unknown, 0);
    expectSuccess(unknown, true);
    expectSuccess(unknown, null);
    expectSuccess(unknown, undefined);
  });
});
