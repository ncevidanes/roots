import { AuditCatalog, AuditEntry } from "../domain/audit-entry.js";
import { RootPath } from "../domain/root-path.js";

export class RootStructureScanner {
  #adapter;
  #classifier;
  #branchScanner;

  constructor({ adapter, classifier, branchScanner }) {
    this.#adapter = adapter;
    this.#classifier = classifier;
    this.#branchScanner = branchScanner;
  }

  async scan({ fileId, fileName, fileSize, handle, onProgress = () => {} }) {
    const catalog = new AuditCatalog();
    const visitedDirectories = new Set();
    const startedAt = performance.now();

    await this.#scanDirectory({
      fileId,
      fileName,
      handle,
      directory: handle,
      path: RootPath.root(),
      catalog,
      visitedDirectories,
      onProgress
    });

    return Object.freeze({
      fileId,
      fileName,
      fileSize,
      durationMs: performance.now() - startedAt,
      catalog
    });
  }

  async #scanDirectory(context) {
    const directoryPath = context.path.value();
    if (context.visitedDirectories.has(directoryPath)) {
      return;
    }

    context.visitedDirectories.add(directoryPath);
    const keys = this.#adapter.listKeys(context.directory);

    for (const key of keys) {
      await this.#scanKey(context, key);
    }
  }

  async #scanKey(context, key) {
    const name = this.#keyName(key);
    const className = this.#className(key);
    const objectPath = context.path.child(name);
    const description = this.#classifier.describe(className);

    context.onProgress({
      fileName: context.fileName,
      path: objectPath.displayValue(),
      className
    });

    if (description.isDirectory) {
      await this.#scanNestedDirectory(context, key, objectPath, description);
      return;
    }

    if (description.isTree) {
      await this.#scanTree(context, key, objectPath, description);
      return;
    }

    context.catalog.add(
      this.#objectEntry(context.fileId, key, objectPath, description)
    );
  }

  async #scanNestedDirectory(context, key, objectPath, description) {
    context.catalog.add(
      this.#objectEntry(context.fileId, key, objectPath, description)
    );

    try {
      const directory = await this.#adapter.readDirectory(
        context.handle,
        objectPath.value()
      );
      await this.#scanDirectory({
        ...context,
        directory,
        path: objectPath
      });
    } catch (error) {
      context.catalog.add(
        this.#warningEntry(context.fileId, objectPath, error)
      );
    }
  }

  async #scanTree(context, key, objectPath, description) {
    const readPath = objectPath.withCycle(key?.fCycle);

    try {
      const tree = await this.#adapter.readObject(context.handle, readPath);
      const treeEntry = this.#treeEntry(
        context.fileId,
        key,
        objectPath,
        readPath,
        description,
        tree
      );
      const branches = this.#branchScanner.scan({
        fileId: context.fileId,
        treePath: readPath,
        treeDepth: objectPath.depth(),
        treeObject: tree
      });

      context.catalog.add(treeEntry);
      context.catalog.addAll(branches);
    } catch (error) {
      context.catalog.add(
        this.#objectEntry(context.fileId, key, objectPath, description)
      );
      context.catalog.add(
        this.#warningEntry(context.fileId, objectPath, error)
      );
    }
  }

  #objectEntry(fileId, key, objectPath, description) {
    return new AuditEntry({
      fileId,
      path: objectPath.value(),
      readPath: objectPath.withCycle(key?.fCycle),
      name: this.#keyName(key),
      className: this.#className(key),
      category: description.category,
      categoryLabel: description.label,
      depth: objectPath.depth(),
      drawable: description.drawable,
      drawOption: description.drawOption,
      details: this.#keyDetails(key)
    });
  }

  #treeEntry(fileId, key, objectPath, readPath, description, tree) {
    const branches = tree?.fBranches?.arr;
    const branchCount = Array.isArray(branches) ? branches.length : 0;

    return new AuditEntry({
      fileId,
      path: objectPath.value(),
      readPath,
      name: this.#keyName(key),
      className: this.#className(key),
      category: description.category,
      categoryLabel: description.label,
      depth: objectPath.depth(),
      details: {
        ...this.#keyDetails(key),
        entries: Number(tree?.fEntries ?? 0),
        topLevelBranches: branchCount
      }
    });
  }

  #warningEntry(fileId, objectPath, error) {
    return AuditEntry.warning({
      fileId,
      path: objectPath.value(),
      depth: objectPath.depth() + 1,
      message: error instanceof Error ? error.message : String(error)
    });
  }

  #keyDetails(key) {
    return {
      cycle: Number(key?.fCycle ?? 0),
      title: String(key?.fTitle ?? ""),
      bytes: Number(key?.fNbytes ?? 0)
    };
  }

  #keyName(key) {
    return String(key?.fName ?? "(sem nome)");
  }

  #className(key) {
    return String(key?.fClassName ?? "TObject");
  }
}
