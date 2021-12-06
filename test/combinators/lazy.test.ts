import { array, Decoder, lazy, object, string } from "../../src";

test("Lazy", () => {
  type Tree = {
    label: string;
    subTree: Tree[];
  };

  const treeDecoder: Decoder<Tree> = object({
    label: string.required,
    subTree: lazy(() => array(treeDecoder)).default([]),
  });

  expect(
    treeDecoder.decodeUnsafeThrow({
      label: "a",
    }),
  ).toEqual({
    label: "a",
    subTree: [],
  });
});
