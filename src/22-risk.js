/* ============================================================
   Task type: RISK WRITE-UP
   ============================================================ */

const ELT_OWNERS = [
  "Tom Whitlock — CEO",
  "Saskia Lindqvist — CTO",
  "Nadia Haq — People & Ops Manager",
  "Gemma Osei-Bonsu — Head of Customer Success",
  "Dr Ellie Mensah — Head of Product"
];
const ALL_OWNERS = ["— choose an owner —"].concat(ELT_OWNERS, [
  "Rob Feeney — Lead Platform Engineer",
  "Priya Raghavan — vCISO",
  "Bex Turner — Support Analyst",
  "Callum Wright — Sales Lead",
  "Me (GRC Analyst)"
]);

function riskFields(){
  return [
    { id:"statement", kind:"textarea", rows:5, label:"Risk statement",
      hint:"Cause → event → consequence. One risk, not three.",
      placeholder:"Because … there is a risk that … resulting in …" },
    { id:"likelihood", kind:"select", label:"Likelihood (1–5)", options:["—","1 Rare","2 Unlikely","3 Possible","4 Likely","5 Almost certain"] },
    { id:"impact", kind:"select", label:"Impact (1–5)", options:["—","1 Insignificant","2 Minor","3 Moderate","4 Major","5 Severe"] },
    { id:"treatment", kind:"select", label:"Treatment", options:["—","Modify","Retain","Avoid","Share"] },
    { id:"owner", kind:"select", label:"Risk owner", options:ALL_OWNERS },
    { id:"rationale", kind:"textarea", rows:6, label:"Rationale",
      hint:"Justify the score against Brightpath's criteria, the treatment, and why that owner. Three or four sentences.",
      placeholder:"" }
  ];
}

