/* ============================================================
   Coached mode — scaffolding for someone learning the craft.
   ============================================================ */

const GLOSSARY_INDEX = {};
GLOSSARY.forEach(([group, items]) => items.forEach(([term, def, why]) => {
  GLOSSARY_INDEX[term.toLowerCase()] = { term, def, why, group };
}));
function lookupTerms(names){
  return (names||[]).map(n => GLOSSARY_INDEX[String(n).toLowerCase()]).filter(Boolean);
}

/* What each input actually wants. Keyed by field id, shared across scenarios. */
const FIELD_COACH = {
  statement: "One sentence, three parts, in this order: <strong>Because</strong> [what is already true and wrong] <strong>there is a risk that</strong> [the bad thing that could follow] <strong>resulting in</strong> [what it costs in money, harm, regulator or contract]. Long is fine. Order is what does the work.",
  likelihood: "How probable over the next twelve months, given what is true <em>today</em>. If it is already happening, that is a 5 — or it is not a risk at all, it is an issue.",
  impact: "How bad if it happens — to the organisation and to the people in the data. Children's safeguarding information sits high.",
  treatment: "Read your score against the appetite panel below, and let it choose. Above appetite means Modify. Retain needs an owner signing it off in writing. Share does not move a legal duty you hold.",
  owner: "Ask one question: who can authorise the fix — the money, the time or the change? Not the person who caused it, not the engineer who does the work, and never you.",
  rationale: "Three or four sentences: why that likelihood, why that impact, why that treatment given the appetite, why that owner. A number with a reason behind it is a defence; a number on its own is a guess.",

  tier: "How much harm could this supplier do you? Look at what data they actually touch, how much, how sensitive, and whether you could operate without them. This decides how much assurance it is reasonable to demand.",
  decision: "Approve, approve with conditions, decline, or escalate. Conditions are the usual grown-up answer — but only if they are gates with an owner and a date, not aspirations.",
  findings: "List what is wrong with the <em>assurance</em>, not with the supplier. Go through each document line by line and ask \"and?\" of every claim. Contradictions between two answers are worth more than any single weak answer.",
  conditions: "For each condition: what must be true, who does it, by when, and what does not happen until it is. \"We will monitor\" is not a condition.",
  note: "Two short paragraphs for a non-security reader who has to act. Say the decision first, then the reason, then what you need from them. No jargon walls.",

  sev: "Your internal scale for how hard the organisation should react. Completely separate from whether anything is reportable. Read the severity panel below, and if scope is still unknown, do not size it down to feel calmer.",
  actions: "Numbered, in order, each one a person doing a thing. Start with whatever is still getting worse while you type. Then whatever is about to become irreversible.",
  questions: "For each: the question, and who you are asking. A question you cannot address to a named person is not yet a question.",
  role: "Who is the controller of this data, and who is the processor? Everything you owe, to whom, and by when, follows from that one answer.",
  drive: "Is it part of this incident, a separate one, or the same incident with a much bigger scope? Say what you would need to know before you would accept that nothing happened.",
  justify: "Cite what you are relying on — the article, the role, the specific facts. Someone non-technical has to be able to repeat this out loud and have it hold.",
  tom: "Three or four sentences a real person could say on a phone call. Apologise, state facts, say what happens next, give a time. Delete anything that sounds like a press release.",
  followup: "Corrective actions with owners and dates, register entries, and anything leadership should now say differently. Root causes, not the name of whoever clicked.",
  callum: "He has made a specific suggestion. Answer that suggestion, plainly, and then give him a reason he can actually use with the person who is pressuring him."
};

const TASK_RECIPE = {
  risk: ["Read the artefact twice and list only what is <em>already true</em>. That list is your cause and it is free — you do not have to argue for anything true.",
    "Name the one bad thing that could follow. One. If you write \"and also\", you have two risks.",
    "Push the consequence one step past \"a data breach\" — to money, harm, a regulator or a contract.",
    "Assemble: Because … there is a risk that … resulting in …",
    "Score it, then write the sentence that defends each number.",
    "Read the score against the appetite panel; let it pick the treatment.",
    "Pick the owner by asking who can authorise the fix.",
    "Finish with what happens, who does it, and by when."],
  supplier: ["List what data this supplier actually touches, how much, and how sensitive. Tier from that, before you read anything else.",
    "Take each document and test every claim with one word: \"and?\" An expired certificate, a scope that covers something else, an issuer nobody accredited — each is fatal on its own.",
    "Cross-read the answers against each other. Suppliers contradict themselves more often than they lie outright.",
    "Separate what is genuinely wrong from what is merely thin. A four-person company with no certification is not the same finding as a company with a certificate for the wrong service.",
    "Decide: approve, conditions, decline, escalate. Then make every condition a gate with an owner, a date, and something that does not happen until it is met.",
    "Write the note for the person holding the purchase order, not for another security person. Say the decision in the first line."],
  incident: ["Ask what is still getting worse while you read. Stop that first.",
    "Ask what is about to become irreversible — a reimage, a deletion, a log window closing. Protect that second.",
    "Establish the roles: who is the controller, who is the processor. Your duties and your deadlines both come from that.",
    "Separate severity (how hard we react) from notifiability (what the law requires). They are different questions with different answers.",
    "Decide on incomplete facts, in phases, and write down the decision and the reasoning — including a decision not to notify, which is the one you will most need to evidence later."]
};

const TASK_TERMS = {
  risk: ["Cause → event → consequence","Likelihood × Impact","Risk appetite","The four treatments","Risk owner","Risk register","Risk vs issue","Inherent vs residual risk"],
  supplier: ["Tiering","Security questionnaire","Article 28","Sub-processor","UKAS accreditation","Scope","Annex A"],
  incident: ["Personal data breach","Article 33","Awareness","Severity classification","Post-incident review","Root cause"]
};
const SCENARIO_TERMS = {
  "risk-metabase": ["Shared or service account","MFA","Read replica","Least privilege / need-to-know"],
  "risk-backup":   ["RTO / RPO","Control owner","Evidence QC"],
  "risk-intercom": ["Article 28","Sub-processor","DLP"],
  "sup-lumen":     ["IDTA / UK Addendum","Statement of Applicability (SoA)"],
  "sup-cloudspan": ["SOC 2 Type I vs Type II","CUECs","Bridge letter","IDTA / UK Addendum"],
  "sup-snapdesk":  ["Article 28"],
  "inc-export":    ["Article 34","Sub-processor"],
  "inc-laptop":    ["EDR","Root cause","Corrective action","Patch SLA"]
};
function termsForTask(spec){
  const base = TASK_TERMS[spec.type === "incidentBeat" ? "incident" : spec.type] || [];
  return lookupTerms(base.concat(SCENARIO_TERMS[spec.scenarioId] || []));
}
function coached(){ return !S.settings || S.settings.coached !== false; }
