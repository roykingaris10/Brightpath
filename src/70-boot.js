/* ============================================================
   Controller and boot
   ============================================================ */

function startBusy(label){ BUSY = { label, ctl: new AbortController() }; render(); return BUSY.ctl.signal; }
function endBusy(){ BUSY = null; }

async function doSubmitTriage(){
  const signal = startBusy("Priya is reading your triage");
  let r;
  try { r = await gradeTriage(signal); } catch(e){ r = null; }
  endBusy();
  if (!r) { render(); return; }
  if (r.refused) { persistResult(r); S.flow.phase = "triageReview"; render(); saveGame(); return; }
  const spec = { skill:"stake", secondary:null, title:"Morning triage", scenarioId:r.spec.scenarioId, id:r.spec.scenarioId };
  r.gained = award(spec, r);
  recordCv(spec, r);
  r.title = "Morning triage";
  r.npcFrom = "priya";
  r.nextLabel = "Start work";
  S.flow.triageResult = { dims:r.dims, gained:r.gained };
  S.flow.results.push({ taskId:"triage", title:"Morning triage", dims:r.dims, hits:r.hits, misses:r.misses, integrity:r.integrity });
  persistResult(r);
  S.flow.phase = "triageReview";
  render();
  saveGame();
}

async function doSubmitTask(){
  const spec = specForCurrent();
  if (!spec) return;
  const signal = startBusy("Your work is being marked");
  let r;
  try { r = await gradeWork(spec, answersFor(spec), ctxFor(spec), signal); } catch(e){ r = null; }
  endBusy();
  if (!r) { render(); return; }
  if (r.refused) { persistResult(r); S.flow.phase = "taskReview"; render(); saveGame(); return; }

  if (S.flow.hintPenalty && !coached()) {
    r.dims.technical = Math.min(r.dims.technical, 4);
    r.dims.judgement = Math.min(r.dims.judgement, 4);
    r.notes = (r.notes||[]).concat(["You took a hint on this one, so technical accuracy and judgement are capped at 4. Worth it if it taught you something; expensive if it was impatience."]);
  }
  r.gained = award(spec, r);
  recordCv(spec, r);
  r.title = spec.title;
  r.model = spec.model;
  r.npcFrom = spec.from;
  const sc = currentScenario();
  const moreBeats = sc.type === "incident" && S.flow.beatIdx < sc.beats.length - 1;
  const moreTasks = S.flow.taskIdx < currentPlan().tasks.length - 1;
  r.nextLabel = moreBeats ? "Next beat" : moreTasks ? "Next task" : "End of day";
  S.flow.results.push({ taskId:spec.scenarioId, title:spec.title, dims:r.dims, hits:r.hits, misses:r.misses, integrity:r.integrity });
  if (!moreBeats && S.seen.indexOf(spec.scenarioId) < 0) S.seen.push(spec.scenarioId);
  S.flow.hintShown = null; S.flow.hintPenalty = false;
  persistResult(r);
  S.flow.phase = "taskReview";
  render();
  saveGame();
}

function advance(){
  const sc = currentScenario();
  const moreBeats = sc && sc.type === "incident" && S.flow.beatIdx < sc.beats.length - 1;
  if (moreBeats) { S.flow.beatIdx++; S.flow.hintShown = null; S.flow.hintCount = 0; S.flow.phase = "task"; clearResult(); render(); saveGame(); return; }
  S.flow.beatIdx = 0; S.flow.hintShown = null; S.flow.hintCount = 0;
  if (S.flow.taskIdx < currentPlan().tasks.length - 1) {
    S.flow.taskIdx++; S.flow.phase = "task"; clearResult(); render(); saveGame(); return;
  }
  toDebrief();
}

async function toDebrief(){
  S.flow.phase = "debrief"; clearResult(); render();
  const d = await buildDebrief();
  S.flow.debrief = d;
  S.dayLog.push({ day:S.day, quarter:S.quarter, results:S.flow.results.map(r=>({title:r.title,dims:r.dims})), debrief:d.text });
  render();
  saveGame();
}

function showHint(){
  const spec = specForCurrent();
  const pool = HINTS[spec.scenarioId] || ["Read the artefact again, line by line. What is stated there that you have not accounted for?"];
  const used = S.flow.hintCount || 0;
  S.flow.hintShown = pool[Math.min(used, pool.length-1)];
  S.flow.hintCount = used + 1;
  S.flow.hintPenalty = !coached();
  render();
}

