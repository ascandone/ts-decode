import { never, number, of, success } from "../src";
import { expectFail } from "./utils";
describe("Decoder", () => {
  test("decoder.map()", () => {
    const decoder = number.map((x) => x * 2);
    expect(decoder.decode(100)).toStrictEqual(success(200));
  });

  describe("decoder.andThen()", () => {
    test("success", () => {
      const decoder = number.andThen((x) => of(x * 2));
      expect(decoder.decode(100)).toStrictEqual(success(200));
    });

    test("fail", () => {
      const decoder = number.andThen(() => never("err"));
      expectFail(decoder, 42);
    });
  });

  describe("decodeString", () => {
    test("Success", () => {
      expect(number.decodeString("42")).toStrictEqual(success(42));
    });

    test("Fail", () => {
      expect(number.decodeString("__").error).toBe(true);
    });
  });
});
