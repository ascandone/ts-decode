![minzipped size](https://badgen.net/bundlephobia/minzip/ts-decode) ![Dependency count](https://badgen.net/bundlephobia/dependency-count/ts-decode) ![npm version](https://badgen.net/npm/v/ts-decode)

## `ts-decode`

> Straightforward, type-safe `unknown => T` decoding combinators

### Install

```bash
# using npm
npm i ts-decode

# using yarn
yarn add ts-decode
```

### Usage

```ts
// We can compose the decoders to create new decoders

const personTypeDecoder = oneOf(
  hardcoded("developer"),
  hardcoded("project manager"),
  hardcoded("designer"),
);

const personDecoder = object({
  name: string.required,
  id: number.required,
  kind: personTypeDecoder.required,
  phoneNumbers: array(string).optional,
});

/*
Automagically inferred as:

type Person = {
    name: string;
    id: number;
    kind: "developer" | "project manager" | "designer";
    phoneNumbers?: string[] | undefined;
}
*/
type Person = Infer<typeof personDecoder>;

// The decoder can now validate a value of unknown type
const json = JSON.parse(`
  { "name": "John Doe",
    "id": 1234,
    "kind": "project-manager",
    "phoneNumbers": ["123123123"]
  }
`);

const result = personDecoder.decode(json);

if (result.error === false) {
  // now we have the compile-time guarantee that this
  const person = result.value;
  // has type `Person` without manual casting
} else {
  // Or if it failed we can log the error description
  const reason = result.reason;
  console.error(reasonToString(reason));
}
```

By the way, did you notice the bug?
Good thing we printed it out

```xml
<field-type name="kind">
  <one-of>
    <fail> Expected "developer", got "project-manager" instead  </fail>
    <fail> Expected "project manager", got "project-manager" instead  </fail>
    <fail> Expected "designer", got "project-manager" instead  </fail>
  </one-of>
</field-type>
```

You can find the complete API in this project [wiki](https://github.com/ascandone/ts-decode/wiki/Decoders)

Or you can try it in a [codesanbox](https://codesandbox.io/s/ts-decode-playground-xw3yb?file=/src/index.ts)
