import { AuditService } from "./application/audit-service.js";
import { RootStructureScanner } from "./application/root-structure-scanner.js";
import { BranchScanner } from "./domain/branch-scanner.js";
import { RootObjectClassifier } from "./domain/root-object-classifier.js";
import {
  AuditCsvSerializer,
  CsvDownloader
} from "./infrastructure/audit-csv.js";
import { JsRootAdapter } from "./infrastructure/jsroot-adapter.js";
import { ObjectViewer } from "./presentation/object-viewer.js";
import { ReportView } from "./presentation/report-view.js";
import { StatusView } from "./presentation/status-view.js";

const elements = {
  fileInput: document.getElementById("file-input"),
  auditButton: document.getElementById("audit-button"),
  csvButton: document.getElementById("csv-button"),
  report: document.getElementById("report"),
  summary: document.getElementById("summary"),
  statusText: document.getElementById("status-text"),
  statusLight: document.getElementById("status-light"),
  canvasMessage: document.getElementById("canvas-message")
};

const adapter = new JsRootAdapter();
const classifier = new RootObjectClassifier();
const branchScanner = new BranchScanner();
const scanner = new RootStructureScanner({
  adapter,
  classifier,
  branchScanner
});
const auditService = new AuditService({ adapter, scanner });
const status = new StatusView({
  text: elements.statusText,
  light: elements.statusLight
});
const reportView = new ReportView({
  report: elements.report,
  summary: elements.summary
});
const objectViewer = new ObjectViewer({
  adapter,
  auditService,
  status,
  canvasId: "drawing-canvas",
  message: elements.canvasMessage
});
const csvSerializer = new AuditCsvSerializer();
const csvDownloader = new CsvDownloader();

elements.auditButton.addEventListener("click", runAudit);
elements.csvButton.addEventListener("click", exportCsv);
elements.fileInput.addEventListener("change", handleFileSelection);

async function runAudit() {
  setWorkingState(true);
  objectViewer.clear();
  reportView.clear("Mapeando a hierarquia ROOT...");

  try {
    const results = await auditService.audit(
      elements.fileInput.files,
      showProgress
    );
    reportView.render(results, (entry) => objectViewer.show(entry));
    elements.csvButton.disabled = false;
    status.success(completionMessage(results));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    reportView.clear(`Auditoria interrompida: ${message}`);
    status.error(message);
  } finally {
    setWorkingState(false);
  }
}

function exportCsv() {
  const results = auditService.results();
  if (results.length === 0) {
    status.error("Execute uma auditoria antes de exportar.");
    return;
  }

  const csv = csvSerializer.serialize(results);
  const baseName = results.length === 1
    ? rootBaseName(results[0].fileName)
    : "multiplos_arquivos_root";

  csvDownloader.download(csv, `${baseName}_auditoria.csv`);
  status.success("Relatório CSV exportado.");
}

function handleFileSelection() {
  const count = elements.fileInput.files.length;
  elements.csvButton.disabled = true;
  auditService.reset();
  objectViewer.clear();

  if (count === 0) {
    reportView.clear("Selecione um ou mais arquivos .root para iniciar.");
    status.idle();
    return;
  }

  reportView.clear(`${count} arquivo(s) selecionado(s).`);
  status.idle(`${count} arquivo(s) pronto(s) para auditoria.`);
}

function showProgress(progress) {
  status.working(
    `Mapeando ${progress.fileName}: ${progress.path} [${progress.className}]`
  );
}

function setWorkingState(isWorking) {
  elements.auditButton.disabled = isWorking;
  elements.fileInput.disabled = isWorking;
  if (isWorking) {
    elements.csvButton.disabled = true;
  }
}

function completionMessage(results) {
  const objectCount = results.reduce(
    (total, result) => total + result.catalog.size(),
    0
  );
  return `Auditoria concluída: ${results.length} arquivo(s), ${objectCount} itens.`;
}

function rootBaseName(fileName) {
  return String(fileName).replace(/\.root$/i, "") || "auditoria";
}
