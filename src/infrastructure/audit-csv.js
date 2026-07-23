const FORMULA_PREFIX = /^[=+\-@]/;

export class AuditCsvSerializer {
  serialize(results) {
    const rows = [
      [
        "Arquivo",
        "Caminho",
        "Categoria",
        "Classe",
        "Ciclo",
        "Eventos",
        "Branches",
        "Detalhes"
      ]
    ];

    results.forEach((result) => {
      result.catalog.all().forEach((entry) => {
        rows.push(this.#entryRow(result.fileName, entry));
      });
    });

    return rows
      .map((row) => row.map((cell) => this.#escape(cell)).join(","))
      .join("\r\n");
  }

  #entryRow(fileName, entry) {
    return [
      fileName,
      entry.path,
      entry.categoryLabel,
      entry.className,
      entry.details.cycle ?? "",
      entry.details.entries ?? "",
      entry.details.topLevelBranches ?? "",
      entry.details.message
        ?? entry.details.title
        ?? entry.details.storageClass
        ?? ""
    ];
  }

  #escape(value) {
    const text = this.#safeSpreadsheetText(String(value ?? ""));
    return `"${text.replaceAll('"', '""')}"`;
  }

  #safeSpreadsheetText(value) {
    if (!FORMULA_PREFIX.test(value)) {
      return value;
    }
    return `'${value}`;
  }
}

export class CsvDownloader {
  download(csv, fileName) {
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
