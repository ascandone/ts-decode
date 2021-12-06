import { boolean, number, string } from "../../src";
import { expectFail, expectSuccess } from "../utils";

describe("Primitives", () => {
  test("Number", () => {
    expect(number.decode(0).error).toBe(false);

    expect(number.decode("0").error).toBe(true);
    expect(number.decode(null).error).toBe(true);
    expect(number.decode([]).error).toBe(true);
    expect(number.decode({}).error).toBe(true);
  });

  test("String", () => {
    expectSuccess(string, "str");

    expectFail(string, null);
    expectFail(string, 42);
    expectFail(string, []);
    expectFail(string, {});
  });

  test("Boolean", () => {
    expectSuccess(boolean, true);
    expectSuccess(boolean, false);

    expectFail(boolean, null);
    expectFail(boolean, 42);
    expectFail(boolean, []);
    expectFail(boolean, {});
  });
});
