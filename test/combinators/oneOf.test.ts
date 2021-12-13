import { Infer, oneOf, string, undefined_ } from "../../src";
import { assert, typeChecking, shouldFail, shouldPass } from "../TestHelpers";
import { expectSuccess } from "../utils";

describe("oneOf", () => {
  test("primitives", () => {
    const dec = oneOf(string, undefined_);

    type Z = Infer<typeof dec>;

    type T = typeChecking<Infer<typeof dec>, string | undefined, shouldPass>;

    type Test1 = assert<
      [
        typeChecking<Infer<typeof dec>, string | undefined, shouldPass>,
        // typeChecking<typeof dec, Decoder<string | undefined>, shouldPass>,
      ]
    >;

    expectSuccess(dec, "Hello");
    // expectSuccess(dec, undefined);

    expect(dec.decode(null).error).toBe(true);
  });
});
