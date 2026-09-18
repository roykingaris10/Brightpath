/* ============================================================
   UI
   ============================================================ */
let BUSY = null;         // {label, ctl}
let LAST_RESULT = null;  // transient view model for review screens
let AI_STATE = "checking";

const app = () => document.getElementById("app");

function render(){
  const ae = document.activeElement;
  const keep = ae && ae.id ? { id:ae.id, s:ae.selectionStart, e:ae.selectionEnd } : null;
  let body;
  try { body = renderMain(); }
  catch (err) {
    console.error(err);
    body = `<div class="card pad stack">
      <div><span class="eyebrow">Something went wrong</span>
        <h1 style="font-size:21px;margin-top:5px">That screen could not be drawn</h1></div>
      <p class="muted">Your career is saved and intact. Start the next day, or export your save from Save &amp; settings first.</p>
      <p class="tiny muted mono">${esc(String(err && err.message || err))}</p>
      <div class="row"><button class="btn primary" data-act="recover">Back to a working screen</button>
        <button class="btn ghost" data-act="view" data-v="save">Save &amp; settings</button></div>
    </div>`;
  }
  app().innerHTML = `<div class="app">${renderRail()}<main class="main"><div class="main-inner">${body}</div></main></div>`;
  if (keep) {
    const el = document.getElementById(keep.id);
    if (el) { el.focus(); try { el.setSelectionRange(keep.s, keep.e); } catch(e){} }
  }
  paintSaveStatus();
}

function paintSaveStatus(){
  const el = document.getElementById("saveStatus");
  if (el) el.textContent = saveStatus;
}

/* ---------------- rail ---------------- */
function renderRail(){
  const d = gameDate(S.tier, S.quarter, S.day);
  const avg = d2 => { const t = S.dimTotals[d2]; return t.n ? (t.sum/t.n).toFixed(1) : "—"; };
  return `<aside class="rail">
    <div class="brand"><b>GRC Grind</b><span>Tier ${S.tier}</span></div>

    <div class="railcard">
      <span class="k">Employer</span>
      <div class="v">${esc(BRIGHTPATH.short)}</div>
      <div class="sub">${esc(S.player.name)} · ${esc(BRIGHTPATH.role)}</div>
    </div>

    <div class="railcard">
      <span class="k">Working day</span>
      <div class="v">${fmtDate(d)}</div>
      <div class="sub">Q${S.quarter} · day ${S.day} · ${S.xp} XP · integrity ${S.integrity}%</div>
    </div>

    <div class="rail-deep">
      <div class="railhead"><span>Running average</span></div>
      <div class="scoregrid" style="grid-template-columns:repeat(2,1fr);gap:6px">
        ${DIM_ORDER.map(k => `<div class="sbox" style="padding:7px 9px">
          <div class="dn eyebrow" style="font-size:9px">${esc(DIMS[k].split(" ")[0])}</div>
          <div class="n" style="font-size:17px">${avg(k)}</div></div>`).join("")}
      </div>
    </div>

    <div class="rail-deep">
      <div class="railhead"><span>Skill tree</span><span>${SKILL_ORDER.filter(k=>S.skills[k]>0).length}/${SKILL_ORDER.length}</span></div>
      ${SKILL_ORDER.map(k => {
        const xp = skillXp(k), lv = skillLevel(xp);
        const pct = lv.idx === 3 ? 100 : Math.round(((xp - lv.floor) / (lv.ceil - lv.floor)) * 100);
        return `<div class="skillrow"><span class="nm">${esc(SKILLS[k])}</span><span class="lv">${esc(lv.name)}</span>
          <span class="bar"><i style="width:${Math.max(2,Math.min(100,pct))}%"></i></span></div>`;
      }).join("")}
    </div>

    <div>
      <div class="railhead"><span>Elsewhere</span></div>
      <div class="navlist">
        ${[["day","Today"],["handbook","The handbook"],["register","Risk register"],["company","The company"],["record","My record"],["save","Save & settings"]]
          .map(([v,l]) => `<button class="navbtn" data-act="view" data-v="${v}" aria-current="${S.ui.view===v}">${l}</button>`).join("")}
      </div>
    </div>

    <div class="tiny muted" style="margin-top:auto;padding-top:10px">
      <span class="eyebrow">Save</span> <span id="saveStatus">${esc(saveStatus)}</span><br>
      <span class="eyebrow">AI</span> ${AI_STATE === "on" ? "manager grading live" : AI_STATE === "checking" ? "checking…" : "rubric grader (offline)"}
    </div>
  </aside>`;
}

