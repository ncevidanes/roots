import test from "node:test";
import assert from "node:assert/strict";

import { AuditService } from "../src/application/audit-service.js";
import { AuditCatalog } from "../src/domain/audit-entry.js";

class FakeAdapter {
  opened = [];

  async openFile(file) {
    this.opened.push(file.name);
    return { fileName: file.name };
  }

  async readObject(handle, path) {
    return { handle, path };
  }
}

class FakeScanner {
  async scan(input) {
    return {
      fileId: input.fileId,
      fileName: input.fileName,
      fileSize: input.fileSize,
      durationMs: 1,
      catalog: new AuditCatalog()
    };
  }
}

function localFile(name, size, lastModified) {
  return { name, size, lastModified };
}

test("audita vários arquivos sequencialmente", async () => {
  const adapter = new FakeAdapter();
  const service = new AuditService({
    adapter,
    scanner: new FakeScanner()
  });
  const files = [
    localFile("primeiro.root", 100, 1),
    localFile("segundo.root", 200, 2)
  ];

  const results = await service.audit(files);

  assert.deepEqual(adapter.opened, ["primeiro.root", "segundo.root"]);
  assert.equal(results.length, 2);
  assert.equal(results[0].fileName, "primeiro.root");
  assert.equal(results[1].fileName, "segundo.root");
});

test("limita a quantidade de arquivos por sessão", async () => {
  const service = new AuditService({
    adapter: new FakeAdapter(),
    scanner: new FakeScanner()
  });
  const files = Array.from(
    { length: 21 },
    (_, index) => localFile(`${index}.root`, 1, index)
  );

  await assert.rejects(() => service.audit(files), /no máximo 20/);
});
