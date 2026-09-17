/* ============================================================
   Engine: state, saves, capabilities, the working day
   ============================================================ */

let _sample = undefined, _db = undefined;
async function getSample(){
  if (_sample !== undefined) return _sample;
  try { _sample = (window.claude && claude.use) ? await claude.use("sample") : null; }
  catch(e){ _sample = null; }
  return _sample;
}
async function getDB(){
  if (_db !== undefined) return _db;
  try { _db = (window.claude && claude.use) ? await claude.use("db") : null; }
  catch(e){ _db = null; }
  return _db;
}

const ALL_SCENARIOS = {};
[].concat(RISK_SCENARIOS, SUPPLIER_SCENARIOS, INCIDENT_SCENARIOS).forEach(s => ALL_SCENARIOS[s.id] = s);

function newGame(name){
  return {
    v: GAME.save,
    player: { name: name || "Alex Osei" },
    tier:1, quarter:1, day:1,
    xp:0, integrity:100, integrityEvents:[],
    skills: SKILL_ORDER.reduce((a,k)=>(a[k]=0,a),{}),
    dimTotals: DIM_ORDER.reduce((a,k)=>(a[k]={sum:0,n:0},a),{}),
    register: BRIGHTPATH.seedRegister.map(r => Object.assign({}, r)),
    cv: [],
    seen: [],
    dayLog: [],
    flow: null,
    ui: { view:"day" },
    meta: { created: Date.now(), updated: Date.now() }
  };
}

let S = newGame();

/* ---------------- saves ---------------- */
const LS_KEY = "grcgrind.save.v3";
let saveStatus = "in memory";

function serialise(){ S.meta.updated = Date.now(); return JSON.stringify(S); }

async function saveGame(){
  const json = serialise();
  let ok = false;
  try { localStorage.setItem(LS_KEY, json); ok = true; saveStatus = "saved in this browser"; } catch(e){}
  const db = await getDB();
  if (db) {
    try { await db.doc("saves/career").set({ json, updated: S.meta.updated, name: S.player.name }); saveStatus = "saved"; ok = true; }
    catch(e){ if (!ok) saveStatus = "in memory only"; }
  } else if (!ok) saveStatus = "in memory only";
  paintSaveStatus();
  return ok;
}

async function loadGame(){
  const db = await getDB();
  if (db) {
    try {
      const d = await db.doc("saves/career").get();
      const raw = d && (d.data ? d.data.json : d.json);
      if (raw) { const p = JSON.parse(raw); if (p && p.v === GAME.save) { S = migrate(p); saveStatus = "saved"; return true; } }
    } catch(e){}
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { const p = JSON.parse(raw); if (p && p.v === GAME.save) { S = migrate(p); saveStatus = "saved in this browser"; return true; } }
  } catch(e){}
  return false;
}
function migrate(p){
  const base = newGame(p.player && p.player.name);
  return Object.assign(base, p, { ui: Object.assign({view:"day"}, p.ui||{}) });
}

/* ---------------- progression ---------------- */
function skillXp(k){ return S.skills[k] || 0; }
function totalDim(d){ const t = S.dimTotals[d]; return t.n ? t.sum / t.n : null; }
function weakestDims(){ return DIM_ORDER.filter(d => S.dimTotals[d].n > 0).sort((a,b) => (totalDim(a)) - (totalDim(b))); }

function award(spec, result){
  const gained = DIM_ORDER.reduce((a,d)=>a+result.dims[d],0) * 3;
  S.xp += gained;
  const prim = spec.skill || "risk", sec = spec.secondary;
  S.skills[prim] = (S.skills[prim]||0) + Math.round(gained * 0.75);
  if (sec && S.skills[sec] !== undefined) S.skills[sec] = (S.skills[sec]||0) + Math.round(gained * 0.25);
  DIM_ORDER.forEach(d => { S.dimTotals[d].sum += result.dims[d]; S.dimTotals[d].n += 1; });
  if (result.integrity) {
    S.integrity = Math.max(0, S.integrity - 25);
    S.integrityEvents.push({ day:S.day, task:spec.title, reason:result.integrity.reason });
  }
  return gained;
}

function recordCv(spec, result){
  S.cv.push({
    day:S.day, quarter:S.quarter, tier:S.tier,
    id: spec.scenarioId || spec.id, title: spec.title, skill: spec.skill,
    dims: Object.assign({}, result.dims),
    avg: DIM_ORDER.reduce((a,d)=>a+result.dims[d],0)/4
  });
}

