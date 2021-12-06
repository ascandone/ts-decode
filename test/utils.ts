import { Decoder } from "../src";

// TODO custom matchers
export function expectSuccess<T>(decoder: Decoder<T>, value: T) {
  const decoded = decoder.decodeUnsafeThrow(value);

  expect(decoded).toStrictEqual(value);
}

export function expectFail(decoder: Decoder<unknown>, value: unknown) {
  const decoded = decoder.decode(value);

  expect(decoded.error).toBe(true);
}
