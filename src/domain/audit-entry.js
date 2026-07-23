const DEFAULT_DETAILS = Object.freeze({});

export class AuditEntry {
  constructor({
    fileId,
    path,
    readPath,
    name,
    className,
    category,
    categoryLabel,
    depth,
    drawable = false,
    drawOption = "",
    details = DEFAULT_DETAILS
  }) {
    this.fileId = String(fileId);
    this.path = String(path);
    this.readPath = String(readPath);
    this.name = String(name);
    this.className = String(className);
    this.category = String(category);
    this.categoryLabel = String(categoryLabel);
    this.depth = Number(depth);
    this.drawable = Boolean(drawable);
    this.drawOption = String(drawOption);
    this.details = Object.freeze({ ...details });
    Object.freeze(this);
  }

  static warning({ fileId, path, depth, message }) {
    return new AuditEntry({
      fileId,
      path,
      readPath: "",
      name: "Falha de leitura",
      className: "Warning",
      category: "warning",
      categoryLabel: "Aviso",
      depth,
      details: { message }
    });
  }
}

export class AuditCatalog {
  #entries = [];

  add(entry) {
    this.#entries.push(entry);
  }

  addAll(entries) {
    entries.forEach((entry) => this.add(entry));
  }

  all() {
    return Object.freeze([...this.#entries]);
  }

  size() {
    return this.#entries.length;
  }

  countCategory(category) {
    return this.#entries.filter((entry) => entry.category === category).length;
  }

  countWhere(predicate) {
    return this.#entries.filter(predicate).length;
  }
}
