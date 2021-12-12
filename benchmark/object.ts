import b from "benny";
import * as tsDec from "../dist/cjs/index";
import * as zod from "zod";
import * as iots from "io-ts/Decoder";

const input = {
  x: "str",
  y: 42,
  tag: "TAG",
};

const zodDecoder = zod.object({
  x: zod.string(),
  y: zod.number(),
  tag: zod.literal("TAG"),
});

const iotsDecoder = iots.struct({
  x: iots.string,
  y: iots.number,
  tag: iots.literal("TAG"),
});

const tsDecDecoder = tsDec.object({
  x: tsDec.string.required,
  y: tsDec.number.required,
  tag: tsDec.hardcoded("TAG").required,
});

b.suite(
  "Example",

  b.add("Zod", () => {
    const res = zodDecoder.parse(input);
  }),

  b.add("Tsdec", () => {
    const res = tsDecDecoder.decode(input);
  }),

  b.add("iots", () => {
    const res = iotsDecoder.decode(input);
  }),

  b.cycle(),
  b.complete(),
  // b.save({ file: "reduce", version: "1.0.0" }),
  // b.save({ file: "reduce", format: "chart.html" }),
);