const RISK_SCENARIOS = [
{
  id:"risk-metabase", type:"risk", skill:"risk", secondary:"iam",
  title:"Analytics access for the Fenwick pitch",
  from:"priya",
  brief:"Priya has forwarded you a thread and wants a register entry by end of day. Write the risk properly — the one you inherit as R-005 is the one an auditor will read.",
  render(){ return thread({
    subject:"Re: quick chart for the Fenwick deck",
    people:"Gemma Osei-Bonsu, Rob Feeney, Saskia Lindqvist, Callum Wright",
    messages:[
      { who:"Gemma Osei-Bonsu → Rob Feeney", when:"Yesterday 16:12",
        text:"Rob — can I get into Metabase? Callum needs a chart of pupil engagement by key stage for the Fenwick deck and the dashboard I had access to got archived in the December tidy-up. Needed for Thursday. Also the coffee machine is making the noise again, is that you or Nadia?" },
      { who:"Rob Feeney → Gemma Osei-Bonsu", when:"Yesterday 16:31",
        text:"Done — I've given you the analytics@brightpath.io login, it's in the shared vault note in Notion. Use that for now, I'll sort proper accounts when the sprint's done. It's read-only so you can't break anything.\n\n(Coffee machine is Nadia's problem, I have declared it out of scope.)" },
      { who:"Saskia Lindqvist → Rob Feeney", when:"Yesterday 17:02",
        text:"Rob, Metabase reads the prod replica. That's the whole pupil table — names, DOB, SEN flags, and the pastoral_notes free-text column that Ellie's team added in November. It is not \"read-only so it's fine\". Who else has that login?" },
      { who:"Rob Feeney → Saskia Lindqvist", when:"Yesterday 17:20",
        text:"It's been the analytics login since we set Metabase up, so… me, Priya from onboarding, two of the data contractors we used in the spring, the Notion note, and now Gemma. I'd have to check. There's no MFA on it because it's a service account." },
      { who:"Callum Wright → all", when:"Today 08:04",
        text:"Can I get it too? Fenwick want a live demo of the reporting and I'd rather pull real numbers than mock ones. Their head of IT is ex-NCSC apparently so let's look sharp. 🙌" }
    ]
  }); },
  fields: riskFields(),
  checks:[
    { id:"shared", dim:"technical", w:2, label:"Named the shared, non-attributable service credential as the cause — not just 'Gemma has access'",
      any:[/shared (account|credential|login|log-?in)|generic (account|login)|analytics@|service account|non-?attributab|no individual account|not tied to an individual/i] },
    { id:"sens", dim:"technical", w:2, label:"Identified what is actually exposed: pupil records including SEN flags and free-text pastoral notes",
      any:[/pastoral|safeguard|\bsen\b|special category|special-category|article 9|sensitive personal|children'?s data|pupil (data|record)/i] },
    { id:"lp", dim:"technical", w:1, label:"Framed it as an access-control / least-privilege failure over a production replica",
      any:[/least privilege|need[- ]to[- ]know|role[- ]based|\brbac\b|access (control|restriction|right)|privileged|unrestricted access|excessive access|8\.3|5\.15|5\.18/i] },
    { id:"revoke", dim:"technical", w:1, label:"Noted that nobody can say who holds the credential (no revocation, no audit trail)",
      any:[/who (else )?has|cannot (tell|say|prove|determine)|no (audit )?(trail|log)|unknown|revoke|contractor|leaver|no record of/i] },
    { id:"conseq", dim:"technical", w:2, label:"Consequence reaches a real-world outcome (regulatory, contractual or harm), not just 'a data breach'",
      any:[/\bico\b|uk gdpr|dpa 2018|enforcement|controller|fenwick|contract|certification|reputation|harm to (a )?(child|pupil)|safeguarding harm|notifi/i] },
    { id:"form", dim:"communication", w:2, label:"Written as cause → event → consequence rather than a two-word label",
      any:[/because|due to|as a result|resulting in|leading to|arising from|there is a risk that|→|->/i] },
    { id:"criteria", dim:"judgement", w:2, label:"Score argued against Brightpath's stated criteria rather than asserted",
      any:[/likelihood|likely|almost certain|possible|impact|severe|major|appetite|unacceptable|criteria|5 ?[x×] ?5|score of|because the (score|likelihood|impact)/i] },
    { id:"ownerwhy", dim:"craft", w:1, label:"Explained why that owner — authority to fix, not proximity to the problem",
      any:[/owner|accountab|authoris|authoriz|can (approve|fund|decide|direct)|budget|elt|leadership/i] },
    { id:"plan", dim:"craft", w:1, label:"Gave the treatment a shape: what happens, by when",
      any:[/within \d+|by (the )?\d{1,2}(st|nd|rd|th)?|\d+ (working )?days|next week|this week|interim|immediate|short[- ]term|first step|30 days|10 working/i] }
  ],
  scoring:{ bandMin:12, bandMax:25, goodOwners:["Saskia Lindqvist — CTO","Dr Ellie Mensah — Head of Product"], okOwners:["Tom Whitlock — CEO"],
    badOwners:["Rob Feeney — Lead Platform Engineer","Priya Raghavan — vCISO","Me (GRC Analyst)","Bex Turner — Support Analyst","Callum Wright — Sales Lead","Gemma Osei-Bonsu — Head of Customer Success"],
    goodTreatment:["Modify"], badTreatment:["Retain","Share"],
    ownerNote:"Saskia owns the data platform and can direct the engineering change; Ellie is defensible if you argue the pupil-data angle. Rob is the cause and is not on the ELT. Priya is a two-day-a-week contractor. You are the analyst — you never own the risk you write." },
  model:`Something close to: "Because Metabase access to the production read replica is granted through a single shared credential (analytics@brightpath.io) with no MFA, no role-based restriction and no record of who holds it, there is a risk that staff and former contractors with no legitimate need can read the full pupil table — including SEN flags and free-text pastoral notes — resulting in unlawful processing of children's personal data, a notifiable breach for the schools as controllers, and the loss of the Fenwick contract that this ISMS exists to win."

Likelihood 4 (the credential is already circulating and a fifth person asked for it this morning). Impact 4–5 (special-category-adjacent data about children; contractual and regulatory consequence). Score 16–20 — above appetite, so Modify, not Retain.

Owner: Saskia. She owns the data platform and can direct the engineering work. Treatment worth naming: kill the shared credential, named SSO accounts in Metabase, restrict the replica so pastoral_notes and SEN are not in the analytics view at all, and give Callum a demo dataset rather than live pupil records.

Relevant controls: A.5.15 access control, A.5.18 access rights, A.8.3 information access restriction, A.8.11 data masking.`,
  aiBrief:`The planted problems: (1) a shared, non-attributable service credential with no MFA; (2) nobody knows who holds it — including two former contractors; (3) the Metabase replica exposes SEN flags and free-text pastoral notes, i.e. safeguarding-adjacent data about children; (4) sales wants live pupil data for a demo; (5) "read-only so you can't break anything" confuses integrity with confidentiality. Correct score band 12–25 (typically 16–20). Correct treatment Modify. Correct owner Saskia Lindqvist (CTO) or arguably Dr Ellie Mensah; Rob Feeney is the cause and not on the ELT, Priya is a part-time contractor, and naming themselves is always wrong at this company. Relevant ISO 27001:2022 controls: A.5.15, A.5.18, A.8.3, A.8.11.`
},

{
  id:"risk-backup", type:"risk", skill:"risk", secondary:"bcdr",
  title:"\"Backups are on\"",
  from:"priya",
  brief:"Priya wants this in the register before the scope workshop. She has already told you that \"backups are configured\" is not the same sentence as \"we can recover\".",
  render(){ return thread({
    subject:"Re: Fenwick security schedule — question 14 (backup and recovery)",
    people:"Callum Wright, Rob Feeney, Tom Whitlock, Saskia Lindqvist",
    messages:[
      { who:"Callum Wright", when:"Tuesday 11:48",
        text:"Fenwick's schedule asks: \"Describe your backup regime, recovery time objective and recovery point objective, and provide evidence of the most recent successful restoration test.\" Rob, can you give me two lines so I can close this out today?" },
      { who:"Rob Feeney", when:"Tuesday 12:06",
        text:"Backups are on. RDS automated snapshots, daily, 7 day retention, encrypted. Also point-in-time recovery within that window. Tell them it's all automated, it's AWS, it's fine." },
      { who:"Tom Whitlock", when:"Tuesday 12:09",
        text:"Amazing. So if we got ransomware'd we'd be back up same day? Just want to be able to say that with a straight face 😅" },
      { who:"Saskia Lindqvist", when:"Tuesday 14:31",
        text:"Careful. Two things. The snapshots are in the same AWS account as production — same account, same root credential, and Rob holds it. And the generated report PDFs in the S3 bucket aren't covered by the RDS snapshot at all; that's ~90k documents the schools expect to be able to re-download.\n\nAlso, genuine question, has anyone ever actually restored one of these?" },
      { who:"Rob Feeney", when:"Tuesday 14:52",
        text:"Not end to end, no. I restored a snapshot to a scratch instance about a year ago to debug something, that worked fine. We've never had to do it for real which I'd say is a good sign.\n\nCallum just put \"daily encrypted backups with point-in-time recovery\" and move on, we're overthinking a two-line answer." },
      { who:"Callum Wright", when:"Tuesday 15:02",
        text:"Sending that. Alex — anything I should be worried about? Fenwick want the answers by Friday and I don't want to open a can of worms on question 14 of 61." }
    ]
  }); },
  fields: riskFields(),
  checks:[
    { id:"restore", dim:"technical", w:2, label:"The core failure: backups have never been restore-tested end to end, so recoverability is unproven",
      any:[/restore test|restoration test|never (been )?(restored|tested)|not tested|untested|test(ed|ing)? (the )?restor|recoverab|prove (we can )?recover|verif/i] },
    { id:"blast", dim:"technical", w:2, label:"Backups sit in the same AWS account under the same root credential — no separation from the thing they protect",
      any:[/same (aws )?account|same root|separat|isolat|immutab|air ?gap|object lock|blast radius|cross[- ]account|second account|ransomware would|encrypt the backups too|delete the (backups|snapshots)/i] },
    { id:"gap", dim:"technical", w:1, label:"Spotted the scope gap — the S3 report documents are not in the RDS snapshot",
      any:[/s3|report(s| pdf| document)|90 ?k|not covered|out of scope|excluded|only the database|rds only/i] },
    { id:"rto", dim:"technical", w:1, label:"Named RTO/RPO (or retention) as undefined rather than accepting '7 days, daily'",
      any:[/\brto\b|\brpo\b|recovery (time|point) objective|retention|7 ?days? (is|may|might|only)|no (defined|agreed) (objective|target)|how long|tolerance/i] },
    { id:"conseq", dim:"technical", w:2, label:"Consequence reaches prolonged loss of service to schools / contractual and certification exposure, not just 'data loss'",
      any:[/school|pupil|term time|prolonged|extended outage|unable to (recover|restore|operate)|contract|fenwick|certification|stage 1|clause|sla|penalt/i] },
    { id:"answer", dim:"judgement", w:2, label:"Addressed Callum's actual question — the two-line answer as drafted overstates the position",
      any:[/callum|overstat|misrepresent|not accurate|cannot (say|claim|assert)|only answer what|truthful|honest|evidence of (a )?restor|they asked for evidence|question 14/i] },
    { id:"form", dim:"communication", w:2, label:"Written as cause → event → consequence",
      any:[/because|due to|as a result|resulting in|leading to|arising from|there is a risk that|→|->/i] },
    { id:"criteria", dim:"judgement", w:1, label:"Score argued against the criteria",
      any:[/likelihood|likely|possible|impact|severe|major|appetite|criteria|score of|because the/i] },
    { id:"plan", dim:"craft", w:1, label:"Treatment has a shape and a date — a scheduled, evidenced restore test, not 'improve backups'",
      any:[/within \d+|by (the )?\d{1,2}|\d+ (working )?days|quarterly|annual|scheduled|documented test|evidence|test plan|next month|before stage 1/i] }
  ],
  scoring:{ bandMin:9, bandMax:25, goodOwners:["Saskia Lindqvist — CTO"], okOwners:["Tom Whitlock — CEO"],
    badOwners:["Rob Feeney — Lead Platform Engineer","Priya Raghavan — vCISO","Me (GRC Analyst)","Bex Turner — Support Analyst","Callum Wright — Sales Lead","Gemma Osei-Bonsu — Head of Customer Success","Nadia Haq — People & Ops Manager"],
    goodTreatment:["Modify"], badTreatment:["Retain","Share","Avoid"],
    ownerNote:"Saskia. She owns the platform and can put a restore test on the engineering plan. Rob is the person you need to chase, not the person who carries the risk." },
  model:`"Because Brightpath's backups have never been restored end to end, are held in the same AWS account and under the same root credential as production, and exclude the ~90,000 generated report documents in S3, there is a risk that following a ransomware event or a destructive error the platform cannot be recovered within any timescale the schools would accept — resulting in prolonged loss of service during term time, breach of the availability commitments Brightpath is about to sign with Fenwick, and a certification finding against A.8.13."

Likelihood 3 (possible — nothing has happened yet, but nothing is stopping it either). Impact 5 (severe: no proven route back). Score 15 — above appetite, treat within 30 days.

Treatment: Modify. A documented restore test to a clean environment with a named RTO and RPO agreed with Saskia and Tom, snapshots replicated to a separate account with object lock, and the S3 report bucket brought into scope. Evidence of the test is the artefact — that is what Fenwick asked for and what the auditor will sample.

And Callum's answer needs changing. "Daily encrypted backups with point-in-time recovery" is true; the question also asked for evidence of the most recent successful restoration test, and the truthful answer to that part is that one is scheduled, not that one happened.

Relevant controls: A.8.13 information backup, A.5.29 information security during disruption, A.5.30 ICT readiness for business continuity.`,
  aiBrief:`Planted problems: (1) backups have never been restore-tested end to end — "I restored a snapshot to a scratch instance a year ago to debug something" is not a test and produced no evidence; (2) snapshots live in the same AWS account under the same root credential Rob holds, so one compromise takes both; (3) the S3 bucket of ~90k generated report PDFs is outside the RDS snapshot entirely; (4) no RTO or RPO has ever been defined, so "7 day retention" is unanchored; (5) Rob's proposed answer to Fenwick omits the part of question 14 that asked for evidence of a restoration test — answering it as drafted would overstate the position to a prospect. A strong answer also tells Callum his draft answer is not safe to send. Correct treatment Modify; correct owner Saskia Lindqvist (CTO). Controls: A.8.13, A.5.29, A.5.30.`
},

{
  id:"risk-intercom", type:"risk", skill:"risk", secondary:"tprm",
  title:"What the schools put in support tickets",
  from:"ellie",
  brief:"Dr Ellie Mensah has raised something the support team has lived with for two years. She wants it in the register; Gemma wants it to go away.",
  render(){ return chat({
    channel:"#security-questions",
    messages:[
      { who:"Dr Ellie Mensah", when:"09:12",
        text:"Alex — I sat with Bex yesterday to watch how schools actually raise tickets and I need someone to write this down properly.\n\nSchool staff paste pupil information straight into Intercom. Not \"pupil ID 4471\" — full names, dates of birth, and this week alone: \"can you check J— B— (Yr 8, EHCP, on report for the incident last Friday) — his pastoral entry hasn't saved\". That is a safeguarding record sitting in a support ticket." },
      { who:"Bex Turner", when:"09:20",
        text:"It's every day tbh. Sometimes they attach screenshots of the whole class list. We just answer them, nobody ever told us not to. There's a saved reply for \"can you send me the spreadsheet\" which… I've just realised is us asking for it." },
      { who:"Dr Ellie Mensah", when:"09:24",
        text:"Two more things. Every one of the eleven people in Customer Success can search the whole Intercom history — Bex can pull up any ticket from any school since 2023. And I checked with Rob: Intercom retention is set to \"never delete\"." },
      { who:"Gemma Osei-Bonsu", when:"09:41",
        text:"Right, but before this becomes A Thing — we cannot make it harder for a head of year to ask us a question at 4pm on a Friday. Our NPS is the only reason Fenwick are talking to us. If the answer is \"tell schools off for using the support channel\" then the answer is no.\n\nAlso is Intercom even our problem? They're the ones storing it." },
      { who:"Dr Ellie Mensah", when:"09:44",
        text:"Gemma, I ran safeguarding at a trust for six years. If one of those tickets walks out of the door it is a child's EHCP status in the wild and it is the school's name in the ICO's letter, and they will point at their contract with us. It's our problem." },
      { who:"Priya Raghavan", when:"10:02",
        text:"Alex — register entry please, today. Gemma's constraint is real and I don't want a treatment that pretends it isn't. Take Ellie's facts, not her adrenaline." }
    ]
  }); },
  fields: riskFields(),
  checks:[
    { id:"cause", dim:"technical", w:2, label:"Cause is the uncontrolled channel — no guidance, no filtering, and a saved reply that actively invites bulk data",
      any:[/no (guidance|control|instruction|training|dlp|filter)|uncontrolled|unstructured|free[- ]text|saved reply|invit|encourag|paste|no way to stop/i] },
    { id:"agg", dim:"technical", w:2, label:"Aggregation and retention: indefinite retention plus whole-history search by eleven people",
      any:[/retention|never delete|indefinit|accumulat|aggregat|entire history|all (eleven|11)|whole (history|estate)|every ticket|since 2023|minimis/i] },
    { id:"role", dim:"technical", w:2, label:"Named the processor position — this is the schools' data and Brightpath holds it under Article 28",
      any:[/processor|controller|article 28|art\.? ?28|\bdpa\b|data processing agreement|sub-?processor|on behalf of|schools are the/i] },
    { id:"sens", dim:"technical", w:1, label:"Recognised what the data actually is — EHCP/SEN and pastoral content, i.e. special category and safeguarding",
      any:[/ehcp|\bsen\b|special category|special-category|article 9|safeguard|health|pastoral|child protection/i] },
    { id:"conseq", dim:"technical", w:1, label:"Consequence reaches harm to a child and a controller-side notification, not just 'a fine'",
      any:[/harm|child|pupil|notif|controller|\bico\b|contract|trust|reputation|withdraw/i] },
    { id:"prop", dim:"judgement", w:2, label:"Treatment respects Gemma's constraint — reduces exposure without breaking the support channel",
      any:[/without (blocking|breaking|stopping)|still able|keep the channel|proportionat|redact|retention (policy|schedule|limit)|restrict (search|access)|role[- ]based|auto[- ]?delete|structured (field|form)|in-?product|deep link|train the schools|guidance to schools|change the saved reply/i] },
    { id:"form", dim:"communication", w:2, label:"Written as cause → event → consequence",
      any:[/because|due to|as a result|resulting in|leading to|arising from|there is a risk that|→|->/i] },
    { id:"criteria", dim:"judgement", w:1, label:"Score argued against the criteria",
      any:[/likelihood|almost certain|likely|possible|impact|severe|major|appetite|criteria|score of|already happening|daily/i] },
    { id:"plan", dim:"craft", w:1, label:"Treatment has a first step and a date, not a programme",
      any:[/within \d+|by (the )?\d{1,2}|\d+ (working )?days|first step|start with|this (week|month)|quick win|interim|phase/i] }
  ],
  scoring:{ bandMin:12, bandMax:25, goodOwners:["Gemma Osei-Bonsu — Head of Customer Success","Dr Ellie Mensah — Head of Product"], okOwners:["Tom Whitlock — CEO","Saskia Lindqvist — CTO"],
    badOwners:["Rob Feeney — Lead Platform Engineer","Priya Raghavan — vCISO","Me (GRC Analyst)","Bex Turner — Support Analyst","Callum Wright — Sales Lead"],
    goodTreatment:["Modify"], badTreatment:["Retain","Share","Avoid"],
    ownerNote:"Gemma. She owns the channel, the team and the saved replies — and giving the risk to the person who objected to it is how you get a treatment that survives contact with reality. Ellie is defensible. Passing it to Rob because Intercom is 'technical' is the classic mistake." },
  model:`"Because school staff routinely enter identifiable pupil detail — including EHCP status and pastoral content — into Intercom tickets, where Brightpath applies no retention limit and all eleven Customer Success staff can search the entire history, there is a risk that safeguarding-relevant personal data about children is held unlawfully and disclosed beyond those with a legitimate need, resulting in harm to a pupil, a notifiable personal data breach for the schools as controllers, and loss of trust that Brightpath cannot recover commercially."

Likelihood 4–5 (it is happening every day; the only question is exposure, not occurrence). Impact 4. Score 16–20.

Treatment: Modify — and the treatment has to be designed around Gemma's constraint, not against it. Sensible first moves: rewrite the saved reply that asks schools for spreadsheets; set an Intercom retention period and apply it; restrict full-history search to a named few rather than all eleven; add an in-product "report a problem with this pupil record" route that carries the pupil ID instead of the pupil's name; brief school admins through the existing termly comms. None of those make it harder for a head of year to ask a question at 4pm on a Friday.

Gemma's "is Intercom even our problem" deserves a plain answer: Brightpath is the processor, the schools are the controllers, Intercom is a sub-processor, and under Article 28 the obligation runs to Brightpath.

Relevant controls: A.5.34 privacy and PII protection, A.8.10 information deletion, A.5.15 access control, A.5.12 classification of information.`,
  aiBrief:`Planted problems: (1) school staff paste identifiable pupil data including EHCP status and pastoral content into support tickets; (2) Brightpath's own saved reply actively asks for class spreadsheets — Brightpath is causing part of the inflow; (3) Intercom retention is set to never delete; (4) all eleven Customer Success staff can search the whole history back to 2023; (5) Gemma's operational constraint (do not damage the support experience) is legitimate and a treatment that ignores it will not be implemented. The learner must also get the processor/controller position right: the schools are controllers, Brightpath is the processor under Article 28, Intercom is a sub-processor — Gemma's "is Intercom even our problem" is wrong. Correct treatment Modify; owner Gemma Osei-Bonsu (or Dr Ellie Mensah). Controls: A.5.34, A.8.10, A.5.15, A.5.12. Penalise a treatment that amounts to "tell the schools to stop" with no mechanism, and penalise assigning this to Rob Feeney because it involves a tool.`
}
];
