const b = require("benny");
const tsDec = require("../dist/cjs/index");
const zod = require("zod");
const myzod = require("myzod");
const iots = require("io-ts/Decoder");

const zodDecoder = zod.array(
  zod.object({
    name: zod.string(),
    age: zod.number(),
    numbers: zod.array(zod.number()),
    opt: zod.number().optional(),
  }),
);

const myzodDecoder = myzod.array(
  myzod.object({
    name: myzod.string(),
    age: myzod.number(),
    numbers: myzod.array(myzod.number()),
    opt: myzod.number().optional(),
  }),
);

const iotsDecoder = iots.array(
  iots.intersect(
    iots.struct({
      name: iots.string,
      age: iots.number,
      numbers: iots.array(iots.number),
    }),
  )(
    iots.partial({
      opt: iots.number,
    }),
  ),
);

// opt: iots.number.optional,
const tsDecDecoder = tsDec.array(
  tsDec.object({
    name: tsDec.string.required,
    age: tsDec.number.required,
    numbers: tsDec.array(tsDec.number).required,
    opt: tsDec.number.optional,
  }),
);

const createInput = (items = 1000) => {
  const ret = [];
  for (let i = 0; i < items; i++) {
    const o = {
      name: "hi",
      age: 42,
      numbers: [0, 1],
    };

    if (i % 2 === 0) {
      // @ts-ignore
      o.opt = 42;
    }

    ret.push(o);
  }
  return ret;
};

const input = createInput(1000);

b.suite(
  "Complex object array",

  b.add("zod", () => {
    const res = zodDecoder.parse(input);
  }),

  b.add("myzod", () => {
    const res = zodDecoder.parse(input);
  }),

  b.add("ts-decode", () => {
    const res = tsDecDecoder.decode(input);
  }),

  b.add("io-ts", () => {
    const res = iotsDecoder.decode(input);
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "complex-object", format: "chart.html" }),
);
