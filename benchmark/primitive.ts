import b from "benny";
import * as tsDec from "../dist/cjs/index";
import * as zod from "zod";
import * as iots from "io-ts/Decoder";

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
