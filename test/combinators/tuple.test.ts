import { number, success, string, tuple } from "../../src/index";
import { expectSuccess } from "../utils";

describe("Tuple", () => {
  test.skip("Two elements", () => {
    expectSuccess(tuple(string, number), ["x", 42]);
  });
});