/* ---------------- the day ---------------- */
function startDay(){
  const plan = planForDay(S.day);
  const order = plan.inbox.map(i => i.id);
  S.flow = {
    day: S.day, planDay: plan.day,
    phase: "briefing",
    order: [],                       // player's chosen triage order
    triageJustify: "",
    triageResult: null,
    taskIdx: 0, beatIdx: 0,
    answers: {},                     // keyed "<taskId>.<beatId>.<field>"
    results: [],                     // {taskId, beatId, title, skill, dims, ...}
    debrief: null,
    inboxOrder: order
  };
}

function currentPlan(){ return planForDay(S.flow ? S.flow.planDay : S.day); }
function currentTaskId(){ const p = currentPlan(); return p.tasks[S.flow.taskIdx]; }
function currentScenario(){ return ALL_SCENARIOS[currentTaskId()]; }

/* Build a uniform "spec" for grading, whatever the task type is. */
function specForCurrent(){
  const sc = currentScenario();
  if (!sc) return null;
  if (sc.type === "incident") {
    const beat = sc.beats[S.flow.beatIdx];
    return {
      type:"incidentBeat", scenarioId: sc.id, beatId: beat.id,
      title: sc.title + " — " + beat.label,
      skill: sc.skill, secondary: sc.secondary,
      fields: beat.fields, checks: beat.checks, scoring: beat.scoring,
      model: beat.model, aiBrief: beat.aiBrief,
      sevOptions: beat.fields.some(f => f.id === "sev"),
      hasDecision: beat.fields.some(f => f.id === "decision"),
      render: beat.render, from: sc.from, brief: sc.brief, clock: beat.clock
    };
  }
  return {
    type: sc.type, scenarioId: sc.id, beatId: "-",
    title: sc.title, skill: sc.skill, secondary: sc.secondary,
    fields: sc.fields, checks: sc.checks, scoring: sc.scoring,
    model: sc.model, aiBrief: sc.aiBrief,
    render: sc.render, from: sc.from, brief: sc.brief
  };
}

function answerKey(spec, fieldId){ return spec.scenarioId + "." + spec.beatId + "." + fieldId; }
function getAnswer(spec, fieldId){ return S.flow.answers[answerKey(spec, fieldId)]; }
function setAnswer(spec, fieldId, v){ S.flow.answers[answerKey(spec, fieldId)] = v; }
function answersFor(spec){
  const out = {};
  (spec.fields||[]).forEach(f => { out[f.id] = getAnswer(spec, f.id); });
  return out;
}

function ctxFor(spec){
  return {
    company: BRIGHTPATH,
    playerName: S.player.name,
    npc: BRIGHTPATH.people[spec.from] || BRIGHTPATH.people.priya
  };
}

/* ---------------- triage grading ---------------- */
function gradeTriage(signal){
  const plan = currentPlan();
  const ideal = plan.inbox.slice().sort((a,b) => a.trueRank - b.trueRank).map(i => i.id);
  const chosen = S.flow.order;
  const n = ideal.length;
  let displacement = 0;
  chosen.forEach((id, idx) => { displacement += Math.abs(ideal.indexOf(id) - idx); });
  const worst = Math.floor(n*n/2);
  const orderScore = Math.max(0, 1 - displacement / Math.max(1, worst));
  const topRight = chosen[0] === ideal[0];
  const topTwo = chosen.slice(0,2).filter(id => ideal.slice(0,2).includes(id)).length;

  const spec = {
    type:"triage", scenarioId:"triage-d" + plan.day, beatId:"-",
    title:"Morning triage", skill:"stake",
    fields:[{ id:"triageJustify", kind:"textarea", label:"Why that order" }],
    checks: plan.triageChecks, scoring:{},
    aiBrief:"The trainee ordered a morning inbox and justified it. The defensible order, with the reasoning behind each position:\n" +
      plan.inbox.slice().sort((a,b)=>a.trueRank-b.trueRank).map((i,idx) => (idx+1) + ". [" + i.src + "] " + i.from + " — " + i.subject + "\n   Why: " + i.why).join("\n") +
      "\nThey ordered it: " + chosen.map((id,idx) => (idx+1) + ". " + (plan.inbox.find(x=>x.id===id)||{}).subject).join(" | ") +
      "\nGrade the reasoning far more heavily than the exact sequence — several orders are defensible, but the justification must show they weighed consequence and decay rather than volume. Penalise an order driven by whoever shouted loudest."
  };
  const answers = { triageJustify: S.flow.triageJustify };
  const gate = effortGate(answers, spec.fields, spec.scenarioId);
  if (gate) return Promise.resolve(gate);

  const local = localGrade(spec, answers, ctxFor({from:"priya"}));
  // fold the ordering itself into judgement
  const ordPts = (orderScore * 3) + (topRight ? 1.5 : 0) + (topTwo === 2 ? 0.5 : 0);
  local.dims.judgement = Math.max(0, Math.min(5, Math.round((local.dims.judgement + Math.min(5, ordPts)) / 2)));
  local.orderScore = orderScore;
  local.ideal = ideal.map(id => plan.inbox.find(x => x.id === id));
  local.chosen = chosen;
  local.spec = spec;
  return aiGrade(spec, answers, ctxFor({from:"priya"}), signal).then(ai => {
    if (!ai) return local;
    ai.dims.judgement = Math.max(0, Math.min(5, Math.round((ai.dims.judgement * 2 + Math.min(5, ordPts)) / 3)));
    ai.orderScore = orderScore; ai.ideal = local.ideal; ai.chosen = chosen; ai.spec = spec;
    ai.words = local.words;
    return ai;
  });
}

