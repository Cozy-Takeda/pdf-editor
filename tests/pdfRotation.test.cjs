const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");
const { PDFDocument, StandardFonts, degrees } = require("pdf-lib");
const pdfjs = require("pdfjs-dist/build/pdf.js");
const standardFontDataUrl = path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts/");

// Load the production TypeScript without adding a test runner dependency.
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { buildPdf } = require(path.join(__dirname, "../src/lib/pdfUtils.ts"));

async function sourceFile(rotations, cropped = false) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const rotation of rotations) {
    const page = doc.addPage([400, 600]);
    page.setRotation(degrees(rotation));
    if (cropped) page.setCropBox(30, 40, 320, 480);
    page.drawText(`SOURCE_${doc.getPageCount()}`, { x: 100, y: 200, font });
  }
  return new File([await doc.save()], "source.pdf", { type: "application/pdf" });
}

function pageItem(pageIndex, rotation, sourceFileIndex = 0) {
  return { id: `${sourceFileIndex}-${pageIndex}`, pageIndex, sourceFileIndex,
    rotation, thumbnail: "", selected: false };
}

test("export combines existing and added rotation for every quarter turn", async () => {
  const file = await sourceFile([0, 90, 180, 270]);
  for (const added of [0, 90, 180, 270]) {
    const pages = [0, 1, 2, 3].map((i) => pageItem(i, added));
    const output = await PDFDocument.load(await buildPdf([file], pages));
    assert.deepEqual(output.getPages().map((p) => p.getRotation().angle),
      [0, 90, 180, 270].map((angle) => (angle + added) % 360));
  }
});

test("reordering, deleting and merging preserve each page's rotation and content", async () => {
  const files = [await sourceFile([90, 180]), await sourceFile([270])];
  const bytes = await buildPdf(files, [pageItem(0, 90, 1), pageItem(1, 270)]);
  const output = await PDFDocument.load(bytes);
  assert.deepEqual(output.getPages().map((p) => p.getRotation().angle), [0, 90]);
  const task = pdfjs.getDocument({ data: bytes, disableFontFace: true, standardFontDataUrl });
  const doc = await task.promise;
  try {
    assert.equal(doc.numPages, 2);
    for (const [index, expected] of [[1, "SOURCE_1"], [2, "SOURCE_2"]]) {
      const page = await doc.getPage(index);
      const text = await page.getTextContent();
      assert.equal(text.items.find((item) => item.str)?.str, expected);
    }
  } finally {
    await task.destroy();
  }
});

for (const cropped of [false, true]) {
  for (const rotation of [0, 90, 180, 270]) {
    for (const position of ["bottom-left", "bottom-center", "bottom-right"]) {
      test(`page number is upright at ${position}, rotation ${rotation}, crop ${cropped}`, async () => {
        // Existing 90° rotation also exercises the source-orientation baseline.
        const file = await sourceFile([90], cropped);
        const bytes = await buildPdf([file], [pageItem(0, rotation)], {
          startPage: 1, endPage: 1, startNumber: 7, position, fontSize: 12,
        });
        const task = pdfjs.getDocument({ data: bytes, disableFontFace: true, standardFontDataUrl });
        const doc = await task.promise;
        try {
          const page = await doc.getPage(1);
          const viewport = page.getViewport({ scale: 1 });
          const content = await page.getTextContent();
          const number = content.items.find((item) => item.str === "7");
          assert.ok(number, "page number must remain inside the visible page");
          const matrix = pdfjs.Util.transform(viewport.transform, number.transform);
          const expectedX = position === "bottom-left" ? 20
            : position === "bottom-right" ? viewport.width - number.width - 20
            : (viewport.width - number.width) / 2;
          assert.ok(Math.abs(matrix[4] - expectedX) < 0.01, "horizontal alignment");
          assert.ok(Math.abs(matrix[5] - (viewport.height - 20)) < 0.01, "bottom margin");
          assert.ok(matrix[0] > 0 && Math.abs(matrix[1]) < 0.01, "upright baseline");
        } finally {
          await task.destroy();
        }
      });
    }
  }
}
