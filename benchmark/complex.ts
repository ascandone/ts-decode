import b from "benny";
import * as tsDec from "../dist/cjs/index";
import * as zod from "zod";
import * as iots from "io-ts/Decoder";

const zodDecoder = zod.array(
  zod.object({
    name: zod.string(),
    age: zod.number(),
    numbers: zod.array(zod.number()),
    opt: zod.number().optional(),
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
