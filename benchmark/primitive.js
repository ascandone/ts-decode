const b = require("benny");
const tsDec = require("../dist/cjs/index");
const zod = require("zod");
const iots = require("io-ts/Decoder");

const zodDecoder = zod.array(zod.number());

const iotsDecoder = iots.array(iots.number);

const tsDecDecoder = tsDec.array(tsDec.number);

const createInput = (items = 1000) => {
  const ret = [];
  for (let i = 0; i < items; i++) {
    ret.push(42);
  }
  return ret;
};

const input = createInput(1000);

b.suite(
  "primitive",

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

  b.save({ file: "primitive", format: "chart.html" }),
);
