import { Reason, reasonToXmlString } from "../src/reason";

describe("reasonToXml", () => {
  const reason: Reason = {
    type: "FAIL",
    reason: "err",
  };

  const failStr = "<fail> err </fail>";

  test("Fail", () => {
    expect(reasonToXmlString(reason)).toBe(failStr);
  });

  test("field-type", () => {
    expect(
      reasonToXmlString({
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
      reasonToXmlString({
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
        reasonToXmlString({
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
        reasonToXmlString({
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
      reasonToXmlString({
        type: "MISSING_FIELD",
        field: "f",
      }),
    ).toBe(`<missing-field name="f" />`);
  });
});
