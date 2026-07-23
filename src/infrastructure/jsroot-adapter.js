import {
  cleanup,
  draw,
  openFile
} from "https://root.cern/js/7.11.0/modules/main.mjs";

export const JSROOT_VERSION = "7.11.0";

export class JsRootAdapter {
  async openFile(file) {
    return openFile(file);
  }

  listKeys(container) {
    const keys = container?.fKeys;
    return Array.isArray(keys) ? keys : [];
  }

  async readDirectory(fileHandle, path) {
    const directory = await fileHandle.readDirectory(path);
    if (!directory) {
      throw new Error(`Diretório ROOT não encontrado: ${path}`);
    }
    return directory;
  }

  async readObject(fileHandle, path) {
    const object = await fileHandle.readObject(path);
    if (!object) {
      throw new Error(`Objeto ROOT não encontrado: ${path}`);
    }
    return object;
  }

  async draw(target, object, option) {
    return draw(target, object, option);
  }

  cleanup(target) {
    cleanup(target);
    const element = typeof target === "string"
      ? document.getElementById(target)
      : target;

    if (element) {
      element.replaceChildren();
    }
  }
}
