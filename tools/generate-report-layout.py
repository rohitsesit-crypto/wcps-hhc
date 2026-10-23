"""Regenerate `lib/reportLayout.ts` from the report PDFs in `public/`.

Run from the Next.js project root:

    python3 tools/generate-report-layout.py

For each `public/Report_XX.pdf` (page 1) it:
  * locates the `PARTICIPANT` and `WCPS` field labels (real text in every template)
  * takes each label's character baseline (PyMuPDF rawdict origin) as reference
  * locates the empty value slot beside each label (the inner light panel)
  * applies the baseline offset measured on Report_16, the only template that
    still carried literal `[NAME]` / `[XX]/100 - [WCPS LABEL]` placeholders

Coordinates are emitted in PDF user space (origin bottom-left), which is the
space pdf-lib draws in.

Requires: pip install pymupdf
"""

import glob
import re

import fitz  # PyMuPDF

LABELS = ("PARTICIPANT", "WCPS")
PANEL_FILL = (0.953, 0.973, 0.988)
CALIBRATION_TEMPLATE = 16
OUTPUT = "lib/reportLayout.ts"


def spans(page):
    """Every span: (span, text, baseline origin of its first char)."""
    for block in page.get_text("rawdict")["blocks"]:
        for line in block.get("lines", []):
            for span in line["spans"]:
                text = "".join(c["c"] for c in span["chars"])
                if text.strip():
                    yield span, text, span["chars"][0]["origin"]


def field_label(page, name):
    for span, text, origin in spans(page):
        if text.strip() == name:
            return span, origin
    return None


def inner_panel(page, label_box):
    """The value slot beside a label: the inner light panel in its row."""
    center = (label_box[1] + label_box[3]) / 2
    best, best_area = None, None
    for drawing in page.get_drawings():
        if drawing["type"] != "f" or not drawing.get("fill"):
            continue
        if tuple(round(c, 3) for c in drawing["fill"]) != PANEL_FILL:
            continue
        rect = drawing["rect"]
        if not (165 <= rect.x0 <= 180 and rect.width > 300):
            continue
        if abs((rect.y0 + rect.y1) / 2 - center) > 14:
            continue
        if not (8 <= rect.height <= 22):
            continue
        area = rect.width * rect.height
        if best is None or area < best_area:
            best, best_area = rect, area
    return best


def calibrate(public_dir: str):
    """Value baselines relative to their label's baseline, from Report_16."""
    path = f"{public_dir}/Report_{CALIBRATION_TEMPLATE:02d}.pdf"
    page = fitz.open(path)[0]
    page_spans = list(spans(page))
    deltas, value_x = {}, None
    for token, label in (("[NAME]", "PARTICIPANT"), ("[XX]/100", "WCPS")):
        token_hit = next(((s, o) for s, t, o in page_spans if token in t), None)
        label_hit = field_label(page, label)
        if token_hit and label_hit:
            deltas[label] = token_hit[1][1] - label_hit[1][1]
    for _span, text, origin in page_spans:
        if "[NAME]" in text:
            value_x = round(origin[0], 1)
            break
    return deltas, value_x


def main() -> None:
    public_dir = "public"
    deltas, value_x = calibrate(public_dir)
    if value_x is None:
        raise SystemExit(
            "Could not measure the value column from Report_16.pdf.\n"
            "Keep a copy of the original placeholder template, or set REPORT_VALUE_X manually."
        )

    rows, page_height = [], 841.92
    for path in sorted(glob.glob(f"{public_dir}/Report_*.pdf")):
        number = int(re.search(r"Report_(\d+)", path).group(1))
        page = fitz.open(path)[0]
        page_height = page.rect.height
        entry = {"n": number}
        for label, key in (("PARTICIPANT", "name"), ("WCPS", "wcps")):
            found = field_label(page, label)
            if not found:
                raise SystemExit(f"{path}: could not find the {label} field label.")
            span, origin = found
            panel = inner_panel(page, span["bbox"])
            if panel is None:
                raise SystemExit(f"{path}: could not find the {label} value slot.")
            entry[f"{key}Baseline"] = round(page_height - (origin[1] + deltas.get(label, 0.0)), 1)
            entry[f"{key}Erase"] = [
                round(panel.x0, 1),
                round(page_height - panel.y1, 1),
                round(panel.width, 1),
                round(panel.height, 1),
            ]
        rows.append(entry)

    lines = [
        "/**",
        " * Text anchors for page 1 of every report template in `public/`.",
        " *",
        " * Coordinates are PDF user space (origin bottom-left), which is exactly the",
        " * space pdf-lib draws in. All templates share the horizontal geometry, but",
        " * each has its own vertical offsets, so anchors are tabulated per report.",
        " *",
        " *   nameBaseline / wcpsBaseline - text baseline for the participant name and",
        " *                               for the \"<score>/100 - <label>\" string.",
        " *   nameErase / wcpsErase       - the empty value slot [x, y, width, height],",
        " *                               repainted before the value is stamped.",
        " *",
        " * Regenerate with `python3 tools/generate-report-layout.py`.",
        " */",
        "",
        "/** Value fields start just right of the inner panel edge. */",
        f"export const REPORT_VALUE_X = {value_x};",
        "",
        "/** Font sizes matching the original report fields. */",
        "export const REPORT_NAME_SIZE = 10.6;",
        "export const REPORT_WCPS_SIZE = 13;",
        "",
        "/** Colour of the value panel, used to clear a stale placeholder. */",
        "export const REPORT_PANEL_FILL: [number, number, number] = [0.953, 0.973, 0.988];",
        "",
        "/** Text colours matching the original report fields. */",
        "export const REPORT_NAME_COLOR: [number, number, number] = [0.133, 0.169, 0.2];",
        "export const REPORT_WCPS_COLOR: [number, number, number] = [0.122, 0.306, 0.475];",
        "",
        "export type ReportAnchor = {",
        "  nameBaseline: number;",
        "  wcpsBaseline: number;",
        "  nameErase: [number, number, number, number];",
        "  wcpsErase: [number, number, number, number];",
        "};",
        "",
        "export const REPORT_LAYOUT: Record<number, ReportAnchor> = {",
    ]
    for row in rows:
        lines.append(
            f"  {row['n']}: {{ nameBaseline: {row['nameBaseline']}, wcpsBaseline: {row['wcpsBaseline']}, "
            f"nameErase: [{', '.join(str(v) for v in row['nameErase'])}], "
            f"wcpsErase: [{', '.join(str(v) for v in row['wcpsErase'])}] }},"
        )
    lines.append("};")

    with open(OUTPUT, "w") as handle:
        handle.write("\n".join(lines) + "\n")
    print(f"wrote {OUTPUT} for {len(rows)} reports (page height {page_height})")


if __name__ == "__main__":
    main()