/* ---------------- main router ---------------- */
function renderMain(){
  if (S.ui.view === "handbook") return viewHandbook();
  if (S.ui.view === "register") return viewRegister();
  if (S.ui.view === "company")  return viewCompany();
  if (S.ui.view === "record")   return viewRecord();
  if (S.ui.view === "save")     return viewSave();
  if (!S.flow) return viewOnboard();
  repairFlow();
  switch (S.flow.phase) {
    case "briefing":     return viewBriefing();
    case "triage":       return viewTriage();
    case "triageReview": return viewReview("triage");
    case "task":         return viewTask();
    case "taskReview":   return viewReview("task");
    case "debrief":      return viewDebrief();
    case "dayEnd":       return viewDayEnd();
    default:             return viewBriefing();
  }
}

/* ---------------- onboarding ---------------- */
function viewOnboard(){
  return `<div class="card pad stack">
    <div><span class="eyebrow">Phase 1 · Tier 1</span>
    <h1 style="font-size:30px;margin-top:6px">You start on Monday at Brightpath Learning.</h1></div>
    <p class="muted">Forty-five people in Shoreditch, eight million pounds of Series A, two hundred and ten schools trusting them with children's records, and an information security management system that currently consists of a Confluence page called <em>security stuff (old)</em>.</p>
    <p class="muted">A thirty-four school academy trust will sign a £1.4m contract the day Brightpath holds an ISO/IEC 27001 certificate. Nobody here has ever seen one. You are the first security hire, reporting to a vCISO who is in the building two days a week.</p>
    <hr class="rule">
    <label class="field"><span class="lb">Your name<span class="hint">this is who the NPCs will address</span></span>
      <input type="text" id="pname" data-field="pname" value="${esc(S.player.name)}" maxlength="42"></label>
    <div class="row"><button class="btn primary" data-act="begin">Start day one</button>
      <button class="btn" data-act="view" data-v="handbook">Read the handbook first</button>
      <button class="btn ghost" data-act="view" data-v="save">Import a save</button></div>
    <div class="callout"><span class="ch">New to GRC?</span>Start with <strong>The handbook</strong>. It explains what the job actually is, which parts of Information Governance already transfer, every term this simulator uses, and a full worked example of a risk write-up built step by step. Coached mode is on by default — it puts the glossary and the method inside each task.</div>
    <hr class="rule">
    ${howToPlay()}
  </div>`;
}

function howToPlay(){
  return `<div class="stack">
    <div><span class="eyebrow">How to play</span></div>
    <div class="kv">
      <dt>The loop</dt><dd>Each session is one working day: a morning briefing and inbox, a graded triage call, two pieces of real work, then your manager's debrief.</dd>
      <dt>Triage</dt><dd>Put the inbox in the order you would actually work it and say why. The order matters less than the reasoning — and the most important thing in the list is rarely the loudest.</dd>
      <dt>The work</dt><dd>Every task hands you a real artefact: a thread, a returned questionnaire, a certificate, a live incident. Read it properly. Flaws are planted, never flagged — finding them is the exercise.</dd>
      <dt>Coached mode</dt><dd>On by default. Each task carries a glossary of its terms, the method for building the answer, and a note under every field. It never reveals the planted flaw. Switch it off in Save &amp; settings when you no longer need it.</dd>
      <dt>Grading</dt><dd>Four dimensions, 0–5: technical accuracy, judgement, communication, professional craft. A 3 is a competent professional job. A 5 is rare. Asking for the answer without attempting it gets you a hint and nothing else.</dd>
      <dt>Integrity</dt><dd>One stat is not recoverable by being clever. Advising the company to conceal a reportable matter, fabricate evidence or mislead an auditor ends badly, immediately.</dd>
      <dt>Saving</dt><dd>Progress saves automatically where storage is available, and there is always an export/import you can paste somewhere safe.</dd>
    </div>
  </div>`;
}

