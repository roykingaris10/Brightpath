<script>
"use strict";
/* ============================================================
   GRC GRIND — Phase 1
   Tier 1: Brightpath Learning. World bible, people, registers.
   ============================================================ */

const GAME = { version: "0.1.0", save: 3 };

const SKILLS = {
  iso:        "ISO 27001",
  risk:       "Risk Management",
  tprm:       "Third-Party Risk",
  audit:      "Audit & Evidence",
  iam:        "IAM Governance",
  incident:   "Incident & Breach",
  bcdr:       "BC/DR",
  policy:     "Policy Lifecycle",
  metrics:    "Metrics & Reporting",
  stake:      "Stakeholder Craft",
  aigov:      "AI Governance"
};
const SKILL_ORDER = ["iso","risk","tprm","audit","iam","incident","bcdr","policy","metrics","stake","aigov"];
const DIMS = { technical:"Technical accuracy", judgement:"Judgement", communication:"Communication", craft:"Professional craft" };
const DIM_ORDER = ["technical","judgement","communication","craft"];

function skillLevel(xp){
  if (xp >= 500) return { name:"Interview-ready", idx:3, floor:500, ceil:500 };
  if (xp >= 250) return { name:"Strong",          idx:2, floor:250, ceil:500 };
  if (xp >= 100) return { name:"Competent",       idx:1, floor:100, ceil:250 };
  return                 { name:"Novice",         idx:0, floor:0,   ceil:100 };
}

/* ------------------------------------------------------------------ */
/* TIER 1 — BRIGHTPATH LEARNING                                        */
/* ------------------------------------------------------------------ */

