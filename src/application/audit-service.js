const MAX_FILES = 20;

export class AuditService {
  #adapter;
  #scanner;
  #handles = new Map();
  #results = [];

  constructor({ adapter, scanner }) {
    this.#adapter = adapter;
    this.#scanner = scanner;
  }

  async audit(fileList, onProgress = () => {}) {
    const files = Array.from(fileList ?? []);
    this.#validateFiles(files);
    this.reset();

    for (const [index, file] of files.entries()) {
      const fileId = this.#fileId(file, index);
      onProgress({ fileName: file.name, path: "/", className: "TFile" });
      const handle = await this.#adapter.openFile(file);
      this.#handles.set(fileId, handle);

      const result = await this.#scanner.scan({
        fileId,
        fileName: file.name,
        fileSize: file.size,
        handle,
        onProgress
      });

      this.#results.push(result);
    }

    return this.results();
  }

  async loadObject(entry) {
    const handle = this.#handles.get(entry.fileId);
    if (!handle) {
      throw new Error("O arquivo associado ao objeto não está mais aberto.");
    }
    return this.#adapter.readObject(handle, entry.readPath);
  }

  results() {
    return Object.freeze([...this.#results]);
  }

  reset() {
    this.#handles.clear();
    this.#results = [];
  }

  #validateFiles(files) {
    if (files.length === 0) {
      throw new Error("Selecione ao menos um arquivo ROOT.");
    }
    if (files.length > MAX_FILES) {
      throw new Error(`Selecione no máximo ${MAX_FILES} arquivos por auditoria.`);
    }
  }

  #fileId(file, index) {
    return `${index}:${file.name}:${file.size}:${file.lastModified}`;
  }
}
