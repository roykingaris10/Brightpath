/* ============================================================
   Grading. Four dimensions, 0–5. Manager, not quizmaster.
   ============================================================ */

const DIM_MAP = { stake:"communication", iso:"technical", tprm:"technical" };
function normDim(d){ return DIM_MAP[d] || (DIMS[d] ? d : "judgement"); }

const LOW_EFFORT = /^(i (don'?t know|dunno|have no idea)|no idea|not sure|what'?s the answer|tell me the answer|just (tell|show) me|show me the answer|skip|pass|n\/?a|\.|-)\.?$/i;
const ASK_FOR_ANSWER = /(what('?s| is) the (right |correct )?answer|tell me (the|what the) answer|just (tell|give) me the answer|show me the model|can you (just )?do (it|this) for me|give me the answer)/i;

const HINTS = {
  "risk-metabase":[
    "Count the people who can currently log in as analytics@brightpath.io. Rob's own answer to that question is the risk.",
    "Saskia named three specific columns. Ask yourself what each of them would mean in the wrong hands, then write the consequence in those terms rather than in the words 'data breach'.",
    "Brightpath's criteria say the owner must be able to authorise the fix. Work backwards from who signs off engineering time."
  ],
  "risk-backup":[
    "Read question 14 again and count how many things it asks for. Then count how many Rob's answer covers.",
    "Where do the snapshots live, and who holds the credential to the place they live in?",
    "Saskia mentioned something that is not in the RDS snapshot at all."
  ],
  "risk-intercom":[
    "Three separate facts in that thread compound each other: what goes in, how long it stays, and who can search it.",
    "Gemma asked a direct legal question and nobody answered it. Answer it.",
    "A treatment Gemma will not implement is not a treatment. What would reduce the exposure without making it harder to ask a question at 4pm on a Friday?"
  ],
  "sup-lumen":[
    "Read every line of the certificate as a separate claim, including the small print at the bottom. Four of them do not survive contact with the question 'and?'.",
    "Two answers in that questionnaire contradict each other. Find the pair.",
    "One answer is Lumen telling you, in writing and quite politely, what they intend to do with 180,000 children's records."
  ],
  "sup-cloudspan":[
    "There are two kinds of SOC 2 report and they answer completely different questions. Which one is this, and what does it therefore not tell you?",
    "Section 4 is not about Cloudspan. Read it again and ask who is supposed to be doing those eleven things.",
    "Look at the regions in the system scope."
  ],
  "sup-snapdesk":[
    "Before you write anything, list what data this tool will actually hold. Then ask what assurance that list justifies.",
    "Nadia told you something about the last supplier review. That is the most important sentence in her email.",
    "There is one clause in their terms worth thirty seconds, and one field in the product that will end up containing things nobody intended."
  ],
  "inc-export":[
    "Something is still happening while you read this. What is it, and what stops it?",
    "Who is the controller of the data in that CSV? Everything about your obligations follows from the answer.",
    "Rob mentioned the folder the script reads from. Go back and read that message again."
  ],
  "inc-laptop":[
    "It ran before it was quarantined. Read what Defender says it did in that window.",
    "Rob is about to do something this afternoon that you cannot undo.",
    "Article 33 is triggered by a specific kind of breach. What kind, and is this one?"
  ]
};

function wordCount(s){ return String(s||"").trim().split(/\s+/).filter(Boolean).length; }

function collectText(answers, fields){
  return fields.filter(f => f.kind === "textarea").map(f => answers[f.id] || "").join("\n\n");
}

function effortGate(answers, fields, scenarioId){
  const text = collectText(answers, fields);
  const words = wordCount(text);
  const asked = ASK_FOR_ANSWER.test(text);
  const empty = fields.filter(f => f.kind === "textarea").some(f => !String(answers[f.id]||"").trim());
  if (asked || words < 20 || (empty && words < 60)) {
    const pool = HINTS[scenarioId] || [
      "Go back to the artefact and read it line by line. The thing you are looking for is stated, not implied.",
      "Write down what you actually know, what you are assuming, and what you would have to ask. The middle list is usually the problem.",
      "Say what you would do, who does it, and by when. If you cannot name a date, you have not finished thinking."
    ];
    return {
      refused:true,
      reason: asked ? "You asked for the answer without attempting it. No."
        : (words === 0 ? "Nothing submitted." : "That is not an attempt — " + words + " words across the written fields."),
      hints: pool.slice(0, asked ? 1 : 2)
    };
  }
  return null;
}

function runChecks(checks, blob){
  const hits = [], misses = [], penalties = [];
  (checks||[]).forEach(c => {
    let hit = (c.any||[]).some(re => re.test(blob));
    if (c.penaltyAny && c.penaltyAny.some(re => re.test(blob))) { hit = false; penalties.push(c.label); }
    (hit ? hits : misses).push({ id:c.id, label:c.label, dim:normDim(c.dim), w:c.w||1 });
  });
  return { hits, misses, penalties };
}

function structuralChecks(spec, answers){
  const s = spec.scoring || {}, out = [];
  const add = (ok, dim, w, label, note) => out.push({ ok, dim, w, label, note });

  if (spec.type === "risk") {
    const L = parseInt(answers.likelihood,10), I = parseInt(answers.impact,10);
    if (L && I) {
      const sc = L*I, inBand = sc >= (s.bandMin||1) && sc <= (s.bandMax||25);
      add(inBand, "judgement", 2,
        inBand ? "Score of " + sc + " (" + L + "×" + I + ") lands in a defensible band"
               : "Score of " + sc + " (" + L + "×" + I + ") is outside any defensible band for these facts",
        inBand ? null : "On these facts a defensible score sits between " + (s.bandMin||1) + " and " + (s.bandMax||25) + ". Under-scoring a live exposure is how a register stops being believed.");
    } else add(false, "craft", 2, "Did not score the risk", "A risk without a score cannot be prioritised, and an unprioritised register is a list.");

    const o = answers.owner;
    if (!o || o === ALL_OWNERS[0]) add(false, "craft", 2, "No risk owner named", s.ownerNote);
    else if ((s.goodOwners||[]).includes(o)) add(true, "craft", 2, "Risk owner: " + o + " — right call");
    else if ((s.okOwners||[]).includes(o)) add(true, "craft", 1, "Risk owner: " + o + " — defensible, though not the obvious choice", s.ownerNote);
    else add(false, "craft", 2, "Risk owner: " + o + " — wrong", s.ownerNote);

    const t = answers.treatment;
    if (!t || t === "—") add(false, "judgement", 1, "No treatment selected");
    else if ((s.goodTreatment||[]).includes(t)) add(true, "judgement", 1, "Treatment: " + t + " — right");
    else add(false, "judgement", 2, "Treatment: " + t + " — not supportable at this score",
      "At a score above appetite, Retain is only available with a documented rationale and ELT sign-off, and Share does not move an obligation you hold as a processor.");
  }

  if (spec.type === "supplier") {
    const t = answers.tier;
    if (!t || t === "—") add(false, "craft", 1, "Supplier not tiered");
    else if ((s.goodTier||[]).includes(t)) add(true, "judgement", 2, "Tier: " + t + " — proportionate");
    else if ((s.badTier||[]).includes(t)) add(false, "judgement", 2, "Tier: " + t + " — out of proportion to what this supplier holds",
      "Tiering is how you decide how much assurance to demand. Get it wrong upwards and you burn the business's patience; get it wrong downwards and you under-assure a supplier that matters.");
    else add(true, "judgement", 1, "Tier: " + t + " — arguable");

    const d = answers.decision;
    if (!d) add(false, "judgement", 2, "No recommendation given", "A supplier assessment that does not end in a recommendation is a reading exercise.");
    else if ((s.goodDecision||[]).includes(d)) add(true, "judgement", 3, "Recommendation: " + d + " — defensible", s.decisionNote);
    else add(false, "judgement", 3, "Recommendation: " + d + " — not defensible here", s.decisionNote);
  }

  if (spec.type === "incidentBeat") {
    if (spec.sevOptions) {
      const v = answers.sev;
      if (!v || v === "—") add(false, "judgement", 2, "No severity assigned");
      else if ((s.goodSev||[]).includes(v)) add(true, "judgement", 2, "Severity " + v + " — right");
      else if ((s.okSev||[]).includes(v)) add(true, "judgement", 1, "Severity " + v + " — defensible", s.sevNote);
      else add(false, "judgement", 2, "Severity " + v + " — wrong on these facts", s.sevNote);
    }
    if (spec.hasDecision) {
      const d = answers.decision;
      if (!d) add(false, "judgement", 3, "No notification decision made", "Not deciding is a decision, and it is the one the clock punishes.");
      else if ((s.goodDecision||[]).includes(d)) add(true, "technical", 3, "Decision: " + d + " — correct", s.decisionNote);
      else if ((s.okDecision||[]).includes(d)) add(true, "technical", 1, "Decision: " + d + " — partially defensible", s.decisionNote);
      else add(false, "technical", 3, "Decision: " + d + " — wrong", s.decisionNote);
    }
  }
  return out;
}

function scoreFromRatio(r){
  if (r >= 0.999) return 5;   /* 5 requires every point, not most of them */
  if (r >= 0.84) return 4;
  if (r >= 0.64) return 3;
  if (r >= 0.42) return 2;
  if (r >= 0.20) return 1;
  return 0;
}

const FLABBY = [
  [/take (security|this|data protection) (very )?seriously/i, "\"We take security seriously\" is what people write when they have nothing to report."],
  [/abundance of caution/i, "\"Out of an abundance of caution\" is a phrase that has never once preceded a decision."],
  [/industry[- ]?(leading|standard|best) practice(?!.{0,40}(which|because|specifically|namely))/i, "\"Best practice\" with nothing after it is a claim with no content."],
  [/robust (process|measure|control|framework)/i, "\"Robust\" is not a control. Name the control."],
  [/going forward/i, "\"Going forward\" adds nothing that a date would not add better."]
];

function localGrade(spec, answers, ctx){
  const fields = spec.fields || [];
  const blob = collectText(answers, fields);
  const words = wordCount(blob);
  const { hits, misses, penalties } = runChecks(spec.checks, blob);
  const struct = structuralChecks(spec, answers);

  const tally = {}; DIM_ORDER.forEach(d => tally[d] = { got:0, tot:0 });
  hits.forEach(h => { tally[h.dim].got += h.w; tally[h.dim].tot += h.w; });
  misses.forEach(m => { tally[m.dim].tot += m.w; });
  struct.forEach(s => { const d = normDim(s.dim); tally[d].tot += s.w; if (s.ok) tally[d].got += s.w; });

  const overall = DIM_ORDER.reduce((a,d) => a + tally[d].got, 0) / Math.max(1, DIM_ORDER.reduce((a,d) => a + tally[d].tot, 0));
  const dims = {};
  DIM_ORDER.forEach(d => { dims[d] = tally[d].tot > 0 ? scoreFromRatio(tally[d].got / tally[d].tot) : scoreFromRatio(overall); });

  // communication is also judged as writing, not only as coverage
  const flab = FLABBY.filter(([re]) => re.test(blob));
  if (words < 60) dims.communication = Math.min(dims.communication, 2);
  else if (words < 110) dims.communication = Math.min(dims.communication, 3);
  if (words > 900) dims.communication = Math.max(0, dims.communication - 1);
  if (flab.length) dims.communication = Math.max(0, dims.communication - 1);
  if (penalties.length) dims.judgement = Math.max(0, dims.judgement - 1);

  const integrity = integrityScan(spec, answers, blob);
  if (integrity) { dims.judgement = 0; dims.craft = Math.min(dims.craft, 1); }

  const notes = struct.filter(s => s.note && !s.ok).map(s => s.note)
    .concat(flab.map(f => f[1]))
    .concat(penalties.map(p => "Marked down on: " + p));

  return {
    source:"local",
    dims,
    hits: hits.map(h => h.label).concat(struct.filter(s => s.ok).map(s => s.label)),
    misses: misses.map(m => m.label).concat(struct.filter(s => !s.ok).map(s => s.label)),
    notes,
    verdict: localVerdict(dims, integrity),
    coach: localCoach(dims, misses),
    npcLine: null,
    integrity,
    words
  };
}

function integrityScan(spec, answers, blob){
  for (const t of INTEGRITY_TRAPS) if (t.re.test(blob)) return { reason:"You proposed " + t.label + ".", severe:true };
  const cat = (spec.scoring && spec.scoring.catastrophic) || [];
  for (const c of cat) {
    if (c.needChip && answers.decision !== c.needChip) continue;
    if (!c.needChip && c.re && !c.re.test(blob)) continue;
    return { reason:c.label, severe:true };
  }
  return null;
}

function localVerdict(dims, integrity){
  if (integrity) return "Integrity failure. Everything else in this piece of work is irrelevant until that is dealt with.";
  const avg = DIM_ORDER.reduce((a,d)=>a+dims[d],0)/4;
  if (avg >= 4.5) return "Genuinely strong. This would survive an auditor reading it cold.";
  if (avg >= 3.5) return "Solid professional work with gaps you can close.";
  if (avg >= 2.5) return "Competent in parts. The thinking is there; the discipline is not yet.";
  if (avg >= 1.5) return "Below the line. You have described the situation rather than analysed it.";
  return "This does not do the job. Read the correct approach below and then read the artefact again.";
}

function localCoach(dims, misses){
  const weakest = DIM_ORDER.slice().sort((a,b) => dims[a]-dims[b])[0];
  const byDim = misses.filter(m => m.dim === weakest);
  const lead = {
    technical:"Watch this: technical accuracy. Anchor claims to a named article, clause or control and check the specific facts in front of you rather than the general shape of the problem.",
    judgement:"Watch this: judgement. The question is rarely 'is this bad' — it is 'how bad, compared with what else, and who decides'.",
    communication:"Watch this: communication. Write for the person who has to act on it, in the fewest words that still carry the meaning.",
    craft:"Watch this: professional craft. Owners, dates, evidence, root causes. The habits that make work auditable."
  }[weakest];
  return byDim.length ? lead + " Concretely, on this piece: " + byDim[0].label.replace(/^[A-Z]/, c=>c.toLowerCase()) + "." : lead;
}

/* ---------------- AI grading ---------------- */

const GRADER_RULES = `You are grading a trainee UK cyber GRC analyst's work inside a career simulator. You are their manager, not a quizmaster.

Grade four dimensions, each an integer 0-5:
- technical: is it right per the UK standard or law (ISO/IEC 27001:2022 with its 93 Annex A controls in 4 themes, UK GDPR, DPA 2018, ICO, Cyber Essentials)?
- judgement: proportionality, prioritisation, knowing when to escalate and when to decide.
- communication: clear, neutral, audience-appropriate. No jargon walls, no corporate filler.
- craft: evidence-thinking, root-cause discipline, named owners, realistic dates.

Calibration, and hold it: 0 nothing usable. 1 wrong or empty. 2 below the standard of a working analyst. 3 a competent professional job — this should feel earned, and is the most common good score. 4 notably strong. 5 rare, reserved for work you would send to a client or an auditor unchanged. Do not award 4 or 5 for effort, length or enthusiasm.

Rules:
- Never accept confident nonsense. If the answer is wrong, say so plainly and state the correct approach.
- If the substance is right but the expression is poor, pass the substance and coach the expression.
- Credit a defensible answer that differs from the model. Grade the defence, not the conformity.
- British spelling throughout. UK law and UK bodies only. If unsure of a specific factual detail, keep the learning point and avoid inventing citation-level specifics.
- Be specific. Quote or paraphrase what they actually wrote. Generic feedback is a failure of your job, not theirs.`;

function buildGradePrompt(spec, answers, ctx){
  const fieldDump = (spec.fields||[]).map(f => {
    const v = answers[f.id];
    return "### " + f.label + "\n" + (v && String(v).trim() ? v : "(left blank)");
  }).join("\n\n");
  return [
    GRADER_RULES,
    "\n---\nCOMPANY: " + ctx.company.name + " — " + ctx.company.blurb + "\nThe trainee plays " + ctx.playerName + ", " + ctx.company.role + ".\n" +
    "Risk scoring criteria in force: " + ctx.company.riskCriteria.scale + "\nRisk owner rule: " + ctx.company.riskCriteria.ownerRule,
    "\n---\nTASK: " + spec.title + "\n\nWHAT THIS TASK IS TESTING AND WHAT THE CORRECT ANSWER LOOKS LIKE (the trainee has not seen this):\n" + (spec.aiBrief||""),
    "\n---\nTHE TRAINEE'S SUBMISSION:\n\n" + fieldDump,
    "\n---\nReply with only a JSON object, no prose around it:\n" +
    '{"dims":{"technical":0,"judgement":0,"communication":0,"craft":0},' +
    '"verdict":"one or two sentences, direct, the headline judgement",' +
    '"gotRight":["specific things they actually did well, quoting their words where useful — [] if none"],' +
    '"missed":["specific things they got wrong or did not spot, each naming the correct position"],' +
    '"correction":"if anything is wrong, the correct approach in 2-5 sentences. Empty string if nothing is wrong.",' +
    '"coach":"one development point, phrased as \'Watch this: ...\'",' +
    '"integrityFlag":null,' +
    '"npcLine":"one line of feedback in character as ' + (ctx.npc ? ctx.npc.name + ", " + ctx.npc.role + " — " + ctx.npc.style : "their manager") + '"}\n\n' +
    'Set integrityFlag to a short string ONLY if the trainee proposed concealing a reportable matter, fabricating or backdating evidence, destroying records, or misleading an auditor, customer or regulator. Disagreeing with you is not an integrity failure.'
  ].join("\n");
}

async function aiGrade(spec, answers, ctx, signal){
  const sample = await getSample();
  if (!sample) return null;
  try {
    const r = await sample.json(buildGradePrompt(spec, answers, ctx), { modelTier:"complex", cache:false, signal });
    if (!r || !r.dims) return null;
    const dims = {};
    DIM_ORDER.forEach(d => { const n = Math.round(Number(r.dims[d])); dims[d] = Math.max(0, Math.min(5, isNaN(n) ? 0 : n)); });
    return {
      source:"ai", dims,
      hits: Array.isArray(r.gotRight) ? r.gotRight.map(String) : [],
      misses: Array.isArray(r.missed) ? r.missed.map(String) : [],
      notes: r.correction ? [String(r.correction)] : [],
      verdict: String(r.verdict || ""),
      coach: String(r.coach || ""),
      npcLine: r.npcLine ? String(r.npcLine) : null,
      integrity: r.integrityFlag ? { reason:String(r.integrityFlag), severe:true } : null
    };
  } catch (e) { return null; }
}

/* Deterministic facts always come from the local pass; the AI supplies the prose. */
async function gradeWork(spec, answers, ctx, signal){
  const gate = effortGate(answers, spec.fields||[], spec.scenarioId || spec.id);
  if (gate) return gate;

  const local = localGrade(spec, answers, ctx);
  const ai = await aiGrade(spec, answers, ctx, signal);
  if (!ai) return local;

  const struct = structuralChecks(spec, answers);
  const hardMisses = struct.filter(s => !s.ok);
  const merged = {
    source:"ai",
    dims: ai.dims,
    hits: ai.hits.concat(struct.filter(s => s.ok).map(s => s.label)),
    misses: ai.misses.concat(hardMisses.map(s => s.label)),
    notes: ai.notes.concat(hardMisses.filter(s => s.note).map(s => s.note)),
    verdict: ai.verdict || local.verdict,
    coach: ai.coach || local.coach,
    npcLine: ai.npcLine,
    integrity: ai.integrity || local.integrity,
    words: local.words
  };
  // the AI does not get to overrule an unambiguous structural error
  if (hardMisses.length) {
    const cap = 5 - Math.min(3, hardMisses.reduce((a,s)=>a+s.w,0));
    hardMisses.forEach(s => { const d = normDim(s.dim); merged.dims[d] = Math.min(merged.dims[d], Math.max(1, cap)); });
  }
  if (merged.integrity) { merged.dims.judgement = 0; merged.dims.craft = Math.min(merged.dims.craft, 1); }
  return merged;
}
