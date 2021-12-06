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

test("Dict", () => {
  const dec = dict(number);
  expectSuccess(dec, {});
  expectSuccess(dec, { x: 42 });

  expectFail(dec, { x: "not a num" });
});
