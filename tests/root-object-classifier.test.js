import test from "node:test";
import assert from "node:assert/strict";

import {
  ROOT_CATEGORIES,
  RootObjectClassifier
} from "../src/domain/root-object-classifier.js";

const classifier = new RootObjectClassifier();

test("classifica estruturas colunares e diretórios", () => {
  assert.equal(
    classifier.describe("TDirectoryFile").category,
    ROOT_CATEGORIES.DIRECTORY
  );
  assert.equal(
    classifier.describe("TTree").category,
    ROOT_CATEGORIES.TREE
  );
  assert.equal(
    classifier.describe("TNtupleD").category,
    ROOT_CATEGORIES.TREE
  );
  assert.equal(
    classifier.describe("ROOT::Experimental::RNTuple").category,
    ROOT_CATEGORIES.RNTUPLE
  );
});

test("classifica classes desenháveis documentadas pelo JSROOT", () => {
  const cases = [
    ["TH1D", ROOT_CATEGORIES.HISTOGRAM, "hist"],
    ["TH2F", ROOT_CATEGORIES.HISTOGRAM, "colz"],
    ["TH3D", ROOT_CATEGORIES.HISTOGRAM, "box"],
    ["TProfile", ROOT_CATEGORIES.PROFILE, "hist"],
    ["TProfile2D", ROOT_CATEGORIES.PROFILE, "colz"],
    ["TGraphErrors", ROOT_CATEGORIES.GRAPH, ""],
    ["TMultiGraph", ROOT_CATEGORIES.GRAPH, ""],
    ["TF1", ROOT_CATEGORIES.FUNCTION, ""],
    ["TSpline3", ROOT_CATEGORIES.FUNCTION, ""],
    ["TEfficiency", ROOT_CATEGORIES.EFFICIENCY, ""],
    ["TCanvas", ROOT_CATEGORIES.CANVAS, ""],
    ["TGeoManager", ROOT_CATEGORIES.GEOMETRY, ""]
  ];

  cases.forEach(([className, category, drawOption]) => {
    const result = classifier.describe(className);
    assert.equal(result.category, category, className);
    assert.equal(result.drawable, true, className);
    assert.equal(result.drawOption, drawOption, className);
  });
});

test("preserva classes desconhecidas no catálogo", () => {
  const result = classifier.describe("ClasseDoExperimento");
  assert.equal(result.category, ROOT_CATEGORIES.OTHER);
  assert.equal(result.drawable, false);
});
