import { Reason, reasonToJsonString } from "./reason";
import { Result } from "./result";

const failMsg = (expected: string, got: unknown): Result<never> => ({
  error: true,
  reason: {
    type: "FAIL",
    reason: `Expected ${expected}, got ${JSON.stringify(got)} instead`,
  },
});

/**
 * A type representing a decoder returning a {@linkcode Result} of type `T`.
 * Note T is the output type, not necessarily the input type.
 *
 * ```ts
 * number; // Decoder<number>
 * number.map((num) => (num + 10).toString()); // Decoder<string>
 * ```
 *
 * @category Decode
 * @typeParam T The type **produced by** the decoder
 */
class Decoder<T = unknown> {
  /**
   * Run the decode through the given value (of unknown type) and produce a {@linkcode Result}
   *
   * ```ts
   * number.decodeString("42") // => ✅ 42
   * number.decodeString(`"42"`) // => 🟥 "Expected a number, got \"42\" instead"
   * ```
   * @category Decode
   */
  public readonly decode: (value: unknown) => Result<T>;

  /**
   * @ignore
   */
  constructor(decode: (value: unknown) => Result<T>) {
    this.decode = decode;
  }

  /**
   * Like {@linkcode Decoder.decode}, but applies `JSON.parse()` before
   *
   * ```ts
   * number.decodeString("42") // => ✅ 42
   * number.decodeString(`"42"`) // => 🟥 "Expected a number, got \"42\" instead"
   * ```
   *
   * @category Decode
   */
  decodeString(json: string): Result<T> {
    try {
      const str = JSON.parse(json);
      return this.decode(str);
    } catch (error) {
      // @ts-ignore
      const reason: string = error.message;
      return { error: true, reason: { type: "FAIL", reason } };
    }
  }

  /**
   * Like {@linkcode Decoder.decode}, but instead of returning a Result, directly returns the decoded value, or throws an error on failure
   *
   * ⚠️ throwing errors defeats the whole purpose of type soundness. decoder.decode() is generally preferable
   *
   * @category Decode
   */
  decodeUnsafeThrow(value: unknown): T {
    const decoded = this.decode(value);

    if (decoded.error) {
      throw new Error(reasonToJsonString(decoded.reason));
    }
    return decoded.value;
  }

  /**
   * Maps the decoded value (when present)
   *
   * ```ts
   * const f = n => n.toString() + "!"
   * number.map(f).decode(42) // => ✅ "42!"
   * number.map(f).decode("str") // => 🟥 "Expected a number, got `\"str\"` instead"
   * ```
   *
   * @category Transform
   */
  map<U>(f: (value: T) => U): Decoder<U> {
    return this.andThen((value) => of(f(value)));
  }

  /**
   * Applies the given function to the decoded value (when present), and returns the result decoder. Sometimes known as `>>=`/`bind`.
   *
   * ```ts
   *  const stringToInt = (str: string): Result<number> => {
   *    const parsed = Number.parseInt(str)
   *    if (Number.isNaN(parsed)) {
   *      return of(`Cannot parse "${str}" as int`)
   *    } else {
   *      return never(parsed)
   *    }
   * }
   *
   * string.andThen(stringToInt).decode(42) // => 🟥 "Expected a string, got 42 instead"
   * string.andThen(stringToInt).decode("42") // => ✅ 42
   * string.andThen(stringToInt).decode("abc") // => 🟥 "Cannot parse \"abc\" as int"
   *
   * const f = n => n.toString() + "!"
   * number.map(f).decode(42) // => ✅ "42!"
   * number.map(f).decode("str") // => 🟥 "Expected a number, got \"str\" instead"
   * ```
   *
   * @category Transform
   */
  andThen<U>(f: (value: T) => Decoder<U>): Decoder<U> {
    return new Decoder((value) => {
      const result = this.decode(value);
      return result.error ? result : f(result.value).decode(value);
    });
  }

  /**
   * Represents a mandatory field in a object. Used with the {@linkcode object} decoder
   *
   * ```ts
   * //  Decoder<{ x: string }>
   * const decoder = object({ x: string.required })
   * decoder.decode({ x: "str" }) // =>  ✅ { x: "str" }
   * decoder.decode({ x: 42 }) // =>  🟥
   * decoder.decode({ }) // =>  🟥
   * decoder.decode({ x: undefined }) // =>  🟥
   * decoder.decode({ x: null }) // =>  🟥
   * ```
   *
   *  @category Object
   */
  required: RequiredField<T> = { type: "REQUIRED", decoder: this };