/* ---------------- debrief ---------------- */
function debriefFallback(){
  const rs = S.flow.results;
  const avg = d => rs.length ? rs.reduce((a,r)=>a+r.dims[d],0)/rs.length : 0;
  const best = DIM_ORDER.slice().sort((a,b)=>avg(b)-avg(a))[0];
  const worst = DIM_ORDER.slice().sort((a,b)=>avg(a)-avg(b))[0];
  const flagged = rs.filter(r => r.integrity);
  const lines = [];
  lines.push("Right. " + rs.length + (rs.length === 1 ? " piece" : " pieces") + " of work today. Let me do this in order.");
  rs.forEach(r => {
    const a = DIM_ORDER.reduce((x,d)=>x+r.dims[d],0)/4;
    lines.push("**" + r.title + "** — " + (a>=4?"strong":a>=3?"solid":a>=2?"patchy":"under the line") + ". " +
      (r.hits[0] ? "You got " + lower(r.hits[0]) + ". " : "") +
      (r.misses[0] ? "You did not get " + lower(r.misses[0]) + "." : "Nothing material missed."));
  });
  if (flagged.length) lines.push("And we need to talk about " + flagged[0].title + ". " + flagged[0].integrity.reason + " That is not a technical mistake, and it is the one thing I will not coach you through twice.");
  lines.push("Across the day your " + DIMS[best].toLowerCase() + " is carrying you and your " + DIMS[worst].toLowerCase() + " is not. " + localCoach({technical:avg("technical"),judgement:avg("judgement"),communication:avg("communication"),craft:avg("craft")}, []));
  return lines.join("\n\n");
}
function lower(s){ return String(s).replace(/^[A-Z]/, c => c.toLowerCase()); }

async function buildDebrief(){
  const sample = await getSample();
  const rs = S.flow.results;
  const plan = currentPlan();
  if (!sample) return { text: debriefFallback(), source:"local" };
  const dump = rs.map(r => "— " + r.title + ": technical " + r.dims.technical + ", judgement " + r.dims.judgement +
      ", communication " + r.dims.communication + ", craft " + r.dims.craft +
      "\n   Did well: " + (r.hits.slice(0,3).join("; ") || "little") +
      "\n   Missed: " + (r.misses.slice(0,3).join("; ") || "nothing material") +
      (r.integrity ? "\n   INTEGRITY FLAG: " + r.integrity.reason : "")).join("\n");
  const p = BRIGHTPATH.people.priya;
  const prompt = `You are ${p.name}, ${p.role} at ${BRIGHTPATH.name}. ${p.style}

It is the end of ${S.player.name}'s working day — day ${S.day} of the quarter. ${plan.standing}

Here is how their work scored today:
${dump}

Write their end-of-day debrief, in character, speaking to them directly. British English. 150-220 words. Rules:
- Reference their actual work, task by task, briefly. Specific, not generic.
- Praise precisely where earned, and not at all where it is not. Priya does not hand out participation trophies.
- Criticise constructively: name the gap, then the habit that closes it.
- End with exactly one development point, opening with "Watch this:".
- If there is an integrity flag, that becomes the whole of the debrief's centre of gravity and the tone hardens considerably.
- No bullet points. No headings. Speech, the way a manager talks at 6pm.
Reply with the debrief text only.`;
  try {
    const r = await sample(prompt, { modelTier:"default", cache:false });
    return { text: r.text, source:"ai" };
  } catch(e){ return { text: debriefFallback(), source:"local" }; }
}
