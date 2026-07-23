import test from "node:test";
import assert from "node:assert/strict";

import { BranchScanner } from "../src/domain/branch-scanner.js";

test("mapeia branches aninhadas e tipos de folhas", () => {
  const tree = {
    fBranches: {
      arr: [
        {
          fName: "event",
          fClassName: "EventData",
          _typename: "TBranchElement",
          fBranches: {
            arr: [
              {
                fName: "energy",
                fClassName: "",
                fTitle: "energy/F",
                _typename: "TBranch",
                fLeaves: {
                  arr: [{ _typename: "TLeafF" }]
                }
              }
            ]
          }
        }
      ]
    }
  };

  const entries = new BranchScanner().scan({
    fileId: "file-1",
    treePath: "events/CollectionTree;1",
    treeDepth: 2,
    treeObject: tree
  });

  assert.equal(entries.length, 2);
  assert.equal(entries[0].name, "event");
  assert.equal(entries[0].className, "EventData");
  assert.equal(entries[1].name, "event.energy");
  assert.equal(entries[1].className, "TLeafF");
  assert.equal(entries[1].details.storageClass, "TBranch");
});