const BRIGHTPATH = {
  id: "brightpath",
  tier: 1,
  name: "Brightpath Learning Ltd",
  short: "Brightpath",
  blurb: "SaaS edtech, ~45 staff, Bevenden Street, Shoreditch. Series A (£8m, Kestrel Ventures).",
  role: "GRC Analyst",
  salary: "£33,500",
  manager: "priya",
  product: "Brightpath Hub — curriculum planning and pupil-progress software used by 210 primary and secondary schools in England and Wales. Brightpath is a data processor; the schools and trusts are the controllers.",
  drama: "Fenwick Academy Trust (34 schools, £1.4m over three years) will not sign without ISO/IEC 27001 certification. Stage 1 is provisionally booked for five months' time. There is no ISMS. There are two policies, one of which is unfinished.",
  frameworks: ["ISO/IEC 27001:2022", "Cyber Essentials / CE Plus", "UK GDPR & DPA 2018 (processor)"],
  riskCriteria: {
    scale: "5 × 5. Likelihood 1 Rare · 2 Unlikely · 3 Possible · 4 Likely · 5 Almost certain (over a 12-month horizon). Impact 1 Insignificant · 2 Minor · 3 Moderate · 4 Major · 5 Severe. Score = L × I.",
    appetite: [
      ["15–25", "Unacceptable. Treatment plan agreed within 10 working days, action inside 30 days. ELT visibility."],
      ["8–12",  "Tolerate only with a documented treatment plan and a named owner."],
      ["1–6",   "May be retained. Risk owner signs off residual risk; review at least annually."]
    ],
    ownerRule: "A risk owner must be a member of the Executive Leadership Team (Tom, Saskia, Nadia, Gemma or Dr Mensah) — the person who can authorise the spend or the change. Not the person who caused the problem, not an engineer, and never the GRC Analyst."
  },
  people: {
    priya:  { name:"Priya Raghavan",  role:"vCISO (2 days/week)", sig:"Priya", style:"Dry, ex-Big-4, unbothered by charm. Asks 'and where is the evidence?' Rewards precision, punishes waffle. Will back you in front of founders if your work holds up." },
    tom:    { name:"Tom Whitlock",    role:"CEO & co-founder",    sig:"Tom",   style:"Ex-primary teacher. Warm, enthusiastic, agrees to everything on calls and panics about Fenwick at 11pm." },
    saskia: { name:"Saskia Lindqvist",role:"CTO & co-founder",    sig:"Saskia",style:"Sharp, guards engineering time, will argue every control — and respects you more when you argue back with a reason." },
    rob:    { name:"Rob Feeney",      role:"Lead Platform Engineer (de facto IT admin)", sig:"Rob", style:"Holds every admin credential in the company. Helpful, overloaded, 'I'll do it after the sprint'." },
    nadia:  { name:"Nadia Haq",       role:"People & Operations Manager", sig:"Nadia", style:"Runs HR, the office and procurement. Organised, responds same day, your most reliable ally." },
    gemma:  { name:"Gemma Osei-Bonsu",role:"Head of Customer Success", sig:"Gemma", style:"Owns Intercom and the school relationships. Loves the customers, loathes process, moves fast." },
    callum: { name:"Callum Wright",   role:"Sales Lead",          sig:"Callum",style:"Chasing Fenwick. Will promise anything on a call and ask you to make it true afterwards." },
    ellie:  { name:"Dr Ellie Mensah", role:"Head of Product",     sig:"Ellie", style:"Former designated safeguarding lead at a multi-academy trust. Cares more about pupil data than anyone else here." },
    bex:    { name:"Bex Turner",      role:"Support Analyst",     sig:"Bex",   style:"Eight months in, keen, notices things nobody asked her to notice. Escalates early." }
  },
  systems: [
    ["AWS (eu-west-2)", "Single production account. Rob holds root. Pupil data at rest in RDS."],
    ["Google Workspace", "Mail, Drive, shared drives. No DLP. Link sharing unrestricted."],
    ["Intercom", "Support inbox for school staff. School users routinely paste pupil detail into tickets."],
    ["HiBob", "HR system of record. Nadia owns starters and leavers."],
    ["Atlassian Cloud", "Jira and Confluence. Confluence is the closest thing to a document store."],
    ["GitHub", "Source control. Personal accounts, no SSO enforcement."],
    ["HubSpot", "CRM. Sales and marketing."],
    ["Metabase", "Analytics over a read replica of the production database."],
    ["1Password", "Bought eighteen months ago. Roughly half the company uses it."],
    ["Datadog", "Infrastructure monitoring. No SIEM, no formal alert triage."]
  ],
  seedRegister: [
    { id:"R-001", title:"Cyber attack", statement:"Cyber attack", l:4, i:5, owner:"Rob Feeney", treatment:"Modify", opened:"2024-11-02", note:"Inherited. One line, no cause, no owner in ELT." },
    { id:"R-002", title:"GDPR", statement:"GDPR", l:3, i:4, owner:"Tom Whitlock", treatment:"—", opened:"2024-11-02", note:"Inherited. A regulation is not a risk." },
    { id:"R-003", title:"Key person dependency", statement:"If Rob leaves we are in trouble", l:3, i:4, owner:"—", treatment:"Retain", opened:"2025-02-14", note:"Inherited. No owner, no treatment plan, never reviewed." },
    { id:"R-004", title:"Office break-in", statement:"Someone could steal laptops from the office", l:2, i:2, owner:"Nadia Haq", treatment:"Modify", opened:"2025-02-14", note:"Inherited. The only one written by someone who had read the standard." }
  ],
  policyRegister: [
    ["IT Acceptable Use Policy v1.0", "Written by Rob in 2021. Never approved. No review date.", "bad"],
    ["Data Protection Policy v0.4", "Draft. Stops mid-sentence in section 6.", "bad"],
    ["Information Security Policy", "Does not exist.", "bad"],
    ["Supplier Security Standard", "Does not exist.", "bad"],
    ["Employee handbook (security section)", "Two paragraphs about not sharing passwords.", "warn"]
  ],
  suppliers: [
    ["Amazon Web Services", "Hosting (production)", "Critical"],
    ["Intercom", "Customer support platform", "High"],
    ["Lumen Learning Analytics Ltd", "Attainment modelling (sub-processor)", "Untiered"],
    ["Cloudspan Hosting Ltd", "Document rendering service", "Untiered"],
    ["HiBob", "HR system", "Medium"],
    ["Atlassian", "Jira / Confluence", "Medium"],
    ["Snapdesk Ltd", "Meeting room booking", "Untiered"],
    ["Orbit Payroll", "Payroll bureau", "Medium"]
  ],
  objectives: [
    "Get a defensible ISMS scope and a risk register the auditor will accept.",
    "Tier the supplier estate and clear the sub-processor backlog before Fenwick's due diligence.",
    "Make evidence a habit, not a scramble."
  ]
};

const COMPANIES = { brightpath: BRIGHTPATH };

/* in-game calendar: Tier 1 quarter 1 starts Monday 12 January 2026 */
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function gameDate(tier, quarter, day){
  const base = new Date(Date.UTC(2026,0,12));
  const offset = ((tier-1)*4 + (quarter-1)) * 91 + (day-1) * 1;
  const d = new Date(base.getTime() + offset*86400000);
  while (d.getUTCDay()===0 || d.getUTCDay()===6) d.setUTCDate(d.getUTCDate()+1);
  return d;
}
function fmtDate(d){ return WEEKDAYS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
