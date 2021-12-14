import { never, number, succeed, unknown } from "../src";
import { expectFail, expectSuccess } from "./utils";

describe("Decoder", () => {
  test("decoder.map()", () => {
    const decoder = number.map((x) => x * 2);
    expect(decoder.decode(100)).toStrictEqual({
      error: false,
      value: 200,
    });
  });

  describe("decoder.andThen()", () => {
    test("success", () => {
      const decoder = number.andThen((x) => succeed(x * 2));
      expect(decoder.decode(100)).toStrictEqual({
        error: false,
        value: 200,
      });
    });

    test("fail", () => {
      const decoder = number.andThen(() => never("err"));
      expectFail(decoder, 42, { type: "FAIL", reason: "err" });
    });

    test("fail 2", () => {
      const decoder = number.andThen(() => never("err"));
      expectFail(decoder, "42");
    });
  });

  describe("decoder.decodeString", () => {
    test("Success", () => {
      expect(number.decodeString("42")).toStrictEqual({
        error: false,
        value: 42,
      });
    });

    test("Fail", () => {
      expect(number.decodeString("__").error).toBe(true);
    });
  });

  describe("decoder.decodeUnsafeThrow()", () => {
    test("Should succeed when type is right", () => {
      expect(number.decodeUnsafeThrow(42)).toBe(42);
    });

    test("Should throw when type is wrong", () => {
      expect(() => number.decodeUnsafeThrow("not a number")).toThrow();
    });
  });

  describe("andThen + unknown", () => {
    test("Should allow new decoders", () => {
      const bigint = unknown.andThen((x) =>
        typeof x === "bigint"
          ? succeed(x)
          : never(`expected a bigint, got ${x} instead`),
      );

      expectSuccess(bigint, BigInt(100));
      expectFail(bigint, 42, {
        type: "FAIL",
        reason: "expected a bigint, got 42 instead",
      });
    });
  });
});
