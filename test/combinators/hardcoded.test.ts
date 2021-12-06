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
} from "../../src/index";
import { assert, shouldFail, shouldPass, typeChecking } from "../TestHelpers";
import { expectFail, expectSuccess } from "../utils";

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
      }),
    );

  expectSuccess(decodeOption(number), { type: "NONE" });
  expectSuccess(decodeOption(number), { type: "SOME", value: 2 });

  expect(
    decodeOption(number).decode({ type: "SOME", value: "not a number" }).error,
  ).toBe(true);

  expect(decodeOption(number).decode({ type: "SOME__", value: 2 }).error).toBe(
    true,
  );
});