  /**
   * Represents a mandatory field in a object. Used with the {@linkcode object} decoder
   *
   * ```ts
   * //  Decoder<{ x?: string | undefined }>
   * const decoder = object({ x: string.optional })
   * decoder.decode({ x: "str" }) // =>  ✅ { x: "str" }
   * decoder.decode({ x: 42 }) // =>  🟥
   * decoder.decode({ }) // =>  ✅ { }
   * decoder.decode({ x: undefined }) // =>  🟥
   * decoder.decode({ x: null }) // =>  🟥
   * ```
   *  @category Object
   */
  optional: OptionalField<T> = { type: "OPTIONAL", decoder: this };

  /**
   * Represents an required field in a object, but instead of failing when field is not present,
   * the given value is used. Used with the {@linkcode object} decoder
   *
   * ```ts
   * const decoder = object({ x: string.default("NONE") })
   * decoder.decode({ x: "str" }) // =>  ✅ { x: "str" }
   * decoder.decode({ x: 42 }) // =>  🟥
   * decoder.decode({ }) // =>  ✅ { x: "NONE" }
   * decoder.decode({ x: undefined }) // =>  🟥
   * decoder.decode({ x: null }) // =>  🟥
   * ```
   *  @category Object
   */
  default(value: T): RequiredField<T> {
    return { type: "REQUIRED", decoder: this, default: value };
  }
}

export type { Decoder };

/**
 * @category Decode
 */
export type Infer<T> = T extends Decoder<infer U> ? U : never;

/**
 * @category Primitives
 */
export function of<T>(value: T) {
  return new Decoder(() => ({
    error: false,
    value,
  }));
}

/** @category Primitives */
export function never(reason: string) {
  return new Decoder<never>(() => ({
    error: true,
    reason: {
      type: "FAIL",
      reason,
    },
  }));
}

/**
 * @category Primitives
 */
export const unknown = new Decoder((value) => ({
  error: false,
  value,
}));

/**
 * @category Primitives
 */
export function hardcoded<
  T extends string | number | boolean | null | undefined,
>(constant: T): Decoder<T> {
  return new Decoder((value) =>
    value === constant
      ? { error: false, value: constant }
      : failMsg(JSON.stringify(constant), value),
  );
}

/**
 * @category Primitives
 */
export const number = new Decoder((value) =>
  typeof value === "number"
    ? { error: false, value }
    : failMsg("a number", value),
);

/**
 * @category Primitives
 */
export const string = new Decoder((value) =>
  typeof value === "string"
    ? { error: false, value }
    : failMsg("a string", value),
);

/**
 * @category Primitives
 */
export const boolean = new Decoder((value) =>
  typeof value === "boolean"
    ? { error: false, value }
    : failMsg("a boolean", value),
);

/**
 * @category Primitives
 */
export const null_ = new Decoder<null>((value) =>
  value === null ? { error: false, value } : failMsg("null", value),
);

/**
 * @category Primitives
 */
export const undefined_ = new Decoder<undefined>((value) =>
  value === undefined ? { error: false, value } : failMsg("undefined", value),
);

// Higher order decoders

/**
 * @category Higher order decoders
 */
export type OneOfReturn<T extends unknown[]> = T extends [
  Decoder<infer Hd>,
  ...infer Tl
]
  ? Hd | OneOfReturn<Tl>
  : never;

/**
 * @category Higher order decoders
 */
export function oneOf<T extends Decoder<any>[]>(
  ...decoders: T
): Decoder<OneOfReturn<T>> {
  return new Decoder((value) => {
    const reasons: Reason[] = [];

    for (const decoder of decoders) {
      const decoded = decoder.decode(value);

      if (!decoded.error) {
        return decoded;
      }

      reasons.push(decoded.reason);
    }

    return { error: true, reason: { type: "ONE_OF", reasons } };
  });
}

/**
 * @category Higher order decoders
 */
export function array<T>(decoder: Decoder<T>): Decoder<T[]> {
  return new Decoder((value) => {
    if (!Array.isArray(value)) {
      return failMsg("an array", value);
    }

    for (let index = 0; index < value.length; index++) {
      const elem: unknown = value[index];

      const result = decoder.decode(elem);

      if (result.error) {
        return {
          error: true,
          reason: {
            type: "ARRAY",
            index,
            reason: result.reason,
          },
        };
      }
    }

    return { error: false, value };
  });
}

/**
 * @category Higher order decoders
 */
