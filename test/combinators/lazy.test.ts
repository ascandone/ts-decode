import { array, Decoder, lazy, object, string } from "../../src";
import { expectSuccess } from "../utils";

test("Lazy", () => {
  type Tree = {
    label: string;
    subTree: Tree[];
  };

  const treeDecoder: Decoder<Tree> = object({
    label: string.required,
    subTree: lazy(() => array(treeDecoder)).default([]),
  });

  const tree: Tree = {
    label: "a",
    subTree: [
      {
        label: "b",
        subTree: [],
      },
      {
        label: "c",
        subTree: [],
      },
    ],
  };

  expectSuccess(treeDecoder, tree);
});