/* ---------------- briefing ---------------- */
function viewBriefing(){
  const plan = currentPlan(), d = gameDate(S.tier, S.quarter, S.day);
  return `<div class="card pad stack">
      <div class="spread"><div><span class="eyebrow">Morning briefing · ${esc(fmtDate(d))}</span>
        <h1 style="font-size:26px;margin-top:6px">${esc(plan.headline)}</h1></div>
        <span class="pill info">Day ${S.day}</span></div>
      <p class="muted">${esc(plan.standing)}</p>
      <hr class="rule">
      <div class="kv">
        <dt>In flight</dt><dd>${BRIGHTPATH.drama}</dd>
        <dt>Your objectives</dt><dd>${BRIGHTPATH.objectives.map(o=>esc(o)).join("<br>")}</dd>
      </div>
    </div>
    <div class="card pad stack">
      <div><span class="eyebrow">First graded act of the day</span>
      <h2 style="font-size:19px;margin-top:5px">Open the inbox and decide what you are doing first.</h2></div>
      <p class="muted tiny">There are ${plan.inbox.length} items. At least two of them are competing for the same hour, and at least one is quieter than it deserves to be.</p>
      <div class="row"><button class="btn primary" data-act="toTriage">Open the inbox</button></div>
    </div>`;
}

/* ---------------- triage ---------------- */
function viewTriage(){
  const plan = currentPlan(), order = S.flow.order;
  const items = plan.inbox.map(i => {
    const pos = order.indexOf(i.id);
    return `<div class="item ${pos>=0?"picked":""}">
      <div class="ord">${pos>=0?pos+1:"·"}</div>
      <div><div class="src">${esc(i.src)} · ${esc(i.from)}</div>
        <div class="sj">${esc(i.subject)}</div>
        <div class="pv">${esc(i.preview)}</div></div>
      <button class="btn small pick" data-act="pick" data-id="${i.id}">${pos>=0?"Undo":"Next"}</button>
    </div>`;
  }).join("");
  const done = order.length === plan.inbox.length;
  return `<div class="card pad stack">
      <div class="spread"><div><span class="eyebrow">Triage · graded</span>
        <h1 style="font-size:23px;margin-top:5px">Order the inbox</h1></div>
        <span class="pill ${done?"good":""}">${order.length}/${plan.inbox.length} placed</span></div>
      <p class="muted tiny">Click <strong>Next</strong> on the item you would work first, then the second, and so on. You can undo the most recent placement at any time.</p>
    </div>
    <div class="inbox">${items}</div>
    <div class="card pad stack">
      <label class="field"><span class="lb">Why that order<span class="hint">Priya will read this. Three or four sentences.</span></span>
        <textarea id="triageJustify" data-field="triageJustify" rows="6" placeholder="What did you weigh? What are you consciously letting slip, and what happens if the day goes wrong?">${esc(S.flow.triageJustify)}</textarea></label>
      ${busyRow("Priya is reading your triage")}
      <div class="row"><button class="btn primary" data-act="submitTriage" ${done&&!BUSY?"":"disabled"}>Submit triage</button>
        ${!done?`<span class="tiny muted">Place every item first.</span>`:""}</div>
    </div>`;
}

function busyRow(label){
  if (!BUSY) return "";
  return `<div class="callout"><span class="thinking"><span class="spin"></span>${esc(BUSY.label||label)}</span>
    <div class="row" style="margin-top:9px"><button class="btn small" data-act="skipAi">Skip the wait — grade with the built-in rubric</button></div></div>`;
}