/* ---------------- events ---------------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const act = b.dataset.act;

  if (act === "view") { S.ui.view = b.dataset.v; render(); return; }
  if (act === "begin") {
    const n = (document.getElementById("pname")||{}).value;
    S.player.name = (n && n.trim()) || "Alex Osei";
    startDay(); S.ui.view = "day"; render(); saveGame(); return;
  }
  if (act === "toTriage") { S.flow.phase = "triage"; render(); return; }
  if (act === "pick") {
    const id = b.dataset.id, i = S.flow.order.indexOf(id);
    if (i >= 0) S.flow.order.splice(i, 1); else S.flow.order.push(id);
    render(); return;
  }
  if (act === "submitTriage") { doSubmitTriage(); return; }
  if (act === "submitTask")   { doSubmitTask(); return; }
  if (act === "skipAi")       { if (BUSY) BUSY.ctl.abort(); return; }
  if (act === "hint")         { showHint(); return; }
  if (act === "hb")           { S.ui.hb = b.dataset.v; render(); return; }
  if (act === "coach")        { S.settings.coached = b.dataset.v === "1"; render(); saveGame(); return; }
  if (act === "chip") {
    const spec = specForCurrent();
    setAnswer(spec, b.dataset.fid, getAnswer(spec, b.dataset.fid) === b.dataset.v ? "" : b.dataset.v);
    render(); return;
  }
  if (act === "backToWork") { clearResult(); S.flow.phase = S.flow.triageResult ? "task" : "triage"; render(); return; }
  if (act === "continue")   { if (S.flow.phase === "triageReview") { S.flow.phase = "task"; clearResult(); render(); saveGame(); } else advance(); return; }
  if (act === "resume")     { clearResult(); repairFlow(); S.ui.view = "day"; render(); saveGame(); return; }
  if (act === "recover")    { clearResult(); if (S.flow) repairFlow(); else startDay(); S.ui.view = "day"; render(); saveGame(); return; }
  if (act === "toDebrief")  { toDebrief(); return; }
  if (act === "closeDay")   { S.flow.phase = "dayEnd"; render(); saveGame(); return; }
  if (act === "nextDay")    { S.day += 1; startDay(); S.ui.view = "day"; render(); saveGame(); return; }

  if (act === "saveNow")  { saveGame(); return; }
  if (act === "copySave") {
    const t = document.getElementById("exportBox");
    t.select(); try { document.execCommand("copy"); b.textContent = "Copied"; setTimeout(()=>{b.textContent="Copy export";},1600); } catch(err){}
    return;
  }
  if (act === "importSave") {
    const raw = (document.getElementById("importBox")||{}).value || "";
    const msg = document.getElementById("importMsg");
    try {
      const p = JSON.parse(raw);
      if (!p || !p.player) throw new Error("that is not a GRC Grind save");
      if (p.v !== GAME.save) throw new Error("that save is from a different version of the game (v" + p.v + ", this is v" + GAME.save + ")");
      S = migrate(p); S.ui.view = "day";
      if (!S.flow) startDay();
      render(); saveGame();
    } catch(err){ if (msg) msg.textContent = "Could not load that save — " + err.message + "."; }
    return;
  }
  if (act === "hardReset") {
    if (b.dataset.armed) {
      S = newGame(); try { localStorage.removeItem(LS_KEY); } catch(e){}
      getDB().then(db => { if (db) db.doc("saves/career").delete().catch(()=>{}); });
      render(); return;
    }
    b.dataset.armed = "1"; b.textContent = "Really? This deletes everything."; b.classList.add("primary");
    return;
  }
});

document.addEventListener("input", e => {
  const f = e.target.dataset ? e.target.dataset.field : null;
  if (!f) return;
  if (f === "pname") { S.player.name = e.target.value; return; }
  if (f === "triageJustify") { S.flow.triageJustify = e.target.value; return; }
  if (f === "ans") { setAnswer(specForCurrent(), e.target.dataset.fid, e.target.value); return; }
});
document.addEventListener("toggle", e => {
  const k = e.target.dataset ? e.target.dataset.keep : null;
  if (k === "terms")  S.ui.termsOpen  = e.target.open;
  if (k === "recipe") S.ui.recipeOpen = e.target.open;
}, true);

document.addEventListener("change", e => {
  const f = e.target.dataset ? e.target.dataset.field : null;
  if (f === "ans") setAnswer(specForCurrent(), e.target.dataset.fid, e.target.value);
});

/* ---------------- boot ---------------- */
async function start(hot){
  await loadGame();
  if (hot && hot.S) { try { S = migrate(hot.S); } catch(e){} }
  if (!S.flow && (S.cv.length > 0 || S.day > 1)) startDay();
  if (S.flow && S.flow.lastResult) LAST_RESULT = S.flow.lastResult;
  if (S.flow) repairFlow();
  render();
  if (S.flow && S.flow.phase === "debrief" && !S.flow.debrief) {
    buildDebrief().then(d => { S.flow.debrief = d; render(); saveGame(); });
  }
  const s = await getSample();
  AI_STATE = s ? "on" : "off";
  render();
}

if (window.claude && window.claude.hot) {
  try { window.claude.hot.snapshot(() => ({ S: JSON.parse(serialise()) })); } catch(e){}
}
if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(start);
else start(window.claude && window.claude.hot ? window.claude.hot.data : null);
