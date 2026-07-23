import test from "node:test";
import assert from "node:assert/strict";

import { RootPath } from "../src/domain/root-path.js";

test("constrói caminhos ROOT imutáveis", () => {
  const root = RootPath.root();
  const directory = root.child("analysis");
  const histogram = directory.child("energy");

  assert.equal(root.value(), "");
  assert.equal(directory.value(), "analysis");
  assert.equal(histogram.value(), "analysis/energy");
  assert.equal(histogram.depth(), 2);
  assert.equal(histogram.withCycle(3), "analysis/energy;3");
});

test("rejeita segmentos vazios", () => {
  assert.throws(() => RootPath.root().child("  "), /não pode ser vazio/);
});
