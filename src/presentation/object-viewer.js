export class ObjectViewer {
  #adapter;
  #auditService;
  #status;
  #canvasId;
  #message;

  constructor({ adapter, auditService, status, canvasId, message }) {
    this.#adapter = adapter;
    this.#auditService = auditService;
    this.#status = status;
    this.#canvasId = canvasId;
    this.#message = message;
  }

  async show(entry) {
    this.#status.working(`Carregando ${entry.path}...`);

    try {
      const object = await this.#auditService.loadObject(entry);
      this.#adapter.cleanup(this.#canvasId);
      this.#message.hidden = true;
      await this.#adapter.draw(this.#canvasId, object, entry.drawOption);
      this.#status.success(`Visualizando ${entry.path}.`);
    } catch (error) {
      this.#status.error(this.#messageOf(error));
    }
  }

  clear() {
    this.#adapter.cleanup(this.#canvasId);
    this.#message.hidden = false;
  }

  #messageOf(error) {
    const detail = error instanceof Error ? error.message : String(error);
    return `Falha ao visualizar o objeto: ${detail}`;
  }
}
