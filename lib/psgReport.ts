import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { DimensionKey, DimensionLevel, DimensionResult } from './scoring';

export type PsgProfile = {
  name: string;
  email: string;
  country: string;
  age: string;
  career: string;
  education: string;
};

type DimensionCopy = {
  title: string;
  explanation: string;
  insights: Record<DimensionLevel, { strength: string; improve: string }>;
};

const COPY: Record<DimensionKey, DimensionCopy> = {
  p: {
    title: 'Perseverance & Action',
    explanation: 'How you keep moving, finish commitments and return to a task when progress is slow.',
    insights: {
      Strong: { strength: 'Your answers suggest steady follow-through and a willingness to continue through setbacks.', improve: 'Protect this consistency without overcommitting. Make room for recovery and review priorities.' },
      Developing: { strength: 'Your answers show an emerging ability to take action and return to important tasks.', improve: 'Build a more dependable routine, especially when progress is slow or motivation drops.' },
      'Needs Attention': { strength: 'This area offers a clear starting point for development. Your score is not a fixed limit on your ability.', improve: 'Start with a small, repeatable commitment. Practise finishing one task before adding another.' },
    },
  },
  s: {
    title: 'Self-Mastery & Discipline',
    explanation: 'How you manage distractions, pause before impulses and choose actions that support your goals.',
    insights: {
      Strong: { strength: 'Your answers suggest an ability to manage distractions and make deliberate choices.', improve: 'Keep your boundaries flexible and sustainable. Avoid turning discipline into excessive self-pressure.' },
      Developing: { strength: 'Your answers indicate some useful self-management habits that can be strengthened.', improve: 'Identify your most common distraction and make your preferred action easier to choose.' },
      'Needs Attention': { strength: 'Your responses identify opportunities to build stronger self-management habits.', improve: 'Create a pause before one recurring impulse and reduce distractions during important tasks.' },
    },
  },
  g: {
    title: 'Growth & Inner Mindset',
    explanation: 'How you respond to feedback, learn from mistakes and approach challenges with curiosity.',
    insights: {
      Strong: { strength: 'Your answers suggest openness to learning, feedback and constructive reflection.', improve: 'Turn your learning into specific action, and keep listening to viewpoints that challenge your assumptions.' },
      Developing: { strength: 'Your answers show a developing willingness to learn and adapt.', improve: 'Practise treating feedback as information rather than a judgment. Choose one lesson to apply.' },
      'Needs Attention': { strength: 'Recognising your current learning patterns gives you a useful starting point for change.', improve: 'After a difficult experience, separate what happened from how it made you feel, then identify one lesson.' },
    },
  },
};

const COLORS = {
  navy: rgb(.09, .21, .31), teal: rgb(.12, .46, .40), ink: rgb(.14, .22, .29),
  muted: rgb(.36, .44, .50), light: rgb(.94, .96, .98), line: rgb(.85, .89, .92),
  white: rgb(1, 1, 1), green: rgb(.91, .96, .93), amber: rgb(.99, .95, .87),
};

// Standard PDF fonts support Latin text. Preserve common Latin accents; reject
// unsupported characters instead of silently deleting participant information.
function clean(value: string): string {
  return value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();
}

function lines(text: string, font: PDFFont, size: number, width: number): string[] {
  const result: string[] = [];
  let line = '';
  for (const word of clean(text).split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) { line = candidate; continue; }
    if (line) { result.push(line); line = ''; }
    // Break long email addresses or other unspaced values without truncation.
    for (const char of word) {
      if (line && font.widthOfTextAtSize(line + char, size) > width) { result.push(line); line = ''; }
      line += char;
    }
  }
  if (line) result.push(line);
  return result;
}