/* ---------------- task ---------------- */
function viewTask(){
  const spec = specForCurrent();
  if (!spec) return viewDebriefGate();
  const sc = currentScenario();
  const npc = BRIGHTPATH.people[spec.from];
  const beats = sc.type === "incident" ? sc.beats.length : 1;
  return `<div class="card pad stack">
      <div class="spread">
        <div><span class="eyebrow">Task ${S.flow.taskIdx+1} of ${currentPlan().tasks.length} · ${esc(typeLabel(sc.type))}</span>
          <h1 style="font-size:23px;margin-top:5px">${esc(spec.title)}</h1></div>
        <div style="text-align:right">
          <span class="pill">${esc(SKILLS[spec.skill])}</span>
          ${beats>1?`<div class="step" style="margin-top:6px">Beat <b>${S.flow.beatIdx+1}</b> of ${beats} · ${esc(spec.clock||"")}</div>`:""}
        </div>
      </div>
      <p class="muted">${esc(spec.brief)}</p>
      ${npc?`<p class="tiny muted">From ${esc(npc.name)}, ${esc(npc.role)}.</p>`:""}
    </div>
    ${spec.render()}
    <div class="card pad stack">
      <div><span class="eyebrow">Your work</span></div>
      ${coached() ? termsPanel(spec) + recipePanel(spec) : ""}
      ${spec.fields.map(f => renderField(spec, f)).join("")}
      ${spec.type === "risk" ? riskCriteriaPanel() : ""}
      ${spec.type === "incidentBeat" && spec.sevOptions ? sevPanel() : ""}
      ${busyRow("Your work is being marked")}
      <div class="row"><button class="btn primary" data-act="submitTask" ${BUSY?"disabled":""}>Submit</button>
        <button class="btn ghost" data-act="hint">I'm stuck — one hint${coached()?"":` <span class="tiny muted">(caps this task at 4)</span>`}</button></div>
      ${S.flow.hintShown ? `<div class="callout amberc"><span class="ch">Hint</span>${esc(S.flow.hintShown)}</div>` : ""}
    </div>`;
}

function typeLabel(t){ return { risk:"Risk write-up", supplier:"Supplier assessment", incident:"Incident decision" }[t] || t; }

function renderField(spec, f){
  const v = getAnswer(spec, f.id) || "";
  const id = "f_" + spec.scenarioId + "_" + spec.beatId + "_" + f.id;
  const lb = `<span class="lb">${esc(f.label)}${f.hint?`<span class="hint">${esc(f.hint)}</span>`:""}</span>`;
  const cc = coached() && FIELD_COACH[f.id] ? `<div class="coachline">${FIELD_COACH[f.id]}</div>` : "";
  if (f.kind === "textarea")
    return `<label class="field">${lb}${cc}<textarea id="${id}" data-field="ans" data-fid="${f.id}" rows="${f.rows||5}" placeholder="${esc(f.placeholder||"")}">${esc(v)}</textarea></label>`;
  if (f.kind === "select")
    return `<label class="field">${lb}${cc}<select id="${id}" data-field="ans" data-fid="${f.id}">${
      f.options.map(o => `<option${o===v?" selected":""}>${esc(o)}</option>`).join("")}</select></label>`;
  if (f.kind === "chips")
    return `<div class="field">${lb}${cc}<div class="chips">${
      f.options.map(o => `<button class="chip" data-act="chip" data-fid="${f.id}" data-v="${esc(o)}" aria-pressed="${o===v}">${esc(o)}</button>`).join("")}</div></div>`;
  return `<label class="field">${lb}<input type="text" id="${id}" data-field="ans" data-fid="${f.id}" value="${esc(v)}"></label>`;
}

function riskCriteriaPanel(){
  return `<div class="callout"><span class="ch">Brightpath risk criteria</span>
    <p>${esc(BRIGHTPATH.riskCriteria.scale)}</p>
    ${BRIGHTPATH.riskCriteria.appetite.map(([b,t])=>`<p><strong class="mono">${esc(b)}</strong> — ${esc(t)}</p>`).join("")}
    <p>${esc(BRIGHTPATH.riskCriteria.ownerRule)}</p></div>`;
}
function sevPanel(){
  return `<div class="callout"><span class="ch">Brightpath severity scale</span>
    ${SEV_SCALE.map(([k,t])=>`<p><strong class="mono">${esc(k)}</strong> — ${esc(t)}</p>`).join("")}</div>`;
}

