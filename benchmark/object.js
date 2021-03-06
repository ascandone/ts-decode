const b = require("benny");
const tsDec = require("../dist/cjs/index");
const zod = require("zod");
const myZod = require("myzod");
const iots = require("io-ts/Decoder");
const rt = require("runtypes");

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

const myZodDecoder = myZod.object({
  x: myZod.string(),
  y: myZod.number(),
  tag: myZod.literal("TAG"),
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

const runtypesDecoder = rt.Record({
  x: rt.String,
  y: rt.Number,
  tag: rt.Literal("TAG"),
});

b.suite(
  "Single object",

  b.add("ts-decode", () => {
    const res = tsDecDecoder.decode(input);
  }),
  b.add("myzod", () => {
    const res = myZodDecoder.parse(input);
  }),

  b.add("zod", () => {
    const res = zodDecoder.parse(input);
  }),

  b.add("io-ts", () => {
    const res = iotsDecoder.decode(input);
  }),

  b.add("runtypes", () => {
    const res = runtypesDecoder.check(input);
  }),

  b.cycle(),
  b.complete(),

  b.save({ file: "single object", format: "chart.html" }),
);
