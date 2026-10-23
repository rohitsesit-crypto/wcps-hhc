/**
 * Personalises a WCPS report PDF.
 *
 * The 27 reports in `public/` (Report_01.pdf … Report_27.pdf) already hold the
 * full layout and copy; only two fields on page 1 need to be filled in:
 *
 *   PARTICIPANT   ->  the participant's name
 *   WCPS          ->  "<score>/100 - <label>"
 *
 * The anchors in `lib/reportLayout.ts` are generated from the templates
 * themselves, so each report's own vertical offsets are respected. Before a
 * value is drawn, its empty value slot is repainted with the panel colour, which
 * also removes the literal `[NAME]` / `[XX]/100 - [WCPS LABEL]` placeholder that
 * still survives in Report_16.
 *
 * This replaces the old DOCX templating + LibreOffice conversion step: the PDF
 * that ships in `public/` is the artefact that goes out.
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import {
  REPORT_LAYOUT,
  REPORT_NAME_COLOR,
  REPORT_NAME_SIZE,
  REPORT_PANEL_FILL,
  REPORT_VALUE_X,
  REPORT_WCPS_COLOR,
  REPORT_WCPS_SIZE,
} from "./reportLayout";

export type ReportFill = {
  name: string;
  wcpsDisplay: string;
};

/**
 * pdf-lib encodes the standard fonts as WinAnsi, so characters outside that set
 * (curly quotes, en/em dashes, non-Latin scripts) would throw while drawing.
 * They are folded to their closest ASCII equivalent before the text is written.
 */
function winAnsiSafe(value: string): string {
  return value
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fills the participant name and the WCPS value into the report template and
 * returns the finished PDF as a Buffer.
 *
 * `reportNumber` is 1–27 and selects which layout anchors apply.
 */
export async function fillReportPdf(
  template: Buffer | Uint8Array,
  reportNumber: number,
  fill: ReportFill,
): Promise<Buffer> {
  const anchor = REPORT_LAYOUT[reportNumber];
  if (!anchor) throw new Error(`No report layout is defined for report ${reportNumber}.`);

  const pdf = await PDFDocument.load(template, { ignoreEncryption: true });
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Page 1 carries the PARTICIPANT / WCPS fields.
  const page = pdf.getPages()[0];
  const panel = rgb(...REPORT_PANEL_FILL);

  // Clear the (empty) value slots so no placeholder can survive underneath.
  for (const slot of [anchor.nameErase, anchor.wcpsErase]) {
    const [x, y, width, height] = slot;
    page.drawRectangle({ x, y, width, height, color: panel });
  }

  const name = winAnsiSafe(fill.name);
  if (name) {
    page.drawText(name, {
      x: REPORT_VALUE_X,
      y: anchor.nameBaseline,
      size: REPORT_NAME_SIZE,
      font: regular,
      color: rgb(...REPORT_NAME_COLOR),
    });
  }

  const wcps = winAnsiSafe(fill.wcpsDisplay);
  if (wcps) {
    page.drawText(wcps, {
      x: REPORT_VALUE_X,
      y: anchor.wcpsBaseline,
      size: REPORT_WCPS_SIZE,
      font: bold,
      color: rgb(...REPORT_WCPS_COLOR),
    });
  }

  return Buffer.from(await pdf.save());
}

/** Turns "Priya A. Sharma" into "Priya_A_Sharma" for safe filenames. */
export function safeFileStem(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_");
  return (cleaned || "Participant").slice(0, 60);
}
