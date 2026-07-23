const MAX_INDENT_LEVEL = 12;

export class ReportView {
  #report;
  #summary;

  constructor({ report, summary }) {
    this.#report = report;
    this.#summary = summary;
  }

  render(results, onVisualize) {
    const fragment = document.createDocumentFragment();
    results.forEach((result) => {
      fragment.append(this.#fileReport(result, onVisualize));
    });

    this.#report.replaceChildren(fragment);
    this.#renderSummary(results);
  }

  clear(message) {
    const paragraph = document.createElement("p");
    paragraph.className = "empty-state";
    paragraph.textContent = message;
    this.#report.replaceChildren(paragraph);
    this.#summary.hidden = true;
    this.#summary.replaceChildren();
  }

  #fileReport(result, onVisualize) {
    const section = document.createElement("section");
    section.className = "file-report";
    section.append(this.#fileHeading(result));

    const fragment = document.createDocumentFragment();
    result.catalog.all().forEach((entry) => {
      fragment.append(this.#entryRow(entry, onVisualize));
    });
    section.append(fragment);

    return section;
  }

  #fileHeading(result) {
    const header = document.createElement("header");
    header.className = "file-heading";

    const title = document.createElement("h2");
    title.textContent = result.fileName;
    title.title = result.fileName;

    const metadata = document.createElement("span");
    metadata.textContent = [
      this.#formatBytes(result.fileSize),
      `${result.catalog.size()} itens`,
      `${Math.round(result.durationMs)} ms`
    ].join(" · ");

    header.append(title, metadata);
    return header;
  }

  #entryRow(entry, onVisualize) {
    const row = document.createElement("div");
    row.className = `report-row category-${entry.category}`;

    const name = document.createElement("span");
    name.className = "entry-name";
    name.textContent = this.#entryName(entry);
    name.title = entry.path;
    name.style.paddingLeft = `${10 + this.#indent(entry.depth)}px`;

    const type = document.createElement("span");
    type.className = "entry-type";
    type.textContent = entry.className;
    type.title = `${entry.categoryLabel}: ${entry.className}`;

    const action = document.createElement("span");
    action.className = "entry-action";
    this.#appendAction(action, entry, onVisualize);

    row.append(name, type, action);
    return row;
  }

  #appendAction(container, entry, onVisualize) {
    if (!entry.drawable) {
      const detail = document.createElement("span");
      detail.className = "entry-detail";
      detail.textContent = this.#entryDetail(entry);
      container.append(detail);
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Visualizar";
    button.setAttribute("aria-label", `Visualizar ${entry.path}`);
    button.addEventListener("click", () => onVisualize(entry));
    container.append(button);
  }

  #entryName(entry) {
    if (entry.category === "branch") {
      return `↳ ${entry.name}`;
    }
    if (entry.category === "directory") {
      return `▾ ${entry.name}/`;
    }
    return entry.name;
  }

  #entryDetail(entry) {
    if (entry.category === "tree") {
      const entries = this.#formatNumber(entry.details.entries ?? 0);
      const branches = this.#formatNumber(entry.details.topLevelBranches ?? 0);
      return `${entries} eventos · ${branches} branches`;
    }
    if (entry.category === "branch") {
      return String(entry.details.storageClass ?? "");
    }
    if (entry.category === "warning") {
      return String(entry.details.message ?? "");
    }
    return entry.categoryLabel;
  }

  #renderSummary(results) {
    const entries = results.flatMap((result) => result.catalog.all());
    const summary = [
      { value: results.length, label: "arquivos" },
      {
        value: entries.filter((entry) => entry.category === "directory").length,
        label: "diretórios"
      },
      {
        value: entries.filter((entry) => (
          entry.category === "tree" || entry.category === "rntuple"
        )).length,
        label: "estruturas colunares"
      },
      {
        value: entries.filter((entry) => entry.category === "branch").length,
        label: "branches"
      },
      {
        value: entries.filter((entry) => entry.drawable).length,
        label: "visualizáveis"
      },
      {
        value: entries.filter((entry) => entry.category === "other").length,
        label: "outras classes"
      }
    ];

    const fragment = document.createDocumentFragment();
    summary.forEach((item) => fragment.append(this.#summaryItem(item)));
    this.#summary.replaceChildren(fragment);
    this.#summary.hidden = false;
  }

  #summaryItem(item) {
    const container = document.createElement("div");
    container.className = "summary-item";

    const value = document.createElement("strong");
    value.textContent = this.#formatNumber(item.value);

    const label = document.createElement("span");
    label.textContent = item.label;

    container.append(value, label);
    return container;
  }

  #indent(depth) {
    return Math.min(Number(depth) || 0, MAX_INDENT_LEVEL) * 14;
  }

  #formatNumber(value) {
    return new Intl.NumberFormat("pt-BR").format(Number(value) || 0);
  }

  #formatBytes(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024) {
      return `${value} B`;
    }

    const units = ["KiB", "MiB", "GiB", "TiB"];
    let normalized = value / 1024;
    let unitIndex = 0;

    while (normalized >= 1024 && unitIndex < units.length - 1) {
      normalized /= 1024;
      unitIndex += 1;
    }

    return `${normalized.toFixed(1)} ${units[unitIndex]}`;
  }
}
