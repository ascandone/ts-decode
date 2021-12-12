const b = require("benny");

const { number, array, unknown, never, of } = require("../dist/cjs");

const unboxed = (value) =>
  typeof value === "number"
    ? { error: false, value }
    : { error: true, reason: "failure" };

const withPrim = unknown.andThen((value) =>
  typeof value === "number" ? of(value) : never("n"),
);

b.suite(
  "primitive",

  b.add("Decoder", () => {
    number.decode(42);
  }),

  b.add("prim", () => {
    withPrim.decode(42);
  }),

  b.add("unboxed", () => {
    unboxed(42);
  }),

  b.cycle(),
  b.complete(),
);
