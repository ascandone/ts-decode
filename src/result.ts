import { Reason } from "./reason";

export type Result<T> =
  | { error: false; value: T }
  | { error: true; reason: Reason };

export const success = <T>(value: T): Result<T> => ({ error: false, value });

export const fail = (reason: string): Result<never> => ({
  error: true,
  reason: { type: "FAIL", reason },
});
