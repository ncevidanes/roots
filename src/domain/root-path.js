export class RootPath {
  #segments;

  constructor(segments = []) {
    this.#segments = Object.freeze([...segments]);
    Object.freeze(this);
  }

  static root() {
    return new RootPath();
  }

  child(name) {
    const segment = String(name ?? "").trim();
    if (!segment) {
      throw new Error("Um segmento ROOT não pode ser vazio.");
    }
    return new RootPath([...this.#segments, segment]);
  }

  depth() {
    return this.#segments.length;
  }

  value() {
    return this.#segments.join("/");
  }

  displayValue() {
    return this.value() || "/";
  }

  withCycle(cycle) {
    const path = this.value();
    const numericCycle = Number(cycle);
    if (!Number.isInteger(numericCycle) || numericCycle < 1) {
      return path;
    }
    return `${path};${numericCycle}`;
  }
}
