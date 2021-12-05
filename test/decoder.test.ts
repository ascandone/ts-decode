import {
  number,
  string,
  array,
  Decoder,
  undefined_,
  object,
  oneOf,
  lazy,
  hardcoded,
  dict,
  success,
  null_,
  Infer,
} from "../src/index";
import { assert, shouldFail, shouldPass, typeChecking } from "./TestHelpers";

describe("Primitives", () => {
  test("Number", () => {
    expect(number.decode(0).error).toBe(false);

    expect(number.decode("0").error).toBe(true);
    expect(number.decode(null).error).toBe(true);
    expect(number.decode([]).error).toBe(true);
    expect(number.decode({}).error).toBe(true);
  });

  test("String", () => {
    expect(string.decode("str").error).toBe(false);

    expect(string.decode(null).error).toBe(true);
    expect(string.decode(42).error).toBe(true);
    expect(string.decode([]).error).toBe(true);
    expect(string.decode({}).error).toBe(true);
  });
});

describe("Array", () => {
  test("Failures", () => {
    expect(array(number).decode(0).error).toBe(true);
    expect(array(number).decode("0").error).toBe(true);
    expect(array(number).decode(null).error).toBe(true);
    expect(array(number).decode({}).error).toBe(true);

    expect(array(number).decode(["1", "2"]).error).toBe(true);
  });

  test("Success", () => {
    expectSuccess(array(number), []);
    expectSuccess(array(string), []);

    expectSuccess(array(number), [1, 2, 3]);
  });
});

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
      }).error
    ).toBe(true);

    expect(
      dec.decode({
        x: 42,
        y: 10,
      }).error
    ).toBe(true);
  });
});

describe("oneOf", () => {
  test("primitives", () => {
    const dec = oneOf(string, undefined_);

    type Test1 = assert<
      [
        typeChecking<Infer<typeof dec>, string | undefined, shouldPass>,
        typeChecking<typeof dec, Decoder<string | undefined>, shouldPass>
      ]
    >;

    expectSuccess(dec, "Hello");
    // expectSuccess(dec, undefined);

    expect(dec.decode(null).error).toBe(true);
  });
});

test("Lazy", () => {
  type Tree = {
    label: string;
    subTree: Tree[];
  };

  const treeDecoder: Decoder<Tree> = object({
    label: string.required,
    subTree: lazy(() => array(treeDecoder)).default([]),
  });

  expect(
    treeDecoder.decodeUnsafeThrow({
      label: "a",
    })
  ).toEqual({
    label: "a",
    subTree: [],
  });
});

test("Hardcoded", () => {
  type Option<T> = { type: "SOME"; value: T } | { type: "NONE" };

  const decodeOption = <T>(decoder: Decoder<T>): Decoder<Option<T>> =>
    oneOf(
      object({
        type: hardcoded("SOME").required,
        value: decoder.required,
      }),
      object({
        type: hardcoded("NONE").required,
      })
    );

  expectSuccess(decodeOption(number), { type: "NONE" });
  expectSuccess(decodeOption(number), { type: "SOME", value: 2 });

  expect(
    decodeOption(number).decode({ type: "SOME", value: "not a number" }).error
  ).toBe(true);

  expect(decodeOption(number).decode({ type: "SOME__", value: 2 }).error).toBe(
    true
  );
});

test("Dict", () => {
  const dec = dict(number);
  expectSuccess(dec, {});
  expectSuccess(dec, { x: 42 });

  expectFail(dec, { x: "not a num" });
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
    expect(dec.decode({})).toEqual(success({ x: "" }));
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

// TODO custom matchers
function expectSuccess<T>(decoder: Decoder<T>, value: T) {
  const decoded = decoder.decodeUnsafeThrow(value);

  expect(decoded).toStrictEqual(value);
}

function expectFail(decoder: Decoder<unknown>, value: unknown) {
  const decoded = decoder.decode(value);

  expect(decoded.error).toBe(true);
}