/* ---------------- review ---------------- */
function viewReview(kind){
  const r = LAST_RESULT;
  if (!r) return `<div class="card pad stack">
      <div><span class="eyebrow">Picking up where you left off</span>
        <h1 style="font-size:21px;margin-top:5px">That feedback has already been filed</h1></div>
      <p class="muted">Your scores and XP were saved. The written feedback for that piece of work is not kept once the day moves on — everything graded is listed under <strong>My record</strong>.</p>
      <div class="row"><button class="btn primary" data-act="resume">Carry on with the day</button>
        <button class="btn ghost" data-act="view" data-v="record">See my record</button></div>
    </div>`;
  if (r.refused) return `<div class="card pad stack">
      <div><span class="eyebrow">Not graded</span><h1 style="font-size:22px;margin-top:5px">${esc(r.reason)}</h1></div>
      <p class="muted">I am not giving you the answer. Here is where to look.</p>
      ${r.hints.map(h=>`<div class="callout amberc"><span class="ch">Hint</span>${esc(h)}</div>`).join("")}
      <div class="row"><button class="btn primary" data-act="backToWork">Go back and do it properly</button></div>
    </div>`;

  const avg = DIM_ORDER.reduce((a,d)=>a+r.dims[d],0)/4;
  const npc = r.npcFrom ? BRIGHTPATH.people[r.npcFrom] : BRIGHTPATH.people.priya;
  return `<div class="review ${r.integrity?"flagged":""}">
      <div class="pad" style="padding-bottom:14px">
        <div class="spread"><div><span class="eyebrow">${kind==="triage"?"Triage review":"Marked"} · ${esc(r.title||"")}</span>
          <h1 style="font-size:21px;margin-top:5px;max-width:34ch">${esc(r.verdict)}</h1></div>
          <div style="text-align:right"><div class="eyebrow">Average</div>
            <div style="font-size:30px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.1">${avg.toFixed(2)}</div>
            <div class="tiny muted">+${r.gained||0} XP</div></div></div>
      </div>
      <div class="dims">${DIM_ORDER.map(d => {
        const v = r.dims[d], cls = v<=1?"low":v<=2?"mid":"";
        return `<div class="dim"><div class="dn">${esc(DIMS[d])}</div><div class="dv">${v}<small>/5</small></div>
          <div class="dots ${cls}">${[0,1,2,3,4].map(i=>`<i class="${i<v?"on":""}"></i>`).join("")}</div></div>`;
      }).join("")}</div>
      <div class="pad stack">
        ${r.integrity ? `<div class="callout red"><span class="ch">Integrity</span>${esc(r.integrity.reason)} Judgement scored zero and your integrity rating has taken a permanent hit. There is no version of this job where that is a shortcut.</div>` : ""}
        ${npc && r.npcLine ? `<div><span class="eyebrow">${esc(npc.name)}</span><p class="npcline" style="margin-top:5px">“${esc(r.npcLine)}”</p></div>` : ""}
        ${r.hits.length ? `<div><span class="eyebrow">What you got</span><ul class="fb-list" style="margin-top:7px">${
          r.hits.map(h=>`<li class="hit"><span class="mk">✓</span><span>${esc(h)}</span></li>`).join("")}</ul></div>` : ""}
        ${r.misses.length ? `<div><span class="eyebrow">What you missed</span><ul class="fb-list" style="margin-top:7px">${
          r.misses.map(h=>`<li class="miss"><span class="mk">✕</span><span>${esc(h)}</span></li>`).join("")}</ul></div>` : ""}
        ${r.notes && r.notes.length ? r.notes.map(n=>`<div class="callout"><span class="ch">Correction</span>${esc(n)}</div>`).join("") : ""}
        ${r.coach ? `<div class="callout amberc"><span class="ch">Development point</span>${esc(r.coach)}</div>` : ""}
        ${kind==="triage" ? triageOrderPanel(r) : ""}
        ${r.model ? `<details><summary style="cursor:pointer;font-size:13px;font-weight:600;padding:6px 0">Show the approach I was looking for</summary>
          <div class="sheet" style="margin-top:9px"><div class="sheet-bd">${para(esc(r.model))}</div></div></details>` : ""}
        <div class="row"><button class="btn primary" data-act="continue">${esc(r.nextLabel||"Continue")}</button>
          <span class="tiny muted">${r.source==="ai"?"Graded by your manager.":"Graded against the built-in rubric."}</span></div>
      </div>
    </div>`;
}

