/* ============================================================
   Handbook view + coached-mode panels
   ============================================================ */

function viewHandbook(){
  const sec = S.ui.hb || "job";
  const tabs = [["job","What the job is"],["bridge","What you already have"],["words","The words"],["worked","A worked example"],["marks","How you're marked"]];
  return `<div class="card pad stack">
      <div><span class="eyebrow">Reference · read in any order</span>
        <h1 style="font-size:27px;margin-top:6px">The handbook</h1></div>
      <p class="muted">Nothing in this job is difficult to understand. It is a small craft with a large vocabulary, and the vocabulary is the only part that takes time. Read this once, then keep it open while you work.</p>
      <div class="chips">${tabs.map(([k,l]) => `<button class="chip" data-act="hb" data-v="${k}" aria-pressed="${sec===k}">${esc(l)}</button>`).join("")}</div>
    </div>
    ${sec==="job" ? hbJob() : sec==="bridge" ? hbBridge() : sec==="words" ? hbWords() : sec==="worked" ? hbWorked() : hbMarks()}`;
}

function hbJob(){
  return `<div class="card pad stack">
      <div><span class="eyebrow">Governance, Risk and Compliance</span>
        <h2 style="font-size:21px;margin-top:5px">Four sentences that unlock most of it</h2></div>
      <p class="muted tiny">Governance is who decides and who is accountable, written down. Risk is a maintained list of what could go wrong, scored and owned. Compliance is measured against something named — a standard, or the law. Everything below hangs off those four words.</p>
      <div class="stack">${JOB_MODEL.map(([t,d,e]) => `<div class="callout">
        <span class="ch">${esc(t)}</span><p><strong>${esc(d)}</strong></p><p class="muted">${esc(e)}</p></div>`).join("")}</div>
      <hr class="rule">
      <div><span class="eyebrow">Put together</span>
        <p style="margin-top:6px">You are the person who makes an organisation able to <em>prove</em> it is managing security — to a customer, an auditor or a regulator. Not the person who makes it secure. That distinction sounds like a demotion and is actually the entire discipline: security without evidence cannot be sold, certified or defended.</p></div>
    </div>
    <div class="card pad stack">
      <div><span class="eyebrow">What the job is actually like</span></div>
      ${JOB_TRUTHS.map(([t,d]) => `<div><h3 style="font-size:16px">${esc(t)}</h3><p class="muted" style="margin-top:4px">${esc(d)}</p></div>`).join("")}
    </div>
    <div class="card pad stack">
      <div><span class="eyebrow">The honest market view</span>
        <h2 style="font-size:19px;margin-top:5px">Is a twelve-month pivot realistic from Information Governance?</h2></div>
      <p>Yes, and more easily than from most places. UK GRC job ads ask for framework literacy, risk-register discipline, evidence habits, supplier assurance and the ability to write for executives. You already have the two hardest-to-teach parts — statutory-deadline discipline and defensible decision-making — and you have controller/processor knowledge that most junior security hires genuinely lack.</p>
      <p>What you are missing is a specific, small and teachable list: the shape of the frameworks, register mechanics, certification machinery, and enough security vocabulary to challenge a claim without being able to configure anything. That is the list on the next tab, and it is the list this simulator drills.</p>
      <p class="muted tiny">The risk to your pivot is not capability. It is that your CV reads as privacy-only, so keep converting anything you touch at work into security-governance language — a records-retention exercise is data minimisation and A.8.10; a supplier DPA review is third-party assurance; an IG audit is internal audit under clause 9.</p>
    </div>`;
}

function hbBridge(){
  const row = ([t,sub,d,k]) => `<div class="item" style="grid-template-columns:auto minmax(0,1fr)">
      <span class="pill ${k==="have"?"good":"warn"}">${k==="have"?"have it":"to learn"}</span>
      <div><div class="sj">${esc(t)}</div><div class="src" style="text-transform:none;letter-spacing:.02em">${esc(sub)}</div>
      <div class="pv" style="margin-top:5px">${esc(d)}</div></div></div>`;
  return `<div class="card pad stack">
      <div><span class="eyebrow">The bridge</span><h2 style="font-size:21px;margin-top:5px">You are further in than you think</h2></div>
      <p class="muted">Information Governance and cyber GRC are the same instincts pointed at a different risk. Five of the ten things this job needs, you do already — including the one the incident task turned on.</p>
    </div>
    <div class="card pad stack"><div><span class="eyebrow">Already yours</span></div>
      <div class="inbox">${IG_BRIDGE.filter(r=>r[3]==="have").map(row).join("")}</div></div>
    <div class="card pad stack"><div><span class="eyebrow">The actual gap</span></div>
      <div class="inbox">${IG_BRIDGE.filter(r=>r[3]==="need").map(row).join("")}</div>
      <p class="muted tiny">Five things. None of them conceptual. This is a vocabulary and repetition problem, which is exactly what a simulator is for.</p></div>`;
}

