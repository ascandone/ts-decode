import { Reason } from "./reason";

/**
 * @category Decode
 */
export type Result<T> =
  | { error: false; value: T }
  | { error: true; reason: Reason };
