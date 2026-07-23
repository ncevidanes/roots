import test from "node:test";
import assert from "node:assert/strict";

import { AuditEntry, AuditCatalog } from "../src/domain/audit-entry.js";
import { AuditCsvSerializer } from "../src/infrastructure/audit-csv.js";

test("gera CSV compatível com RFC 4180 e neutraliza fórmulas", () => {
  const catalog = new AuditCatalog();
  catalog.add(
    new AuditEntry({
      fileId: "file-1",
      path: 'dir/objeto,"especial"',
      readPath: "dir/objeto;1",
      name: "objeto",
      className: "TObjString",
      category: "metadata",
      categoryLabel: "Metadado",
      depth: 2,
      details: { title: "=HYPERLINK(\"https://example.test\")" }
    })
  );

  const csv = new AuditCsvSerializer().serialize([
    {
      fileName: "=arquivo.root",
      catalog
    }
  ]);

  assert.match(csv, /"'=arquivo\.root"/);
  assert.match(csv, /dir\/objeto,""especial""/);
  assert.ok(csv.includes(
    `"'=HYPERLINK(""https://example.test"")"`
  ));
});
