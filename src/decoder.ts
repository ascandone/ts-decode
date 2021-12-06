import { Reason, reasonToString } from "./reason";
import { fail, success, Result } from "./result";

const failMsg = (expected: string, got: unknown) =>
  fail(`Expected ${expected}, got ${JSON.stringify(got)} instead`);

class Decoder<T = unknown> {
  constructor(private _decode: (value: unknown) => Result<T>) {}

  map<U>(f: (value: T) => U): Decoder<U> {
    return this.andThen((value) => of(f(value)));
  }

  andThen<U>(f: (value: T) => Decoder<U>): Decoder<U> {
    return new Decoder((value) => {
      const decoded = this.decode(value);
      return decoded.error ? decoded : f(decoded.value).decode(value);
    });
  }

  decodeString(json: string) {
    try {
      const str = JSON.parse(json);
      return this.decode(str);
    } catch (error) {
      //@ts-ignore
      return fail(error.message);
    }
  }

  decode(value: unknown) {
    return this._decode(value);
  }

  decodeUnsafeThrow(value: unknown) {
    const decoded = this._decode(value);

    if (decoded.error) {
      throw new Error(reasonToString(decoded.reason));
    }
    return decoded.value;
  }

  get required(): RequiredField<T> {
    return { type: "REQUIRED", decoder: this };
  }

  get optional(): OptionalField<T> {
    return { type: "OPTIONAL", decoder: this };
  }

  default(value: T): RequiredField<T> {
    return { type: "REQUIRED", decoder: this, default: value };
  }
}

export type { Decoder };

export type Infer<T> = T extends Decoder<infer U> ? U : never;

export const of = <T>(value: T) => new Decoder(() => success(value));
export const never = (reason: string) => new Decoder(() => fail(reason));

export const unknown = new Decoder(success);

type Primitive = string | number | boolean | null | undefined;

export const hardcoded = <T extends Primitive>(constant: T) =>
  new Decoder((value) =>
    value === constant
      ? success(constant)
      : failMsg(JSON.stringify(constant), value),
  );

// Primitives

export const number = new Decoder((value) =>
  typeof value === "number" ? success(value) : failMsg("a number", value),
);

export const string = new Decoder((value) =>
  typeof value === "string" ? success(value) : failMsg("a string", value),
);

export const boolean = new Decoder((value) =>
  typeof value === "boolean" ? success(value) : failMsg("a boolean", value),
);

export const null_ = new Decoder<null>((value) =>
  value === null ? success(value) : failMsg("null", value),
);

export const undefined_ = new Decoder<undefined>((value) =>
  value === undefined ? success(value) : failMsg("undefined", value),
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

    const ret: T[] = [];

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
      } else {
        ret.push(result.value);
      }
    }

    return success(ret);
  });

type JObject = { [key: string]: unknown };

type RequiredField<T> = { type: "REQUIRED"; decoder: Decoder<T>; default?: T };
type OptionalField<T> = { type: "OPTIONAL"; decoder: Decoder<T> };

export type Field<T> = RequiredField<T> | OptionalField<T>;

type SelectRequired<K, V> = V extends RequiredField<unknown> ? K : never;
type SelectOptional<K, V> = V extends OptionalField<unknown> ? K : never;

type ExtractRequired<T> = T extends RequiredField<infer U> ? U : never;
type ExtractOptional<T> = T extends OptionalField<infer U> ? U : never;

type ObjectSpecs = { [key: string]: Field<unknown> };

type DecodedObject<O extends ObjectSpecs> = {
  [key in keyof O as SelectRequired<key, O[key]>]: ExtractRequired<O[key]>;
} & {
  [key in keyof O as SelectOptional<key, O[key]>]?: ExtractOptional<O[key]>;
};

export const object = <O extends ObjectSpecs>(
  specs: O,
): Decoder<DecodedObject<O>> =>
  new Decoder((value) => {
    if (typeof value !== "object" || value === null) {
      return failMsg("an object", value);
    }

    const o: any = {};

    for (const field in specs) {
      const fieldSpec = specs[field];

      const decoder = fieldSpec.decoder;

      const object_ = value as JObject;

      if (field in object_) {
        const value_ = object_[field];
        const decoded = decoder.decode(value_);

        if (decoded.error) {
          return {
            error: true,
            reason: { type: "FIELD_TYPE", field, reason: decoded.reason },
          };
        } else {
          o[field] = decoded.value;
        }
      } else if (fieldSpec.type === "REQUIRED" && "default" in fieldSpec) {
        o[field] = fieldSpec.default;
      } else if (fieldSpec.type === "REQUIRED") {
        return {
          error: true,
          reason: { type: "MISSING_FIELD", field },
        };
      }
    }

    return success(o);
  });

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

    return success(newObj);
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

    return success(ret);
  });