function hbWords(){
  return GLOSSARY.map(([group, items]) => `<div class="card pad stack">
      <div><span class="eyebrow">${esc(group)}</span></div>
      ${items.map(([t,d,w]) => `<div>
        <h3 style="font-size:15.5px">${esc(t)}</h3>
        <p style="margin-top:3px">${esc(d)}</p>
        <p class="muted tiny" style="margin-top:3px"><strong>Why you care:</strong> ${esc(w)}</p></div>`).join('<hr class="rule">')}
    </div>`).join("");
}

function hbWorked(){
  return `<div class="card pad stack">
      <div><span class="eyebrow">Worked example</span><h2 style="font-size:21px;margin-top:5px">${esc(WORKED_EXAMPLE.title)}</h2></div>
      <p class="muted">${esc(WORKED_EXAMPLE.intro)}</p>
    </div>
    <div class="card pad stack">
      ${WORKED_EXAMPLE.steps.map(([h,body,note]) => `<div>
        <h3 style="font-size:16px">${esc(h)}</h3>
        <p style="margin-top:5px">${esc(body)}</p>
        <p class="muted tiny" style="margin-top:4px">${esc(note)}</p></div>`).join('<hr class="rule">')}
      <hr class="rule">
      <div class="callout"><span class="ch">The point</span>${esc(WORKED_EXAMPLE.outro)}</div>
    </div>`;
}

function hbMarks(){
  return `<div class="card pad stack">
      <div><span class="eyebrow">Grading</span><h2 style="font-size:21px;margin-top:5px">What the four numbers mean</h2></div>
      <p class="muted">Every piece of work is scored 0–5 on four dimensions. A <strong>3 is a competent professional job</strong> — that is the target, and it should feel earned. A 5 is rare and means an auditor could read it unchanged. Nothing here rewards length or enthusiasm.</p>
    </div>
    ${DIM_EXPLAIN.map(([k,q,detail,cheap]) => `<div class="card pad stack">
      <div class="spread"><div><span class="eyebrow">${esc(DIMS[k])}</span>
        <h3 style="font-size:17px;margin-top:4px;max-width:40ch">${esc(q)}</h3></div></div>
      <p class="muted">${esc(detail)}</p>
      <div class="callout amberc"><span class="ch">Quickest marks available</span>${esc(cheap)}</div>
    </div>`).join("")}
    <div class="card pad stack">
      <div><span class="eyebrow">Integrity</span><h3 style="font-size:17px;margin-top:4px">The one stat you cannot recover</h3></div>
      <p class="muted">Advising the organisation to conceal a reportable matter, fabricate or backdate evidence, destroy records, or mislead an auditor, customer or regulator ends the task immediately, zeroes judgement and permanently marks your record. Disagreeing with your manager is not an integrity failure. Helping someone hide something is.</p>
    </div>`;
}

/* ---------- panels shown inside a task when coached mode is on ---------- */
function termsPanel(spec){
  const t = termsForTask(spec);
  if (!t.length) return "";
  return `<details class="callout" style="padding:0" data-keep="terms"${S.ui.termsOpen?" open":""}>
    <summary style="cursor:pointer;padding:12px 14px;font-size:13px;font-weight:600">The words in this task <span class="muted" style="font-weight:400">— ${t.length} terms, plain English</span></summary>
    <div style="padding:0 14px 13px">${t.map(x => `<p style="margin-bottom:9px"><strong>${esc(x.term)}</strong> — ${esc(x.def)}<br><span class="muted tiny">${esc(x.why)}</span></p>`).join("")}
    <p class="tiny muted">Every term this simulator uses, grouped by domain, is in <button class="btn small ghost" data-act="view" data-v="handbook" style="padding:2px 6px">The handbook</button>.</p></div>
  </details>`;
}
function recipePanel(spec){
  const key = spec.type === "incidentBeat" ? "incident" : spec.type;
  const r = TASK_RECIPE[key];
  if (!r) return "";
  return `<details class="callout" style="padding:0" data-keep="recipe"${S.ui.recipeOpen?" open":""}>
    <summary style="cursor:pointer;padding:12px 14px;font-size:13px;font-weight:600">How to build this answer <span class="muted" style="font-weight:400">— the method, not the answer</span></summary>
    <div style="padding:0 14px 13px"><ol style="margin:0;padding-left:20px">${r.map(s => `<li style="margin-bottom:7px">${s}</li>`).join("")}</ol>
    <p class="muted tiny" style="margin-top:9px">This recipe is the same every time. What changes is the artefact — and what is wrong in it is never flagged, because finding it is the exercise.</p></div>
  </details>`;
}
