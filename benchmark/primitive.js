const b = require("benny");

const { number, array, unknown, never, of } = require("../dist/cjs");
const myzod = require("myzod");

const unboxed = (value) =>
  typeof value === "number"
    ? { error: false, value }
    : { error: true, reason: "failure" };

const unboxedThrows = (value) => {
  if (typeof value === "number") {
    return value;
  }
};

const customDec = unknown.andThen((value) =>
  typeof value === "number" ? of(value) : never("n"),
);

b.suite(
  "primitive",

  b.add("myzod", () => {
    myzod.number().parse(42);
  }),

  b.add("ts-decode", () => {
    number.decode(42);
  }),

  b.add("ts-decode (custom decoder)", () => {
    customDec.decode(42);
  }),

  b.add("unboxed", () => {
    unboxed(42);
  }),

  b.add("unboxed + throw", () => {
    try {
      unboxed(42);
    } catch (e) {}
  }),

  b.cycle(),
  b.complete(),
);