/** Creates a separate two-page PSG report; it does not change any score formula. */
export async function createPsgReport(profile: PsgProfile, dimensions: DimensionResult[]): Promise<Buffer> {
  const ordered = (['p', 's', 'g'] as const).map(key => {
    const dimension = dimensions.find(d => d.key === key);
    if (!dimension || !Number.isFinite(dimension.score) || dimension.score < 0 || dimension.score > 100 || !COPY[key].insights[dimension.level]) {
      throw new Error(`Invalid ${key.toUpperCase()} score for the profile report.`);
    }
    return dimension;
  });
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  // Validate encoding before drawing either report page.
  for (const value of Object.values(profile)) {
    try { regular.encodeText(clean(value)); }
    catch { throw new Error('The PSG report font does not support a character in the participant profile. Configure a suitable embedded Unicode font before sending this report.'); }
  }
  const width = 595.28;
  const height = 841.89;
  let page: PDFPage;
  function text(value: string, x: number, top: number, size = 10, strong = false, color = COLORS.ink) {
    page.drawText(clean(value), { x, y: height - top - size, size, font: strong ? bold : regular, color });
  }
  function paragraph(value: string, x: number, top: number, maxWidth: number, size = 10, strong = false): number {
    const wrapped = lines(value, strong ? bold : regular, size, maxWidth);
    wrapped.forEach((line, i) => text(line, x, top + i * (size + 4), size, strong));
    return top + wrapped.length * (size + 4);
  }
  function box(x: number, top: number, w: number, h: number, color = COLORS.light) {
    page.drawRectangle({ x, y: height - top - h, width: w, height: h, color });
  }
  function start(number: number, subtitle: string) {
    page = pdf.addPage([width, height]);
    box(0, 0, width, 134, COLORS.navy);
    text('HAPPINESS HOLISTIC CLINIC', 36, 24, 9, true, COLORS.white);
    text('Your Inner Wealth Profile', 36, 48, 25, true, COLORS.white);
    text(subtitle, 36, 89, 11, false, COLORS.white);
    page.drawLine({ start: { x: 36, y: 43 }, end: { x: width - 36, y: 43 }, thickness: .5, color: COLORS.line });
    text('Personalised PSG assessment | Not a financial prediction or guarantee.', 36, 806, 8, false, COLORS.muted);
    text(`${number} / 2`, 532, 806, 8, false, COLORS.muted);
  }
  start(1, 'A closer look at your habits, self-management and mindset');
  text('PARTICIPANT PROFILE', 36, 157, 11, true, COLORS.teal);
  let y = 183;
  const fields = [
    ['Name', profile.name], ['Email', profile.email], ['Country of residence', profile.country],
    ['Age group', profile.age], ['Career path', profile.career], ['Education / career stage', profile.education],
  ];
  for (const [label, value] of fields) {
    const wrapped = lines(value || 'Not provided', regular, 10, 340);
    if (wrapped.length > 3) throw new Error(`Participant ${label.toLowerCase()} is too long for the PSG report.`);
    const rowHeight = Math.max(27, wrapped.length * 14 + 12);
    box(36, y, 523, rowHeight, y % 2 ? COLORS.white : COLORS.light);
    text(label, 48, y + 6, 9, true, COLORS.muted);
    paragraph(value || 'Not provided', 195, y + 6, 340);
    y += rowHeight;
  }
  y += 22;
  text('YOUR THREE DIMENSIONS', 36, y, 11, true, COLORS.teal);
  y += 29;
  for (const dimension of ordered) {
    const copy = COPY[dimension.key];
    text(`${dimension.key.toUpperCase()} | ${copy.title}`, 36, y, 12, true);
    text(`${dimension.score}/100`, 481, y, 11, true, COLORS.teal);
    box(36, y + 25, 523, 8, COLORS.line);
    box(36, y + 25, 523 * dimension.score / 100, 8, COLORS.teal);
    text(dimension.level, 36, y + 42, 10, true, COLORS.teal);
    paragraph(copy.explanation, 36, y + 61, 523, 10);
    y += 112;
  }
  if (y > 791) throw new Error('Participant profile exceeds the PSG report layout. Shorten the profile fields.');

  start(2, 'What your responses suggest - and where you can develop');
  let top = paragraph(`Prepared for ${profile.name}`, 36, 151, 523, 11, true) + 16;
  for (const dimension of ordered) {
    const copy = COPY[dimension.key];
    const insight = copy.insights[dimension.level];
    text(`${dimension.key.toUpperCase()} | ${copy.title}`, 36, top, 12, true);
    text(dimension.level, 36, top + 21, 10, true, COLORS.teal);
    let cardHeight = 0;
    const cards = [
      ['What you can build on', insight.strength, COLORS.green],
      ['Where you can improve', insight.improve, COLORS.amber],
    ] as const;
    cards.forEach(([label, value, color], index) => {
      const x = index === 0 ? 36 : 304;
      const h = 42 + lines(value, regular, 10, 225).length * 14;
      cardHeight = Math.max(cardHeight, h);
      box(x, top + 48, 255, h, color);
      text(label, x + 15, top + 58, 10, true);
      paragraph(value, x + 15, top + 79, 225);
    });
    top += 48 + cardHeight + 24;
  }
  if (top > 790) throw new Error('PSG insight content exceeds the report page.');
  pdf.setTitle('Your Inner Wealth Profile - PSG');
  pdf.setAuthor('Happiness Holistic Clinic');
  pdf.setSubject('Participant profile, PSG scores and personalised development insights');
  return Buffer.from(await pdf.save());
}
