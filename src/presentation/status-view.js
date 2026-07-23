const STATES = Object.freeze(["working", "success", "error"]);

export class StatusView {
  #text;
  #light;

  constructor({ text, light }) {
    this.#text = text;
    this.#light = light;
  }

  idle(message = "Aguardando arquivo...") {
    this.#show(message, "");
  }

  working(message) {
    this.#show(message, "working");
  }

  success(message) {
    this.#show(message, "success");
  }

  error(message) {
    this.#show(message, "error");
  }

  #show(message, state) {
    this.#text.textContent = message;
    STATES.forEach((name) => this.#light.classList.remove(name));
    if (state) {
      this.#light.classList.add(state);
    }
  }
}
