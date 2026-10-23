/**
 * Text anchors for page 1 of every report template in `public/`.
 *
 * Coordinates are PDF user space (origin bottom-left), which is exactly the
 * space pdf-lib draws in. All 27 templates share the same horizontal geometry,
 * but each has its own vertical offsets, so the anchors are tabulated per report
 * instead of being computed at runtime.
 *
 *   nameBaseline / wcpsBaseline - text baseline for the participant name and for
 *                                 the "<score>/100 - <label>" string.
 *   nameErase / wcpsErase       - the empty value slot [x, y, width, height]
 *                                 beside each field label. It is repainted with
 *                                 REPORT_PANEL_FILL before the value is stamped,
 *                                 so a template that still contains a literal
 *                                 placeholder comes out clean (only Report_16
 *                                 contains one today).
 *
 * Values were measured from the shipped templates; regenerate with
 * `tools/generate-report-layout.py` whenever the templates change.
 */

/** Value fields always start just right of the inner panel edge. */
export const REPORT_VALUE_X = 173.1;

/** Font sizes matching the original report fields. */
export const REPORT_NAME_SIZE = 10.6;
export const REPORT_WCPS_SIZE = 13;

/** Colour of the value panel, used to clear a stale placeholder. */
export const REPORT_PANEL_FILL: [number, number, number] = [0.953, 0.973, 0.988];

/** Text colours matching the original report fields. */
export const REPORT_NAME_COLOR: [number, number, number] = [0.133, 0.169, 0.2];
export const REPORT_WCPS_COLOR: [number, number, number] = [0.122, 0.306, 0.475];

export type ReportAnchor = {
  nameBaseline: number;
  wcpsBaseline: number;
  nameErase: [number, number, number, number];
  wcpsErase: [number, number, number, number];
};

export const REPORT_LAYOUT: Record<number, ReportAnchor> = {
  1: { nameBaseline: 630.1, wcpsBaseline: 609.2, nameErase: [173.1, 627.7, 369.3, 12.2], wcpsErase: [173.1, 607.5, 369.3, 12.2] },
  2: { nameBaseline: 631.2, wcpsBaseline: 610.3, nameErase: [173.1, 628.8, 369.3, 12.2], wcpsErase: [173.1, 608.5, 369.3, 12.2] },
  3: { nameBaseline: 618.9, wcpsBaseline: 598.1, nameErase: [173.1, 616.5, 369.3, 12.2], wcpsErase: [173.1, 596.4, 369.3, 12.1] },
  4: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  5: { nameBaseline: 646.2, wcpsBaseline: 625.2, nameErase: [173.1, 643.8, 369.3, 12.1], wcpsErase: [173.1, 623.5, 369.3, 12.2] },
  6: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  7: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  8: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  9: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  10: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  11: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  12: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  13: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  14: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  15: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  16: { nameBaseline: 643.1, wcpsBaseline: 620.0, nameErase: [173.1, 640.3, 369.3, 12.8], wcpsErase: [173.1, 616.5, 369.3, 15.8] },
  17: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  18: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  19: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  20: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  21: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  22: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  23: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  24: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
  25: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  26: { nameBaseline: 609.2, wcpsBaseline: 588.2, nameErase: [173.1, 606.8, 369.3, 12.1], wcpsErase: [173.1, 586.5, 369.3, 12.2] },
  27: { nameBaseline: 643.4, wcpsBaseline: 622.4, nameErase: [173.1, 641.0, 369.3, 12.1], wcpsErase: [173.1, 620.7, 369.3, 12.2] },
};
