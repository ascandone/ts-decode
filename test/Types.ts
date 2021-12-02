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
    typeChecking<User, { name: string }, shouldFail>,
    typeChecking<User, { name: string; age?: string }, shouldFail>,

    typeChecking<User, { name: string; age?: number }, shouldPass>,
    typeChecking<User, { name: string; age?: number | undefined }, shouldPass>
  ]
>;
