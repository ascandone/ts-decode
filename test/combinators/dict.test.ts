import { text } from "stream/consumers";
import { number, dict } from "../../src/index";
import { assert, shouldFail, shouldPass, typeChecking } from "../TestHelpers";
import { expectFail, expectSuccess } from "../utils";

describe("Dict", () => {
  const dec = dict(number);

  test("Should succeed decoding an object of right values", () => {
    expectSuccess(dec, {});
    expectSuccess(dec, { x: 42 });
  });

  test("Should fail decoding an object of wrong values", () => {
    expectFail(dec, { x: "not a num" });
  });

  test("Should fail decoding a value of wrong type", () => {
    expectFail(dec, "should be an object", {
      type: "FAIL",
      reason: 'Expected an object, got "should be an object" instead',
    });
  });
});
