## `ts-decode`

Combinators for type-safe `unknown => T` decoding

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
