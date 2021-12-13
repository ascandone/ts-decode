const b = require("benny");
const tsDec = require("../dist/cjs/index");
const myZod = require("myzod");

const input = {
  x: "str",
};

const myZodDecoder = myZod.object({
  x: myZod.string(),
  y: myZod.number().default(0),
});

const myZodDecoderNoDefault = myZod.object({
  x: myZod.string(),
  y: myZod.number(),
});

const tsDecDecoder = tsDec.object({
  x: tsDec.string.required,
  y: tsDec.number.default(0),
});

b.suite(
  "Single object",

  b.add("ts-decode", () => {
    const res = tsDecDecoder.decode(input);
  }),

  b.add("myzod", () => {
    const res = myZodDecoder.parse(input);
  }),

  b.add("myzod nodefault", () => {
    const res = myZodDecoderNoDefault.parse({
      x: "str",
      y: 0,
    });
  }),

  b.cycle(),
  b.complete(),

  b.save({ file: "single-object", format: "chart.html" }),
);
