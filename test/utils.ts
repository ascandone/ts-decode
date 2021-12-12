import { Decoder, Reason } from "../src";

// TODO custom matchers
export function expectSuccess<T>(decoder: Decoder<T>, value: T) {
  const decoded = decoder.decodeUnsafeThrow(value);

  expect(decoded).toStrictEqual(value);
}

export function expectFail(
  decoder: Decoder<unknown>,
  value: unknown,
  reason?: Reason,
) {
  const result = decoder.decode(value);

  expect(result.error).toBe(true);

  if (reason != null && result.error === true) {
    expect(result.reason).toStrictEqual(reason);
  }
}
