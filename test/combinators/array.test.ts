import { number, string, array } from "../../src/index";
import { expectSuccess } from "../utils";

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

  test("Works with non-isomorphic decoder without mutating the input", () => {
    const input = [1, 2, 3];
    const inputCopy = [...input];

    const dec = array(number.map(String));

    expect(dec.decodeUnsafeThrow(input)).toEqual(["1", "2", "3"]);
    expect(input).toEqual(inputCopy);
  });
});
