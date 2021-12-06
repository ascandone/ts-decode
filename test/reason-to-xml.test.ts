import { Reason, reasonToString } from "../src/reason";

describe("reasonToXml", () => {
  const reason: Reason = {
    type: "FAIL",
    reason: "err",
  };

  const failStr = "<fail> err </fail>";

  test("Fail", () => {
    expect(reasonToString(reason)).toBe(failStr);
  });

  test("field-type", () => {
    expect(
      reasonToString({
        type: "FIELD_TYPE",
        field: "x",
        reason: {
          type: "FAIL",
          reason: "err",
        },
      }),
    ).toBe(`<field-type name="x">
  <fail> err </fail>
</field-type>`);
  });

  test("array", () => {
    expect(
      reasonToString({
        type: "ARRAY",
        index: 4,
        reason,
      }),
    ).toBe(`<array index="4">
  ${failStr}
</array>`);
  });

  describe("one-of", () => {
    test("multiple children", () => {
      expect(
        reasonToString({
          type: "ONE_OF",
          reasons: [
            { type: "FAIL", reason: "a" },
            { type: "FAIL", reason: "b" },
            { type: "FAIL", reason: "c" },
          ],
        }),
      ).toBe(`<one-of>
  <fail> a </fail>
  <fail> b </fail>
  <fail> c </fail>
</one-of>`);
    });

    test("single child", () => {
      expect(
        reasonToString({
          type: "ONE_OF",
          reasons: [reason],
        }),
      ).toBe(`<one-of>
  ${failStr}
</one-of>`);
    });
  });

  test("missing-field", () => {
    expect(
      reasonToString({
        type: "MISSING_FIELD",
        field: "f",
      }),
    ).toBe(`<missing-field name="f" />`);
  });
});
