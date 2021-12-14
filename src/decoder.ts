import { Reason, reasonToJsonString } from "./reason";
import { Result } from "./result";

const failMsg = (expected: string, got: unknown): Result<never> => ({
  error: true,
  reason: {
    type: "FAIL",
    reason: `Expected ${expected}, got ${JSON.stringify(got)} instead`,
  },
});

class Decoder<T = unknown> {
  constructor(public readonly decode: (value: unknown) => Result<T>) {}

  map<U>(f: (value: T) => U): Decoder<U> {
    return this.andThen((value) => of(f(value)));
  }

  andThen<U>(f: (value: T) => Decoder<U>): Decoder<U> {
    return new Decoder((value) => {
      const result = this.decode(value);
      return result.error ? result : f(result.value).decode(value);
    });
  }

  decodeString(json: string) {
    try {
      const str = JSON.parse(json);
      return this.decode(str);
    } catch (error) {
      // @ts-ignore
      const reason: string = error.message;
      return { error: true, reason: { type: "FAIL", reason } };
    }
  }

  decodeUnsafeThrow(value: unknown) {
    const decoded = this.decode(value);

    if (decoded.error) {
      throw new Error(reasonToJsonString(decoded.reason));
    }
    return decoded.value;
  }

  required: RequiredField<T> = { type: "REQUIRED", decoder: this };
  optional: OptionalField<T> = { type: "OPTIONAL", decoder: this };

  default(value: T): RequiredField<T> {
    return { type: "REQUIRED", decoder: this, default: value };
  }
}

export type { Decoder };

export type Infer<T> = T extends Decoder<infer U> ? U : never;

export const of = <T>(value: T) =>
  new Decoder(() => ({
    error: false,
    value,
  }));

export const never = (reason: string) =>
  new Decoder(() => ({
    error: true,
    reason: {
      type: "FAIL",
      reason,
    },
  }));

export const unknown = new Decoder((value) => ({
  error: false,
  value,
}));

type Primitive = string | number | boolean | null | undefined;

export const hardcoded = <T extends Primitive>(constant: T): Decoder<T> =>
  new Decoder((value) =>
    value === constant
      ? { error: false, value: constant }
      : failMsg(JSON.stringify(constant), value),
  );

// Primitives

export const number = new Decoder((value) =>
  typeof value === "number"
    ? { error: false, value }
    : failMsg("a number", value),
);

export const string = new Decoder((value) =>
  typeof value === "string"
    ? { error: false, value }
    : failMsg("a string", value),
);

export const boolean = new Decoder((value) =>
  typeof value === "boolean"
    ? { error: false, value }
    : failMsg("a boolean", value),
);

export const null_ = new Decoder<null>((value) =>
  value === null ? { error: false, value } : failMsg("null", value),
);

export const undefined_ = new Decoder<undefined>((value) =>
  value === undefined ? { error: false, value } : failMsg("undefined", value),
);

// Higher order decoders

type OneOfReturn<T extends unknown[]> = T extends [
  Decoder<infer Hd>,
  ...infer Tl
]
  ? Hd | OneOfReturn<Tl>
  : never;

export const oneOf = <T extends Decoder<any>[]>(
  ...decoders: T
): Decoder<OneOfReturn<T>> =>
  new Decoder((value) => {
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

export const array = <T>(decoder: Decoder<T>): Decoder<T[]> =>
  new Decoder((value) => {
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

type JObject = { [key: string]: unknown };

export type RequiredField<T> = {
  type: "REQUIRED";
  decoder: Decoder<T>;
  default?: T;
};

export type OptionalField<T> = { type: "OPTIONAL"; decoder: Decoder<T> };

export type Field<T> = RequiredField<T> | OptionalField<T>;

type SelectRequired<K, V> = V extends RequiredField<unknown> ? K : never;
type SelectOptional<K, V> = V extends OptionalField<unknown> ? K : never;

type ExtractRequired<T> = T extends RequiredField<infer U> ? U : never;
type ExtractOptional<T> = T extends OptionalField<infer U> ? U : never;

export type ObjectSpecs = { [key: string]: Field<unknown> };

type DecodedObject<O extends ObjectSpecs> = {
  [key in keyof O as SelectRequired<key, O[key]>]: ExtractRequired<O[key]>;
} & {
  [key in keyof O as SelectOptional<key, O[key]>]?: ExtractOptional<O[key]>;
};

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
          const value_ = (value as JObject)[field];
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

export const object = <O extends ObjectSpecs>(specs: O) =>
  new ObjectDecoder(specs);

export const lazy = <T>(decoderSupplier: () => Decoder<T>): Decoder<T> =>
  new Decoder((value) => decoderSupplier().decode(value));

export const dict = <T>(decoder: Decoder<T>): Decoder<{ [key: string]: T }> =>
  new Decoder((value) => {
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

type Tuple<T extends unknown[]> = T extends [Decoder<infer Hd>, ...infer Tl]
  ? [Hd, ...Tuple<Tl>]
  : [];

export const tuple = <T extends Decoder<unknown>[]>(
  ...decoders: T
): Decoder<Tuple<T>> =>
  new Decoder((value) => {
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
