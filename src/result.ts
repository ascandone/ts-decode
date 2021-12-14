import { xmlToString, Xml, text, node } from "./internals/xml";

/**
 * A type representing the result of a decoding process
 *
 * @category Decode
 */
export type Result<T> =
  | { error: false; value: T }
  | { error: true; reason: Reason };

/**
 * A type representing the reason of a decoding failure
 *
 * @category Handle failure
 */
export type Reason =
  | { type: "FAIL"; reason: string }
  | { type: "ONE_OF"; reasons: Reason[] }
  | { type: "ARRAY"; index: number; reason: Reason }
  | { type: "MISSING_FIELD"; field: string }
  | { type: "FIELD_TYPE"; field: string; reason: Reason };

function reasonToXml(reason: Reason): Xml {
  switch (reason.type) {
    case "FAIL":
      return node("fail", {}, [text(reason.reason)]);

    case "FIELD_TYPE":
      return node("field-type", { name: reason.field }, [
        reasonToXml(reason.reason),
      ]);

    case "ARRAY":
      return node("array", { index: reason.index }, [
        reasonToXml(reason.reason),
      ]);
    case "ONE_OF":
      return node("one-of", {}, reason.reasons.map(reasonToXml));

    case "MISSING_FIELD":
      return node("missing-field", { name: reason.field });
  }
}

/**
 * Convert to a xml-like string
 *
 * @category Handle failure
 */
export function reasonToXmlString(reason: Reason): string {
  const xml = reasonToXml(reason);

  return xmlToString(xml);
}

/**
 * Convert to a json-like string
 *
 * @category Handle failure
 */
export function reasonToJsonString(reason: Reason): string {
  return JSON.stringify(reason, null, 2);
}
