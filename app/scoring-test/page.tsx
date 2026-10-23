'use client';

import { useState } from 'react';
import { ALL_QUESTIONS, QUESTION_ORDER } from '../../lib/quizData';
import type { Answers } from '../../lib/scoring'
import { COMPONENTS, WCPS_FORMULA, presetAnswers, runScoringChecks, weightedBreakdown } from '../../lib/scoringTest';
import styles from './scoring-test.module.css';

const format = (value: number) => Number(value.toFixed(6)).toString();
const presetLabels = { lowest: 'Lowest options', highest: 'Highest options', first: 'First options' };

export default function ScoringTestPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [checks, setChecks] = useState<ReturnType<typeof runScoringChecks> | null>(null);
  const [section, setSection] = useState<'behaviour' | 'context'>('behaviour');
  const [message, setMessage] = useState('');
  const count = QUESTION_ORDER.filter(id => Number.isInteger(answers[id]) && !!ALL_QUESTIONS[id].options[answers[id]]).length;
  const result = count === QUESTION_ORDER.length ? weightedBreakdown(answers) : null;
  const visibleIds = section === 'behaviour' ? QUESTION_ORDER.slice(0, 20) : QUESTION_ORDER.slice(20);
  const passed = checks?.filter(check => check.passed).length ?? 0;

  function changeAnswer(id: string, value: string) {
    setAnswers(previous => {
      const next = { ...previous };
      if (value === '') delete next[id]; else next[id] = Number(value);
      return next;
    });
    setMessage('');
  }

  function download() {
    if (!result) return;
    // Export the displayed WCPS calculation and component breakdown.
    const snapshot = {
      answers,
      wcps: { score: result.wcps, exactTotal: result.exactTotal, label: result.label, display: result.display,
        formula: WCPS_FORMULA,
        substitution: result.rows.map(row => `(${row.weight} × ${format(row.normalized)})`).join(' + '),
        sum: result.rows.map(row => format(row.contribution)).join(' + ') },
      components: result.rows.map(row => ({ key: row.key, label: row.label, ids: row.ids, raw: row.raw, formula: row.formula, normalized: row.normalized })),
      dimensions: result.dimensions,
      reportNumber: result.reportNumber,
    };
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wcps-scoring-test.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('Calculation downloaded.');
    } catch {
      setMessage('The calculation could not be downloaded. Please try again.');
    }
  }

  return <main className={styles.page}>
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true">W</span><div>WCPS<span className={styles.brandCaption}>ASSESSMENT WORKSPACE</span></div></div>
        <span className={styles.testBadge}>Testing mode</span>
      </header>
      <section className={styles.intro}>
        <div><p className={styles.eyebrow}>SCORING LAB</p><h1>A clearer view of every score.</h1><p>Explore answers, inspect calculations, and verify your assessment results.</p></div>
        <a className={styles.jumpLink} href="#verification">View reference checks <span aria-hidden="true">↗</span></a>
      </section>
      <div className={styles.workspace}>
        <div className={styles.mainColumn}>
          <section className={styles.panel} aria-labelledby="answers-heading">
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / INPUTS</p><h2 id="answers-heading">Assessment answers</h2></div><span className={styles.count}>{count}<span> / 27</span></span></div>
            <progress className={styles.progress} max={27} value={count} aria-label={`${count} of 27 answers selected`} />
            <div className={styles.toolbar}>
              {(['lowest', 'highest', 'first'] as const).map(mode => <button type="button" key={mode} className={styles.secondaryButton} onClick={() => { setAnswers(presetAnswers(mode)); setMessage(''); }}>{presetLabels[mode]}</button>)}
              <button type="button" className={styles.resetButton} onClick={() => { setAnswers({}); setChecks(null); setSection('behaviour'); setMessage('Answers and checks reset.'); }}>Reset</button>
            </div>
            <div className={styles.tabs} aria-label="Question sections">
              <button type="button" aria-pressed={section === 'behaviour'} className={section === 'behaviour' ? styles.activeTab : styles.tab} onClick={() => setSection('behaviour')}>Behaviour <span>Q1–Q20</span></button>
              <button type="button" aria-pressed={section === 'context'} className={section === 'context' ? styles.activeTab : styles.tab} onClick={() => setSection('context')}>Personal context <span>Q21–Q27</span></button>
            </div>
            <div className={styles.questions}>
              {visibleIds.map(id => {
                const question = ALL_QUESTIONS[id];
                const group = COMPONENTS.find(component => component.ids.includes(id));
                return <div key={id} className={styles.question}>
                  <div className={styles.questionMeta}><span>{id.toUpperCase()}</span><span>{group?.label}</span></div>
                  <label htmlFor={`answer-${id}`}>{question.text}</label>
                  <select id={`answer-${id}`} value={answers[id] ?? ''} onChange={event => changeAnswer(id, event.target.value)}>
                    <option value="">Select an answer</option>
                    {question.options.map((option, index) => <option key={index} value={index}>{index + 1}. {option.text} — {option.points} {id === 'q22' ? 'COI' : 'marks'}</option>)}
                  </select>
                </div>;
              })}
            </div>
            {section === 'behaviour' && <button type="button" className={styles.primaryButton} onClick={() => setSection('context')}>Continue to personal context <span aria-hidden="true">→</span></button>}
          </section>
          {result && <>
            <section className={styles.panel} aria-labelledby="components-heading">
              <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / CALCULATIONS</p><h2 id="components-heading">Component breakdown</h2></div></div>
              <p className={styles.muted}>Raw values and normalization calculations for each assessment component.</p>
              <div className={styles.tableScroll}><table className={styles.table}>
                <thead><tr><th scope="col">Component</th><th scope="col">Raw value</th><th scope="col">Calculation</th><th scope="col">Score /100</th></tr></thead>
                <tbody>{result.rows.map(row => <tr key={row.key}><td><strong>{row.label}</strong><small>{row.ids.map(id => id.toUpperCase()).join(', ')}</small></td><td>{row.raw}</td><td className={styles.formula}>{row.formula}</td><td><strong>{format(row.normalized)}</strong></td></tr>)}</tbody>
              </table></div>
              <h3>WCPS calculation</h3>
              <div className={styles.calculation} aria-label="WCPS formula and calculation">
                <strong>{WCPS_FORMULA}</strong>
                <span>{result.rows.map(row => `${row.key} = ${format(row.normalized)}`).join(' · ')}</span>
                <span>Substitute: {result.rows.map(row => `(${row.weight} × ${format(row.normalized)})`).join(' + ')}</span>
                <span>Sum: {result.rows.map(row => format(row.contribution)).join(' + ')} = <strong>{format(result.exactTotal)}</strong></span>
                <strong>WCPS = {result.wcps}/100 — {result.label}</strong>
              </div>
              <p className={styles.note}>Values shown above are shortened to six decimal places for readability. The calculation uses full precision, then stores WCPS to one decimal place. The label uses the rounded integer of the unrounded total.</p>
            </section>
            <section className={styles.panel} aria-labelledby="profile-heading">
              <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>03 / INNER PROFILE</p><h2 id="profile-heading">P / S / G scoring</h2></div></div>
              <p className={styles.muted}>Open a dimension to review its selected answers and calculation.</p>
              {result.dimensions.map(dimension => <details key={dimension.key} className={styles.dimension}>
                <summary><span className={styles.dimensionLetter}>{dimension.key}</span><span className={styles.dimensionName}>{dimension.label}<small>{dimension.level}</small></span><strong>{dimension.roundedScore}<small> /100</small></strong></summary>
                <div className={styles.dimensionBody}>
                  <div className={styles.calculation}><span>Raw sum: {dimension.marksSum} = <strong>{dimension.raw}</strong></span><strong>{dimension.formula} = {format(dimension.score)}</strong></div>
                  <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th scope="col">Question</th><th scope="col">Answer</th><th scope="col">Marks</th></tr></thead><tbody>{dimension.questions.map(question => <tr key={question.id}><td>{question.id.toUpperCase()}</td><td>{question.optionNumber}. {question.answer}</td><td>{question.marks}</td></tr>)}</tbody></table></div>
                </div>
              </details>)}
              <p className={styles.note}>Level thresholds: below 50 — Needs Attention; 50 to below 75 — Developing; 75 or above — Strong. Levels use unrounded scores.</p>
              <div className={styles.report}><span>Matched report</span><strong>Report_{String(result.reportNumber).padStart(2, '0')}.pdf</strong></div>
            </section>
          </>}
          <section id="verification" className={styles.panel} aria-labelledby="checks-heading">
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>04 / VERIFICATION</p><h2 id="checks-heading">Reference checks</h2></div><button type="button" className={styles.primaryButton} onClick={() => setChecks(runScoringChecks())}>Run checks</button></div>
            <p className={styles.muted}>Check score references, profile levels, country changes, and incomplete-answer handling.</p>
            {checks ? <><p className={styles.checkStatus} role="status">{passed} of {checks.length} checks passed</p><ul className={styles.checks}>{checks.map(check => <li key={check.name}><span className={check.passed ? styles.pass : styles.fail}>{check.passed ? 'PASS' : 'FAIL'}</span><div><strong>{check.name}</strong><small>Expected: {typeof check.expected === 'number' ? format(check.expected) : String(check.expected)} · Actual: {typeof check.actual === 'number' ? format(check.actual) : String(check.actual)}</small></div></li>)}</ul></> : <div className={styles.checkEmpty}>Run the reference suite to see expected and actual results.</div>}
          </section>
        </div>
        <aside className={styles.sidebar} aria-label="Score summary">
          <section className={styles.scoreCard}>
            <p className={styles.eyebrow}>YOUR WCPS RESULT</p>
            <div className={styles.scoreValue}>{result ? result.wcps : '—'}<span>/100</span></div>
            <h2>{result ? result.label : 'Ready when you are'}</h2>
            <p>{result ? 'Calculated from your complete answer set.' : `Select ${27 - count} more ${27 - count === 1 ? 'answer' : 'answers'} or load a preset to see your result.`}</p>
            {result && <div className={styles.scoreMeta}><span>Unrounded total<strong>{format(result.exactTotal)}</strong></span><span>Report display<strong>{result.display}/100</strong></span></div>}
            <button type="button" className={styles.downloadButton} disabled={!result} onClick={download}>Download results <span aria-hidden="true">↓</span></button>
          </section>
          <section className={styles.helpCard}><h3>A safe testing workspace</h3><p>Answers stay in this page. No emails are sent and no spreadsheet records are created.</p><p className={styles.note}>Use presets for quick checks, then change individual answers to inspect results.</p></section>
          <p className={styles.notice} role="status" aria-live="polite">{message}</p>
        </aside>
      </div>
      <footer className={styles.footer}>WCPS Scoring Lab<span>Assessment testing workspace</span></footer>
    </div>
  </main>;
}
