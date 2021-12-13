import {
  number,
  string,
  Decoder,
  undefined_,
  object,
  oneOf,
  null_,
} from "../../src/index";
import { expectFail, expectSuccess } from "../utils";

describe("Object", () => {
  test("Failures", () => {
    const dec = object({
      x: number.required,
    });

    expect(dec.decode(0).error).toBe(true);

    expect(dec.decode("0").error).toBe(true);
    expect(dec.decode(null).error).toBe(true);
    expect(dec.decode({}).error).toBe(true);

    expect(dec.decode(["1", "2"]).error).toBe(true);
  });

  test("Success", () => {
    const dec = object({
      x: number.required,
      y: string.optional,
    });

    expectSuccess(dec, {
      x: 42,
    });

    expectSuccess(dec, {
      x: 42,
      y: "str",
    });

    expect(
      dec.decode({
        x: "hi",
      }).error,
    ).toBe(true);

    expect(
      dec.decode({
        x: 42,
        y: 10,
      }).error,
    ).toBe(true);
  });
});

describe("Nil", () => {
  test("`required` field", () => {
    const dec = object({ x: string.required });

    expectSuccess(dec, { x: "str" });
    expectFail(dec, { x: 42 });
    expectFail(dec, { x: undefined });
    expectFail(dec, { x: null });
    expectFail(dec, {});
  });

  test("`optional` field", () => {
    const dec = object({ x: string.optional });

    expectSuccess(dec, { x: "str" });
    expectFail(dec, { x: 42 });
    expectFail(dec, { x: undefined });
    expectFail(dec, { x: null });
    expectSuccess(dec, {});
  });

  test("`default` field", () => {
    const dec = object({ x: string.default("") });

    expectSuccess(dec, { x: "str" });
    expectFail(dec, { x: 42 });
    expectFail(dec, { x: undefined });
    expectFail(dec, { x: null });
    expect(dec.decode({})).toEqual({
      error: false,
      value: { x: "" },
    });
  });

  test("`default` field does not mutate input", () => {
    const dec = object({ x: string.default("") });

    const o = {};
    const ret = dec.decodeUnsafeThrow(o);

    expect((o as any).x).toBe(undefined);
  });

  test("nullable `required` field", () => {
    const dec = object({
      x: oneOf(string, undefined_).required,
    });

    expectSuccess(dec, { x: "str" });
    expectFail(dec, { x: 42 });
    expectSuccess(dec, { x: undefined });
    expectFail(dec, { x: null });
    expectFail(dec, {});
  });

  test("nil field field", () => {
    const nil = <T>(decoder: Decoder<T>) =>
      oneOf(decoder, undefined_, null_).optional;

    const dec = object({ x: nil(string) });

    expectSuccess(dec, { x: "str" });
    expectFail(dec, { x: 42 });
    expectSuccess(dec, { x: undefined });
    expectSuccess(dec, { x: null });
    expectSuccess(dec, {});
  });
});
