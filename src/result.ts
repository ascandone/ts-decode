import { Reason } from "./reason";

export type Result<T> =
  | { error: false; value: T }
  | { error: true; reason: Reason };
