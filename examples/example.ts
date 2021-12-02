import { number, object } from "../src";
import {
  array,
  dict,
  Infer,
  null_,
  oneOf,
  string,
  unknown,
} from "../src/decoder";
import { reasonToString } from "../src/reason";

type City = Infer<typeof city>;
const city = object({
  name: string.required,
  cap: string.optional,
});

type User = Infer<typeof user>;

const user = object({
  name: string.required,
  age: number.optional,
  livedIn: array(city).optional,
});

const decoded = user.decode({
  name: "John doe",
  age: 25,
  livedIn: [
    { name: "Rome", cap: "1234" },
    { name: "Milano", cap: "000" },
  ],
});

if (decoded.error) {
  console.log(JSON.stringify(decoded.reason, null, 4), "\n\n");
  console.log(reasonToString(decoded.reason));
} else {
  console.log("ok");
}

const j = `
  {"x": 42}
`;

const z = dict(number).decodeUnsafeThrow(JSON.parse(j));

const a = z["hi"];

console.log(dict(number).decodeString(j));
