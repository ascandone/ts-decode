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
});
