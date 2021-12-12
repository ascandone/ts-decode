import { number, string, tuple } from "../../src/index";
import { expectFail, expectSuccess } from "../utils";

describe("Tuple", () => {
  test("Should succeed decoding a tuple with right values and right length", () => {
    expectSuccess(tuple(string, number), ["x", 42]);
  });

  test("Should fail decoding a value with wrong type", () => {
    expectFail(tuple(string, number), 42, {
      type: "FAIL",
      reason: "Expected a 2-tuple, got 42 instead",
    });
  });

  test("Should fail decoding a tuple with wrong length", () => {
    expectFail(tuple(string, number), ["x"], {
      type: "FAIL",
      reason: 'Expected a 2-tuple, got ["x"] instead',
    });
  });

  test("Should fail decoding a tuple with wrong types", () => {
    expectFail(tuple(string, number), ["x", "not a number"], {
      type: "ARRAY",
      index: 1,
      reason: {
        type: "FAIL",
        reason: 'Expected a number, got "not a number" instead',
      },
    });
  });
});