export type RequiredField<T> = {
  type: "REQUIRED";
  decoder: Decoder<T>;
  default?: T;
};

/**
 * @category Higher order decoders
 */
export type OptionalField<T> = { type: "OPTIONAL"; decoder: Decoder<T> };

/**
 * @category Higher order decoders
 */
export type Field<T> = RequiredField<T> | OptionalField<T>;

type SelectRequired<K, V> = V extends RequiredField<unknown> ? K : never;
type SelectOptional<K, V> = V extends OptionalField<unknown> ? K : never;

type ExtractRequired<T> = T extends RequiredField<infer U> ? U : never;
type ExtractOptional<T> = T extends OptionalField<infer U> ? U : never;

/**
 * @category Higher order decoders
 */
export type ObjectSpecs = { [key: string]: Field<unknown> };

type DecodedObject<O extends ObjectSpecs> = {
  [key in keyof O as SelectRequired<key, O[key]>]: ExtractRequired<O[key]>;
} & {
  [key in keyof O as SelectOptional<key, O[key]>]?: ExtractOptional<O[key]>;
};

/**
 * @category Decode
 */
class ObjectDecoder<O extends ObjectSpecs> extends Decoder<DecodedObject<O>> {
  public readonly specs: O;

  constructor(specs: O) {
    const mutatesObject =
      Object.values(specs).find(
        (field) => field.type === "REQUIRED" && "default" in field,
      ) !== undefined;

    super((value) => {
      if (typeof value !== "object" || value === null) {
        return failMsg("an object", value);
      }

      const returnObject: any = mutatesObject ? { ...value } : value;

      for (const field in specs) {
        const fieldSpec = specs[field];

        const decoder = fieldSpec.decoder;

        if (field in value) {
          const value_ = (value as { [key: string]: unknown })[field];
          const decoded = decoder.decode(value_);

          if (decoded.error) {
            return {
              error: true,
              reason: { type: "FIELD_TYPE", field, reason: decoded.reason },
            };
          }
        } else if (fieldSpec.type === "REQUIRED") {
          if ("default" in fieldSpec) {
            returnObject[field] = fieldSpec.default;
          } else {
            return {
              error: true,
              reason: { type: "MISSING_FIELD", field },
            };
          }
        }
      }

      return { error: false, value: returnObject };
    });

    this.specs = specs;
  }

  mapSpecs<O2 extends ObjectSpecs>(mapper: (specs: O) => O2) {
    return object(mapper(this.specs));
  }
}

export type { ObjectDecoder };

/**
 * @category Higher order decoders
 */
export function object<O extends ObjectSpecs>(specs: O) {
  return new ObjectDecoder(specs);
}

/**
 * @category Higher order decoders
 */
export function lazy<T>(decoderSupplier: () => Decoder<T>): Decoder<T> {
  return new Decoder((value) => decoderSupplier().decode(value));
}

/**
 * @category Higher order decoders
 */
export function dict<T>(decoder: Decoder<T>): Decoder<{ [key: string]: T }> {
  return new Decoder((value) => {
    const newObj: { [key: string]: T } = {};

    if (typeof value !== "object" || value === null) {
      return failMsg("an object", value);
    }

    const obj = value as { [key: string]: unknown };

    for (const field in value) {
      const decoded = decoder.decode(obj[field]);

      if (decoded.error) {
        return {
          error: true,
          reason: { type: "FIELD_TYPE", field, reason: decoded.reason },
        };
      } else {
        newObj[field] = decoded.value;
      }
    }

    return { error: false, value: newObj };
  });
}

type Tuple<T extends unknown[]> = T extends [Decoder<infer Hd>, ...infer Tl]
  ? [Hd, ...Tuple<Tl>]
  : [];

/**
 * @category Higher order decoders
 */
export function tuple<T extends Decoder<unknown>[]>(
  ...decoders: T
): Decoder<Tuple<T>> {
  return new Decoder((value) => {
    const ret: any = [];

    if (!Array.isArray(value)) {
      return failMsg(`a ${decoders.length}-tuple`, value);
    }

    if (value.length < decoders.length) {
      return failMsg(`a ${decoders.length}-tuple`, value);
    }

    for (let index = 0; index < decoders.length; index++) {
      const decoder = decoders[index];
      const arrayValue = value[index];

      const result = decoder.decode(arrayValue);

      if (result.error) {
        return {
          error: true,
          reason: { type: "ARRAY", index, reason: result.reason },
        };
      } else {
        ret.push(result.value);
      }
    }

    return { error: false, value: ret };
  });
}
