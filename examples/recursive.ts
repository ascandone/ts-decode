import { lazy, string, array, object, Decoder } from "../src/index";

type Tree = {
  label: string;
  subTree: Tree[];
};

const treeDecoder: Decoder<Tree> = object({
  label: string.required,
  subTree: lazy(() => array(treeDecoder)).required,
});
