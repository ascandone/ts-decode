import { unknown } from "../../src/index";
import { expectSuccess } from "../utils";

describe("Unknown", () => {
  test("Should always succeed", () => {
    expectSuccess(unknown, ["x", 42]);
    expectSuccess(unknown, 0);
    expectSuccess(unknown, true);
    expectSuccess(unknown, null);
    expectSuccess(unknown, undefined);
  });
});
