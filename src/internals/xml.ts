export type Xml =
  | { type: "text"; value: string }
  | { type: "node"; attrs: object; tag: string; children: Xml[] };

export const text = (value: string): Xml => ({ type: "text", value });
export const node = (
  tag: string,
  attrs: object,
  children: Xml[] = [],
): Xml => ({
  type: "node",
  tag,
  attrs,
  children,
});

const INDENT_STR = "  ";

const attrsToString = (attrs: object) =>
  Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join("");

const indent = (level: number) =>
  Array.from({ length: level }).fill(INDENT_STR).join("");

export const xmlToStringHelper = (level: number, xml: Xml): string => {
  const indentationTag = indent(level);

  switch (xml.type) {
    case "text":
      /* istanbul ignore next */
      return indentationTag + xml.value;

    case "node":
      const { tag, children, attrs } = xml;
      const strAttrs = attrsToString(attrs);
      const attrsSpace = strAttrs === "" ? "" : " ";

      if (children.length === 0) {
        return indentationTag + `<${tag}${attrsSpace}${strAttrs} />`;
      } else if (children.length === 1 && children[0].type === "text") {
        const child = children[0].value;
        return `${indentationTag}<${tag}${attrsSpace}${strAttrs}> ${child} </${tag}>`;
      } else {
        // Uppper

        const openingTag = indentationTag + `<${tag}${attrsSpace}${strAttrs}>`;

        // Body
        const body = children
          .map(xmlToStringHelper.bind(null, level + 1))
          .join("\n");

        // Closing
        const closingTag = indentationTag + `</${tag}>`;

        return `${openingTag}\n${body}\n${closingTag}`;
      }
  }
};

export const xmlToString = (xml: Xml) => xmlToStringHelper(0, xml);
