export const ROOT_CATEGORIES = Object.freeze({
  DIRECTORY: "directory",
  TREE: "tree",
  RNTUPLE: "rntuple",
  HISTOGRAM: "histogram",
  PROFILE: "profile",
  GRAPH: "graph",
  FUNCTION: "function",
  EFFICIENCY: "efficiency",
  CANVAS: "canvas",
  GEOMETRY: "geometry",
  GRAPHICAL: "graphical",
  COLLECTION: "collection",
  METADATA: "metadata",
  OTHER: "other",
  BRANCH: "branch",
  WARNING: "warning"
});

const DESCRIPTORS = Object.freeze({
  [ROOT_CATEGORIES.DIRECTORY]: descriptor("Diretório"),
  [ROOT_CATEGORIES.TREE]: descriptor("Árvore"),
  [ROOT_CATEGORIES.RNTUPLE]: descriptor("RNTuple"),
  [ROOT_CATEGORIES.HISTOGRAM]: descriptor("Histograma", true),
  [ROOT_CATEGORIES.PROFILE]: descriptor("Perfil", true),
  [ROOT_CATEGORIES.GRAPH]: descriptor("Gráfico", true),
  [ROOT_CATEGORIES.FUNCTION]: descriptor("Função", true),
  [ROOT_CATEGORIES.EFFICIENCY]: descriptor("Eficiência", true),
  [ROOT_CATEGORIES.CANVAS]: descriptor("Canvas/Pad", true),
  [ROOT_CATEGORIES.GEOMETRY]: descriptor("Geometria", true),
  [ROOT_CATEGORIES.GRAPHICAL]: descriptor("Objeto gráfico", true),
  [ROOT_CATEGORIES.COLLECTION]: descriptor("Coleção"),
  [ROOT_CATEGORIES.METADATA]: descriptor("Metadado"),
  [ROOT_CATEGORIES.OTHER]: descriptor("Outro objeto")
});

const RULES = Object.freeze([
  rule(ROOT_CATEGORIES.DIRECTORY, (name) => /^(TDirectory|TFile)/.test(name)),
  rule(ROOT_CATEGORIES.RNTUPLE, (name) => name.includes("RNTuple")),
  rule(ROOT_CATEGORIES.TREE, (name) => /^(TTree|TNtuple|TChain)/.test(name)),
  rule(ROOT_CATEGORIES.PROFILE, (name) => name.startsWith("TProfile")),
  rule(
    ROOT_CATEGORIES.HISTOGRAM,
    (name) => /^(TH[123n]|THStack)/.test(name)
  ),
  rule(
    ROOT_CATEGORIES.GRAPH,
    (name) => /^(TGraph|TMultiGraph|TScatter)/.test(name)
  ),
  rule(
    ROOT_CATEGORIES.FUNCTION,
    (name) => /^(TF[123]|TF12|TSpline)/.test(name)
  ),
  rule(ROOT_CATEGORIES.EFFICIENCY, (name) => name === "TEfficiency"),
  rule(
    ROOT_CATEGORIES.CANVAS,
    (name) => /^(TCanvas|TPad|TRatioPlot)/.test(name)
  ),
  rule(ROOT_CATEGORIES.GEOMETRY, (name) => name.startsWith("TGeo")),
  rule(
    ROOT_CATEGORIES.GRAPHICAL,
    (name) => /^(TPoly|TGaxis|TEllipse|TArrow|TLegend|TLatex|TMathText)/.test(name)
  ),
  rule(
    ROOT_CATEGORIES.COLLECTION,
    (name) => /^(TList|TObjArray|TClonesArray|TMap|TSet|THash)/.test(name)
  ),
  rule(
    ROOT_CATEGORIES.METADATA,
    (name) => /^(TNamed|TObjString|TParameter|TStreamerInfo)/.test(name)
  )
]);

function descriptor(label, drawable = false) {
  return Object.freeze({ label, drawable });
}

function rule(category, matches) {
  return Object.freeze({ category, matches });
}

function normalizedClassName(className) {
  const value = String(className ?? "").trim();
  return value || "TObject";
}

function drawOptionFor(className, category) {
  if (/^(TH2|TProfile2D)/.test(className)) {
    return "colz";
  }
  if (className.startsWith("TH3")) {
    return "box";
  }
  if (
    category === ROOT_CATEGORIES.HISTOGRAM
    || category === ROOT_CATEGORIES.PROFILE
  ) {
    return "hist";
  }
  return "";
}

export class RootObjectClassifier {
  describe(className) {
    const normalized = normalizedClassName(className);
    const selectedRule = RULES.find((candidate) => candidate.matches(normalized));
    const category = selectedRule?.category ?? ROOT_CATEGORIES.OTHER;
    const base = DESCRIPTORS[category];

    return Object.freeze({
      category,
      label: base.label,
      drawable: base.drawable,
      drawOption: drawOptionFor(normalized, category),
      isDirectory: category === ROOT_CATEGORIES.DIRECTORY,
      isTree: category === ROOT_CATEGORIES.TREE,
      isRNTuple: category === ROOT_CATEGORIES.RNTUPLE
    });
  }
}
