import { number, object, string } from "../src";
import { Infer } from "../src/decoder";
import { assert, typeChecking, shouldPass, shouldFail } from "./TestHelpers";

type User = Infer<typeof userDecoder>;

const userDecoder = object({
  name: string.required,
  age: number.optional,
});

type InferTest = assert<
  [
    typeChecking<User, { name: string }, shouldPass>,
    typeChecking<User, { name: string; age: undefined }, shouldFail>,
    typeChecking<User, { name: string; age?: number }, shouldPass>,
    typeChecking<User, { name: string; age?: string }, shouldFail>,
    typeChecking<User, { name: string; age?: number }, shouldPass>,
    typeChecking<User, { name: string; age?: number | undefined }, shouldPass>,
  ]
>;