function triageOrderPanel(r){
  if (!r.ideal) return "";
  return `<div><span class="eyebrow">A defensible order, and why</span>
    <div class="inbox" style="margin-top:8px">${r.ideal.map((i,idx) => {
      const yours = r.chosen.indexOf(i.id) + 1;
      const delta = Math.abs(yours - (idx+1));
      return `<div class="item"><div class="ord" style="border-style:solid">${idx+1}</div>
        <div><div class="src">${esc(i.src)} · ${esc(i.from)}</div><div class="sj">${esc(i.subject)}</div>
        <div class="pv">${esc(i.why)}</div></div>
        <span class="pill ${delta===0?"good":delta<=1?"":"warn"}">you: ${yours}</span></div>`;
    }).join("")}</div>
    <p class="tiny muted" style="margin-top:8px">Several orders are defensible. This one is not the only right answer — it is the one whose reasoning holds up.</p></div>`;
}

/* ---------------- debrief ---------------- */
function viewDebriefGate(){
  return `<div class="card pad stack"><p>All work complete.</p>
    <button class="btn primary" data-act="toDebrief">End of day</button></div>`;
}
function viewDebrief(){
  const dbf = S.flow.debrief;
  const p = BRIGHTPATH.people.priya;
  const rs = S.flow.results;
  const avg = d => rs.length ? (rs.reduce((a,x)=>a+x.dims[d],0)/rs.length) : 0;
  return `<div class="card pad stack">
      <div><span class="eyebrow">End of day · debrief</span>
        <h1 style="font-size:23px;margin-top:5px">${esc(p.name)} catches you on the way out</h1></div>
      ${dbf ? `<div class="sheet"><div class="sheet-bd npcline" style="font-style:normal">${para(esc(dbf.text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"))}</div></div>`
            : `<div class="callout"><span class="thinking"><span class="spin"></span>Priya is looking through the day's work…</span></div>`}
      <hr class="rule">
      <div><span class="eyebrow">Today's average by dimension</span>
        <div class="scoregrid" style="margin-top:9px">${DIM_ORDER.map(d=>`<div class="sbox">
          <div class="eyebrow" style="font-size:9.5px">${esc(DIMS[d])}</div>
          <div class="n">${avg(d).toFixed(1)}</div></div>`).join("")}</div></div>
      ${dbf ? `<div class="row"><button class="btn primary" data-act="closeDay">Go home</button></div>` : ""}
    </div>`;
}

function viewDayEnd(){
  const nextDay = S.day + 1;
  const weekDone = S.day >= DAY_PLANS.length;
  return `<div class="card pad stack">
      <div><span class="eyebrow">Day ${S.day} complete</span>
        <h1 style="font-size:25px;margin-top:5px">${weekDone ? "That is the working week." : "Same time tomorrow."}</h1></div>
      ${weekDone ? `<p class="muted">You have worked through every scenario Phase 1 ships with: two risk write-ups you had to argue for, three supplier assessments including one that was a trap in the opposite direction, and two incidents with genuinely different right answers.</p>
        <p class="muted">Quarterly performance review, the recruiter, the interview mini-game, the remaining eleven task types, random events and Harland &amp; Moore Logistics all arrive in Phase 2. Say <strong>next phase</strong> and your save comes with you.</p>` : ""}
      <div><span class="eyebrow">Where you stand</span>
        <div class="scoregrid" style="margin-top:9px">
          <div class="sbox"><div class="eyebrow" style="font-size:9.5px">Total XP</div><div class="n">${S.xp}</div></div>
          <div class="sbox"><div class="eyebrow" style="font-size:9.5px">Integrity</div><div class="n">${S.integrity}%</div></div>
          <div class="sbox"><div class="eyebrow" style="font-size:9.5px">Pieces of work</div><div class="n">${S.cv.length}</div></div>
          <div class="sbox"><div class="eyebrow" style="font-size:9.5px">Weakest</div><div class="n" style="font-size:15px;padding-top:4px">${esc(DIMS[weakestDims()[0]||"technical"])}</div></div>
        </div></div>
      <div class="row">
        ${weekDone ? `<button class="btn" data-act="nextDay">Work the week again (same scenarios)</button>`
                   : `<button class="btn primary" data-act="nextDay">Start day ${nextDay}</button>`}
        <button class="btn ghost" data-act="view" data-v="record">See my record</button>
      </div>
    </div>`;
}

/* ---------------- side views ---------------- */
function viewRegister(){
  const rows = S.register.map(r => {
    const sc = (r.l||0)*(r.i||0);
    const cls = sc>=15?"bad":sc>=8?"warn":"good";
    return [`<span class="mono">${esc(r.id)}</span>`, `<strong>${esc(r.title)}</strong><br><span class="muted tiny">${esc(r.statement)}</span>`,
      `<span class="mono">${r.l||"—"}×${r.i||"—"}</span>`, `<span class="pill ${cls}">${sc||"—"}</span>`,
      esc(r.owner||"—"), esc(r.treatment||"—"), `<span class="muted tiny">${esc(r.note||"")}</span>`];
  });
  return `<div class="card pad stack">
      <div><span class="eyebrow">Inherited</span><h1 style="font-size:23px;margin-top:5px">Brightpath risk register</h1></div>
      <p class="muted tiny">This is what was here when you arrived. Four entries, two of which are nouns. Rewriting it is the job.</p>
    </div>
    ${tableSheet("Risk register", "as at your start date", "",
      ["ID","Risk","L×I","Score","Owner","Treatment","Note"], rows)}
    <div class="card pad">${riskCriteriaPanel()}</div>`;
}

function viewCompany(){
  const ppl = Object.keys(BRIGHTPATH.people).map(k => {
    const p = BRIGHTPATH.people[k];
    return `<div class="item" style="grid-template-columns:minmax(0,1fr)"><div>
      <div class="sj">${esc(p.name)}</div><div class="src">${esc(p.role)}</div>
      <div class="pv" style="margin-top:4px">${esc(p.style)}</div></div></div>`;
  }).join("");
  return `<div class="card pad stack">
      <div><span class="eyebrow">Tier 1 employer</span><h1 style="font-size:25px;margin-top:5px">${esc(BRIGHTPATH.name)}</h1></div>
      <p class="muted">${esc(BRIGHTPATH.blurb)}</p>
      <div class="kv"><dt>Product</dt><dd>${esc(BRIGHTPATH.product)}</dd>
        <dt>Your role</dt><dd>${esc(BRIGHTPATH.role)} · ${esc(BRIGHTPATH.salary)}</dd>
        <dt>In flight</dt><dd>${esc(BRIGHTPATH.drama)}</dd>
        <dt>Frameworks</dt><dd>${BRIGHTPATH.frameworks.map(esc).join(" · ")}</dd></div>
    </div>
    <div class="card pad stack"><div><span class="eyebrow">Who you work with</span></div><div class="inbox">${ppl}</div></div>
    ${tableSheet("Systems in scope", "as understood today", "", ["System","What it is"],
      BRIGHTPATH.systems.map(([a,b]) => [`<strong>${esc(a)}</strong>`, esc(b)]))}
    ${tableSheet("Policy register", "", "", ["Document","State"],
      BRIGHTPATH.policyRegister.map(([a,b,c]) => [`<strong>${esc(a)}</strong>`, `<span class="pill ${c}">${esc(b)}</span>`]))}
    ${tableSheet("Supplier estate", "", "", ["Supplier","Service","Tier"],
      BRIGHTPATH.suppliers.map(([a,b,c]) => [`<strong>${esc(a)}</strong>`, esc(b), `<span class="pill ${c==="Untiered"?"warn":""}">${esc(c)}</span>`]))}`;
}

function viewRecord(){
  const rows = S.cv.slice().reverse().map(c => [
    `<span class="mono">D${c.day}</span>`, `<strong>${esc(c.title)}</strong>`, esc(SKILLS[c.skill]||c.skill),
    `<span class="mono">${c.dims.technical}/${c.dims.judgement}/${c.dims.communication}/${c.dims.craft}</span>`,
    `<span class="pill ${c.avg>=4?"good":c.avg>=3?"":"warn"}">${c.avg.toFixed(2)}</span>`]);
  return `<div class="card pad stack">
      <div><span class="eyebrow">Practice experience</span><h1 style="font-size:23px;margin-top:5px">My record</h1></div>
      <p class="muted tiny">Every graded piece of work, with its four dimension scores in order: technical / judgement / communication / craft. The CV generator that turns this into honestly-framed bullets arrives in Phase 3.</p>
      ${S.integrityEvents.length ? `<div class="callout red"><span class="ch">Integrity record</span>${
        S.integrityEvents.map(e=>`<p>Day ${e.day} — ${esc(e.task)}: ${esc(e.reason)}</p>`).join("")}</div>` : ""}
    </div>
    ${rows.length ? tableSheet("Work completed", S.cv.length + " pieces", "", ["Day","Task","Skill branch","T/J/C/C","Avg"], rows)
      : `<div class="card pad muted">Nothing graded yet.</div>`}
    <div class="card pad stack"><div><span class="eyebrow">Skill branches</span></div>
      ${SKILL_ORDER.map(k => { const lv = skillLevel(skillXp(k));
        return `<div class="skillrow"><span class="nm">${esc(SKILLS[k])}</span><span class="lv">${esc(lv.name)} · ${skillXp(k)} xp</span>
          <span class="bar"><i style="width:${lv.idx===3?100:Math.max(2,Math.round(((skillXp(k)-lv.floor)/(lv.ceil-lv.floor))*100))}%"></i></span></div>`;
      }).join("")}</div>`;
}

function viewSave(){
  return `<div class="card pad stack">
      <div><span class="eyebrow">Save & settings</span><h1 style="font-size:23px;margin-top:5px">Your career, as text</h1></div>
      <p class="muted tiny">Status: <strong>${esc(saveStatus)}</strong>. Progress is written automatically at the end of every graded piece of work. Copy the export somewhere safe if you want a career you cannot lose.</p>
      <hr class="rule">
      <div><span class="eyebrow">Difficulty</span></div>
      <div class="chips">
        <button class="chip" data-act="coach" data-v="1" aria-pressed="${coached()}">Coached</button>
        <button class="chip" data-act="coach" data-v="0" aria-pressed="${!coached()}">Unassisted</button>
      </div>
      <p class="muted tiny">Coached shows a plain-English glossary of the terms in each task, the method for building the answer, and a note under every field explaining what it wants. It never tells you what is wrong in the artefact — finding that is always the exercise. Hints cost nothing in coached mode. Turn it off when the vocabulary has stopped being the obstacle.</p>
      <hr class="rule">
      <label class="field"><span class="lb">Export<span class="hint">select all and copy</span></span>
        <textarea id="exportBox" rows="6" readonly>${esc(serialise())}</textarea></label>
      <div class="row"><button class="btn" data-act="copySave">Copy export</button><button class="btn" data-act="saveNow">Save now</button></div>
      <hr class="rule">
      <label class="field"><span class="lb">Import<span class="hint">paste a save and load it — this replaces the career you are in</span></span>
        <textarea id="importBox" rows="5" placeholder='{"v":3,...}'></textarea></label>
      <div class="row"><button class="btn" data-act="importSave">Load that save</button></div>
      <div id="importMsg" class="tiny muted"></div>
      <hr class="rule">
      <div class="row"><button class="btn" data-act="hardReset">Start a new career</button>
        <span class="tiny muted">Wipes this save. There is no undo.</span></div>
    </div>`;
}
