![minzipped size](https://badgen.net/bundlephobia/minzip/ts-decode) ![Dependency count](https://badgen.net/bundlephobia/dependency-count/ts-decode)

## `ts-decode`

> Straightforward, type-safe `unknown => T` decoding combinators

### Basic example

```ts
import { number } from "ts-decode";
// number : Decoder<number>

const json = JSON.parse(someData);

// result: Result<number>
const result = number.decode(json);

if (!result.error) {
  // now we have the compile-time guarantee that
  // decoded: number
  // without manual casting
  const decoded = result.value;
} else {
  // Or if it failed we can log the error description
  const reason = result.reason;
}
```

### Complex example

<!-- prettier-ignore -->
```ts
const person = object({
  name: string.required,
  id: number.required,
  kind: oneOf(
    hardcoded("developer"),
    hardcoded("devop"),
    hardcoded("designer")
  ).required,
  phoneNumbers: array(string).optional,
});

/*
automagically inferred as:

type Person = {
    name: string;
    id: number;
    kind: "developer" | "devop" | "designer";
    phoneNumbers?: string[] | undefined;
}
*/
type Person = Infer<typeof user>;
```

### Recursive type

```ts
type Tree = {
  label: string;
  children: Tree[];
};

const treeDecoder: Decoder<Tree> = object({
  label: string.required,
  children: lazy(() => array(treeDecoder)).required,
});
```

### Optional values semantics

```ts
//  Decoder<{ x: string }>
const dec1 = object({ x: string.required });
dec1.decode({ x: "str" }); // => ✅
dec1.decode({ x: undefined }); // => 🟥
dec1.decode({ x: null }); // => 🟥
dec1.decode({}); // => 🟥

//  Decoder<{ x?: string | undefined }>
const dec2 = object({ x: string.optional });
dec2.decode({ x: "str" }); // => ✅
dec2.decode({ x: undefined }); // => 🟥
dec2.decode({ x: null }); // => 🟥
dec2.decode({}); // => ✅

//  Decoder<{ x: string }>
const dec3 = object({ x: string.default("") });
dec3.decode({ x: "str" }); // => ✅
dec3.decode({ x: undefined }); // => 🟥
dec3.decode({ x: null }); // => 🟥
dec3.decode({}); // => ✅ { x: "" }

//  Decoder<{ x: string | undefined }>
const dec4 = object({ x: oneOf(string, undefined_).required });
dec4.decode({ x: "str" }); // => ✅
dec4.decode({ x: undefined }); // => ✅
dec4.decode({ x: null }); // => 🟥
dec4.decode({}); // => 🟥
```
