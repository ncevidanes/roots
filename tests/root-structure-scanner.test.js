import test from "node:test";
import assert from "node:assert/strict";

import { RootStructureScanner } from "../src/application/root-structure-scanner.js";
import { BranchScanner } from "../src/domain/branch-scanner.js";
import {
  ROOT_CATEGORIES,
  RootObjectClassifier
} from "../src/domain/root-object-classifier.js";

function key(name, className, cycle = 1) {
  return {
    fName: name,
    fClassName: className,
    fCycle: cycle,
    fTitle: `${name} title`,
    fNbytes: 100
  };
}

class FakeAdapter {
  constructor() {
    this.directories = new Map([
      [
        "analysis",
        {
          fKeys: [
            key("deep", "TDirectoryFile"),
            key("profile", "TProfile"),
            key("notes", "TObjString")
          ]
        }
      ],
      [
        "analysis/deep",
        {
          fKeys: [
            key("Events", "TTree"),
            key("Ntuple", "TNtupleD"),
            key("map", "TH2D")
          ]
        }
      ]
    ]);

    this.objects = new Map([
      [
        "analysis/deep/Events;1",
        {
          fEntries: 42,
          fBranches: {
            arr: [
              {
                fName: "energy",
                fClassName: "",
                fTitle: "energy/F",
                _typename: "TBranch",
                fLeaves: { arr: [{ _typename: "TLeafF" }] }
              }
            ]
          }
        }
      ],
      [
        "analysis/deep/Ntuple;1",
        {
          fEntries: 7,
          fBranches: {
            arr: [
              {
                fName: "x",
                fClassName: "",
                fTitle: "x/D",
                _typename: "TBranch",
                fLeaves: { arr: [{ _typename: "TLeafD" }] }
              }
            ]
          }
        }
      ]
    ]);
  }

  listKeys(container) {
    return container.fKeys ?? [];
  }

  async readDirectory(_handle, path) {
    const directory = this.directories.get(path);
    if (!directory) {
      throw new Error(`Diretório ausente: ${path}`);
    }
    return directory;
  }

  async readObject(_handle, path) {
    const object = this.objects.get(path);
    if (!object) {
      throw new Error(`Objeto ausente: ${path}`);
    }
    return object;
  }
}

test("encontra árvores e todos os demais objetos em diretórios aninhados", async () => {
  const adapter = new FakeAdapter();
  const scanner = new RootStructureScanner({
    adapter,
    classifier: new RootObjectClassifier(),
    branchScanner: new BranchScanner()
  });
  const handle = {
    fKeys: [
      key("analysis", "TDirectoryFile"),
      key("overview", "TCanvas"),
      key("trend", "TGraphErrors"),
      key("custom", "MyExperimentObject")
    ]
  };

  const result = await scanner.scan({
    fileId: "file-1",
    fileName: "fixture.root",
    fileSize: 1024,
    handle
  });
  const entries = result.catalog.all();
  const byPath = new Map(entries.map((entry) => [entry.path, entry]));

  assert.equal(
    byPath.get("analysis/deep/Events").category,
    ROOT_CATEGORIES.TREE
  );
  assert.equal(
    byPath.get("analysis/deep/Ntuple").category,
    ROOT_CATEGORIES.TREE
  );
  assert.equal(
    byPath.get("analysis/profile").category,
    ROOT_CATEGORIES.PROFILE
  );
  assert.equal(
    byPath.get("analysis/deep/map").category,
    ROOT_CATEGORIES.HISTOGRAM
  );
  assert.equal(
    byPath.get("overview").category,
    ROOT_CATEGORIES.CANVAS
  );
  assert.equal(
    byPath.get("trend").category,
    ROOT_CATEGORIES.GRAPH
  );
  assert.equal(
    byPath.get("custom").category,
    ROOT_CATEGORIES.OTHER
  );
  assert.equal(
    byPath.get("analysis/deep/Events;1::energy").category,
    ROOT_CATEGORIES.BRANCH
  );
});
