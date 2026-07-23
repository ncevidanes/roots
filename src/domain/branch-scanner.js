import { AuditEntry } from "./audit-entry.js";
import { ROOT_CATEGORIES } from "./root-object-classifier.js";

const BRANCH_LABEL = "Branch";

export class BranchScanner {
  scan({ fileId, treePath, treeDepth, treeObject }) {
    const roots = this.#childrenOf(treeObject);
    const pending = this.#initialPending(roots);
    const entries = [];

    while (pending.length > 0) {
      const current = pending.pop();
      entries.push(this.#toEntry(fileId, treePath, treeDepth, current));
      this.#appendChildren(pending, current);
    }

    return entries;
  }

  #initialPending(branches) {
    return [...branches]
      .reverse()
      .map((branch) => ({ branch, parentPath: "", branchDepth: 0 }));
  }

  #appendChildren(pending, current) {
    const children = this.#childrenOf(current.branch);
    const branchPath = this.#branchPath(current.parentPath, current.branch);
    const childDepth = current.branchDepth + 1;

    [...children].reverse().forEach((branch) => {
      pending.push({ branch, parentPath: branchPath, branchDepth: childDepth });
    });
  }

  #toEntry(fileId, treePath, treeDepth, current) {
    const branchPath = this.#branchPath(current.parentPath, current.branch);
    const storageClass = this.#storageClass(current.branch);
    const payloadType = this.#payloadType(current.branch);

    return new AuditEntry({
      fileId,
      path: `${treePath}::${branchPath}`,
      readPath: treePath,
      name: branchPath,
      className: payloadType,
      category: ROOT_CATEGORIES.BRANCH,
      categoryLabel: BRANCH_LABEL,
      depth: treeDepth + current.branchDepth + 1,
      details: {
        storageClass,
        title: String(current.branch?.fTitle ?? "")
      }
    });
  }

  #branchPath(parentPath, branch) {
    const name = String(branch?.fName ?? "(sem nome)");
    return parentPath ? `${parentPath}.${name}` : name;
  }

  #childrenOf(holder) {
    const branches = holder?.fBranches?.arr;
    return Array.isArray(branches) ? branches : [];
  }

  #storageClass(branch) {
    return String(branch?._typename ?? "TBranch");
  }

  #payloadType(branch) {
    const declaredClass = String(branch?.fClassName ?? "").trim();
    if (declaredClass) {
      return declaredClass;
    }

    const leafTypes = this.#leafTypes(branch);
    if (leafTypes.length > 0) {
      return leafTypes.join(" | ");
    }

    return this.#typeFromTitle(branch) || this.#storageClass(branch);
  }

  #leafTypes(branch) {
    const leaves = branch?.fLeaves?.arr;
    if (!Array.isArray(leaves)) {
      return [];
    }

    const types = leaves
      .map((leaf) => leaf?.fTypeName || leaf?._typename || leaf?.fClassName)
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);

    return [...new Set(types)];
  }

  #typeFromTitle(branch) {
    const title = String(branch?.fTitle ?? "");
    const separator = title.lastIndexOf("/");
    if (separator < 0 || separator === title.length - 1) {
      return "";
    }
    return title.slice(separator + 1);
  }
}
