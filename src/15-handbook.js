/* ============================================================
   The Handbook — what the job is, and the words it uses.
   ============================================================ */

const JOB_MODEL = [
  ["A control", "something an organisation does, on purpose and repeatedly, to reduce a risk.",
   "\"We review who has access to the pupil database every quarter.\" That is a control. Not a tool, not a setting — a thing people do."],
  ["Evidence", "proof the control actually happened.",
   "The completed access review, with a date, the name of the person who did it, what they found and what they changed. A screenshot with no date is not evidence. A policy nobody approved is not evidence."],
  ["A risk", "what happens if the control isn't there, or fails.",
   "No access review → leavers keep their logins → someone reads records they have no business reading → the school has a notifiable breach. That chain is the risk."],
  ["An audit", "someone checking whether your evidence matches your claims.",
   "You said you review access quarterly. Show me the last four. This is the entire emotional logic of the job: everything you write, you will one day have to prove."]
];

const JOB_TRUTHS = [
  ["You do not fix anything technical.",
   "You do not patch servers, configure firewalls or write code. When a pen test finds something, you do not fix it — you make sure it is owned, scheduled, tracked and escalated when it slips. Engineers sometimes resent this. Learning to be useful to them anyway is most of the job."],
  ["Your output is documents and decisions.",
   "A risk register entry. A supplier recommendation. A corrective action. A paragraph in a board pack. An email that gets a director to do something they were avoiding. That is the product."],
  ["Most of the work is chasing people.",
   "Roughly: 50% getting evidence out of busy people who did not ask for your project, 30% writing, 20% judgement calls that actually matter. The 20% is why the job is interesting. The 50% is why it pays."],
  ["Proportionality is the skill nobody tells you about.",
   "Anyone can demand ISO 27001 from every supplier. The analyst who gets promoted is the one who knows which suppliers need a full assessment and which need ten minutes, because the business keeps coming back to them instead of routing around them."],
  ["You are the person who says the unwelcome thing, calmly.",
   "\"That answer to the customer isn't accurate.\" \"That's not ours to decide.\" \"No, we're not deleting that.\" Said once, evenly, in writing, with a reason. Not as a crusade."]
];

const IG_BRIDGE = [
  ["Statutory clocks", "SAR one month, FOI 20 working days",
   "UK GDPR Article 33's 72 hours is the same muscle: a clock that starts on awareness, not on certainty. You already know the panic of a deadline that began before you were told.", "have"],
  ["Controller and processor", "who decides the purpose, who acts on instruction",
   "This is the crux of half of cyber GRC in a supplier-heavy world — and it was the answer to the incident task in the sim. You know this better than most security people do.", "have"],
  ["Special category data and safeguarding sensitivity", "Article 9, children's records, EHCPs",
   "You instinctively know the difference between 'personal data' and 'data that could get a child hurt'. Security teams routinely miss this. It is your edge, not your baggage.", "have"],
  ["Defensible decision-making", "recording why you redacted, why you withheld, why you disclosed",
   "This is the whole of professional craft: the decision plus the reason plus the date plus your name. GRC calls it an audit trail. You call it Tuesday.", "have"],
  ["Extracting things from unwilling colleagues", "chasing a service for the records they promised",
   "Evidence chasing is SAR collation with a different noun.", "have"],
  ["Framework literacy", "the shape of ISO 27001, NCSC CAF, Cyber Essentials",
   "Not memorising 93 controls — knowing the structure, so when someone says 'that's a clause 9 problem, not an Annex A one' you know what they mean.", "need"],
  ["Risk register mechanics", "cause→event→consequence, likelihood × impact, the four treatments, risk owner",
   "A specific and quite small craft. Two weeks of deliberate practice and you are competent. This is what the first task was testing.", "need"],
  ["Evidence and audit mechanics", "major / minor / OFI, corrective action, root cause",
   "You know how to keep a record. What is new is the certification machinery around it and the language findings are written in.", "need"],
  ["Supplier assurance", "tiering, reading certificates and SOC 2 reports, contract clauses",
   "The most immediately hireable skill on this list, and the one where your Article 28 knowledge gives you a head start over most junior security hires.", "need"],
  ["Security vocabulary", "least privilege, MFA, patch SLA, pen test, CVSS, EDR",
   "You need to understand these well enough to have a conversation and challenge a claim. You never need to configure any of them.", "need"]
];

const GLOSSARY = [
  ["Risk", [
    ["Risk register", "The list of things that could go wrong, each with a score, an owner and a plan. The central artefact of the job.",
     "If it is not in the register, the organisation has not decided anything about it."],
    ["Cause → event → consequence", "The three-part shape of a properly written risk. The cause is the weakness that already exists. The event is the bad thing that could happen. The consequence is what it costs in the real world.",
     "\"Because [cause], there is a risk that [event], resulting in [consequence].\" Write it in that order and a scorer, an owner and a treatment all fall out of it. Write \"data breach\" instead and nobody can do anything with it."],
    ["Likelihood × Impact", "The two numbers you score a risk on, usually 1–5 each, multiplied to give a score out of 25. Likelihood is how probable over a stated period (often 12 months). Impact is how bad if it happens.",
     "The numbers are not science. They exist so that fifty risks can be put in an order. What matters is that you can say why you chose 4 and not 2."],
    ["Risk appetite", "The organisation's stated line for what it will tolerate. Usually a score threshold: above this we must act, below this we can live with it.",
     "It is what stops risk scoring being an opinion. If the appetite says 15+ must be treated in 30 days, a 16 is not a debate."],
    ["The four treatments", "Modify (reduce it), Retain (accept it knowingly), Avoid (stop doing the thing), Share (insure it or contract it out).",
     "Retain is a real, legitimate answer — but only with a named owner signing it off in writing. \"We'll just accept it\" said in a meeting is not Retain, it is drift. And Share does not move a legal obligation you hold."],
    ["Risk owner", "The person accountable for the risk — who can authorise the money, the time or the change that treats it.",
     "Not the person who caused it. Not the engineer who will do the work. Not you. Getting this wrong is the most common junior mistake and the easiest to fix."],
    ["Inherent vs residual risk", "Inherent is the score before your controls. Residual is the score after them.",
     "Sign-off is always on the residual. \"We've reduced this from 20 to 8, and the owner accepts the 8\" is a finished piece of work."],
    ["Risk vs issue", "A risk might happen. An issue is already happening.",
     "Half the entries in a bad register are issues wearing a risk costume. If it is already true, it does not need a likelihood — it needs an action."]
  ]],
  ["ISO/IEC 27001:2022", [
    ["ISMS", "Information Security Management System. The whole machine: the scope, the policies, the risk process, the controls, the evidence, the reviews.",
     "The certificate is awarded to the ISMS, not to the company's security. That distinction is the reason this job exists."],
    ["Clauses 4–10", "The management-system requirements — the mandatory part. Context and scope (4), leadership (5), planning and risk (6), support and competence (7), operation (8), performance evaluation including internal audit and management review (9), improvement and corrective action (10).",
     "This is where certificates are actually lost. Companies obsess over controls and fail on clause 9 because nobody ran an internal audit or a management review."],
    ["Annex A", "The control catalogue: 93 controls in 4 themes — Organisational (5.x), People (6.x), Physical (7.x), Technological (8.x). This is the 2022 edition. The old 2013 edition had 114 controls in 14 domains and is withdrawn.",
     "Cited as A.5.15, A.8.13 and so on. You do not memorise them. You learn to look them up and cite the right one, which is a skill worth about ten thousand pounds a year."],
    ["Statement of Applicability (SoA)", "The document listing all 93 controls and saying, for each one, whether it applies, why, and whether it is implemented.",
     "Excluding a control is allowed. Excluding it without a written justification is a finding. The SoA is the first thing an auditor reads."],
    ["Scope", "The written boundary of the ISMS: which parts of the organisation, which services, which locations, which systems.",
     "Scope is a commercial decision disguised as a technical one. Draw it too wide and certification becomes unaffordable; too narrow and the customer's certificate does not cover what they are buying — which is exactly the trap in the Lumen task."],
    ["Stage 1 / Stage 2 / surveillance", "Stage 1 checks whether your ISMS exists and is ready. Stage 2 tests whether it actually operates. Surveillance audits happen annually after that, with full recertification every three years.",
     "Stage 1 is a documentation review. Stage 2 is where they talk to your control owners, and where your evidence habits show."],
    ["UKAS accreditation", "UKAS is the UK's national accreditation body. It accredits the certification bodies that issue certificates.",
     "An unaccredited certificate is a purchased PDF. When you check a certificate you check: is it the 2022 standard, is it in date, does the scope cover the service, and is the issuing body accredited. All four."]
  ]],
  ["Audit and evidence", [
    ["Control owner", "The person who runs a control day to day and who an auditor will interview about it.",
     "Your job is to make sure they know they own it. Surprisingly often, they don't."],
    ["Evidence QC", "Checking that what someone gave you actually evidences the control they claim it evidences.",
     "A screenshot with no date. A policy with no approval. A backup job with no restore test. All three are the most common thing you will reject, politely, several times a week."],
    ["Major / Minor / OFI", "Audit finding severities. A major is a systemic failure or total absence of a required control — it blocks certification until fixed. A minor is a single lapse in something that otherwise works. An OFI (opportunity for improvement) is advice with no obligation.",
     "Classifying a finding is a judgement you will be asked to make and defend. \"One person missed one review\" is a minor. \"Nobody has ever done these reviews\" is a major."],
    ["Corrective action", "The fix for a finding — which must address the cause, not the symptom.",
     "\"We have now completed the missing access review\" is a symptom fix and will be rejected. \"The review had no owner and no calendar trigger; we have assigned both\" is a corrective action."],
    ["Root cause", "Why the control failed, as opposed to what failed.",
     "Keep asking why until the answer is about a process, an incentive or a design — never a person. \"Dmitri installed something silly\" is not a root cause. \"Developer machines have local admin and no application control\" is."],
    ["Nonconformity", "The formal word for \"you are not doing what the standard, or your own documentation, says you do\".",
     "Note the second half. Writing a policy that promises more than you do is how organisations generate their own findings."],
    ["Internal audit / management review", "Clause 9 requirements. You audit your own ISMS on a planned cycle, and leadership formally reviews it at least annually.",
     "These two produce paperwork nobody wants to do and are the single most common reason a certification audit goes badly."]
  ]],
  ["Third-party risk", [
    ["Tiering", "Sorting suppliers by how much harm they could do you, so that assurance effort is proportionate. Usually Critical / High / Medium / Low.",
     "Tiering is the whole game. It is what lets you spend three days on one supplier and ten minutes on another without being arbitrary about it."],
    ["Security questionnaire", "The list of questions you send a supplier. Also the list of questions customers send you.",
     "Read the answers for evasion, not just for content. \"MFA is available\" is not \"MFA is enforced\". \"Data is encrypted\" does not say at rest, in transit, or who holds the keys."],
    ["SOC 2 Type I vs Type II", "Type I: an auditor looked at whether the controls were suitably designed on one specific date. Type II: an auditor tested whether they actually operated across a period, usually 6–12 months.",
     "Type I tells you almost nothing about whether anything works. A Type I claiming \"no exceptions\" is meaningless — there was no period in which an exception could be observed."],
    ["CUECs", "Complementary User Entity Controls. The section of a SOC 2 listing the things the customer must do for the supplier's controls to work at all.",
     "Almost nobody reads this section. It is usually a list of your own control failures, handed to you free, in a document you were given for reassurance."],
    ["Bridge letter", "A short statement from the supplier covering the gap between the end of their audit period and today.",
     "The correct thing to ask for when a report is a year old and you are told the next one is coming."],
    ["Article 28", "The UK GDPR article setting out what must be in a contract between a controller and a processor. Its terms are mandatory, not negotiable.",
     "\"Our standard terms are equivalent\" is not a legal test and you are allowed to say so. Article 28(2) also means a processor cannot bring in a sub-processor without the controller's authorisation — which is the trap in the Lumen task."],
    ["Sub-processor", "A supplier's supplier, who also touches the data.",
     "The question suppliers most often answer wrongly, sometimes twice in the same questionnaire."],
    ["IDTA / UK Addendum", "The UK's transfer mechanisms for sending personal data outside the UK: the International Data Transfer Agreement, or the UK Addendum bolted onto the EU standard contractual clauses. Both normally need a transfer risk assessment.",
     "Triggered by access as well as storage. Support staff in another country reading the data is a transfer, even if the servers never move."]
  ]],
  ["Incidents and the law", [
    ["Personal data breach", "A security incident causing accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to personal data.",
     "The definition is broader than \"stolen data\" — losing it counts, and so does altering it. But it must involve personal data. Malware on a laptop with no personal data on it is a security incident and not a personal data breach, which is the whole point of the Dmitri task."],
    ["Article 33", "The notification duty. 33(1): a controller notifies the ICO within 72 hours of becoming aware, unless the breach is unlikely to result in a risk to people. 33(2): a processor notifies the controller without undue delay. 33(5): you must record every breach and your reasoning, including the ones you decide not to report.",
     "If you are the processor, you do not report to the ICO. You tell the controller, fast, because your notification is what starts their clock. Getting this backwards is the most common mistake in the whole subject."],
    ["Article 34", "Telling the affected individuals, required when there is a high risk to their rights and freedoms.",
     "A controller decision, not a processor one — but a good processor says plainly when it thinks the threshold is met."],
    ["Awareness", "The moment the 72 hours starts. Not the moment you are certain — the moment you have a reasonable degree of certainty that a breach has occurred.",
     "You notify on incomplete facts and update in phases. Waiting for a tidy picture is how organisations miss the deadline while feeling diligent."],
    ["Severity classification", "Your own internal scale, usually P1–P4, for how hard the organisation should be reacting.",
     "Entirely separate from whether something is reportable. A P1 may not be notifiable; a P3 might be."],
    ["Post-incident review", "The write-up afterwards that produces corrective actions and register entries.",
     "The step that turns an incident from a cost into evidence of a working ISMS. An assurance pack showing incidents handled well beats one claiming zero incidents, which reads to any auditor as nobody looking."]
  ]],
  ["Security words you need but will not own", [
    ["Least privilege / need-to-know", "People get the minimum access required to do their job, and no more.",
     "The principle behind most access findings you will ever write."],
    ["Shared or service account", "A login used by more than one person, or by a system.",
     "The problem is not the password. It is that you cannot tell who did what, and you cannot remove one person's access without removing everyone's."],
    ["MFA", "Multi-factor authentication. A password plus something else.",
     "Watch for \"available\" versus \"enforced\". Available means off."],
    ["Read replica", "A copy of a live database, kept in sync, used for reporting so that queries don't slow the real thing down.",
     "A replica contains the same data as production. \"It's only the replica\" and \"it's read-only\" are not confidentiality arguments — they are availability and integrity arguments. That is the trap in the Metabase task."],
    ["Pen test / CVSS", "A penetration test is an authorised simulated attack. CVSS is a 0–10 technical severity score attached to findings.",
     "Your job is to translate CVSS into business risk and to challenge it in both directions. A CVSS 9.8 on a system holding nothing is not your top priority; a CVSS 5 on the pupil database might be."],
    ["Patch SLA", "The agreed time to fix vulnerabilities by severity — e.g. critical in 14 days.",
     "Your metric is not \"are we patching\" but \"how often do we breach our own SLA, and who knows\"."],
    ["EDR", "Endpoint detection and response. The security software on laptops and servers that spots and quarantines malicious activity.",
     "In the Dmitri task, \"Defender quarantined it\" is EDR working — after the thing had already run."],
    ["DLP", "Data loss prevention. Tooling that spots sensitive data leaving.",
     "Brightpath has none, which is why school staff can paste EHCP details into a support ticket unchallenged."],
    ["RTO / RPO", "Recovery time objective: how long you may be down. Recovery point objective: how much data you may lose.",
     "Both are business decisions that someone senior must actually agree. \"Backups are daily\" states an RPO of up to 24 hours whether anyone meant to or not."]
  ]]
];

const WORKED_EXAMPLE = {
  title: "Building the Metabase risk, step by step",
  intro: "This is the task you had. Nothing here is a trick — it is a recipe, and the recipe is the same every time. Read the thread again alongside it.",
  steps: [
    ["1. Find what is already true.",
     "Not what might happen — what is true right now, in the artefact. From the thread: one login (analytics@brightpath.io) is shared; it has no MFA; Rob cannot list who holds it and names two former contractors; the account reads a replica containing names, dates of birth, SEN flags and free-text pastoral notes; a fifth person asked for it this morning.",
     "That list is your cause. Everything true is free — you do not have to argue for it."],
    ["2. Name the bad thing that could follow.",
     "Someone with no legitimate need reads identifiable pupil records, including safeguarding content.",
     "This is your event. One event, not three. If you find yourself writing \"and also\", you have two risks and should write two entries."],
    ["3. Follow it to something a CEO would care about.",
     "A school, as controller, has a notifiable breach. A child's pastoral information is in the wrong hands. Brightpath loses the Fenwick contract that the whole ISMS exists to win.",
     "This is your consequence, and it is where most people stop too early. \"A data breach\" is not a consequence — it is the event again. Push one step past it: money, harm, regulator, contract."],
    ["4. Put the three parts in order and read it aloud.",
     "\"Because Metabase access to the production replica is granted through a single shared credential with no MFA and no record of who holds it, there is a risk that people with no legitimate need read identifiable pupil records including SEN flags and pastoral notes, resulting in a notifiable breach for the schools as controllers, harm to a child, and loss of the Fenwick contract.\"",
     "One sentence. Long is fine. The order is what does the work."],
    ["5. Score it, then say why.",
     "Likelihood 4 — not a hypothetical; the credential is circulating and a fifth person asked for it this morning. Impact 4 — safeguarding-adjacent data about children, with contractual and regulatory consequences. Score 16.",
     "The number matters less than the sentence after it. \"4 because a fifth person asked for it this morning\" is a defence. \"4\" on its own is a guess."],
    ["6. Read the score against the appetite, and let it choose the treatment.",
     "Brightpath's appetite says 15–25 is unacceptable and must be treated within 30 days. 16 is therefore Modify. Retain is not available to you at that score.",
     "This is why appetite exists — so the treatment is not your opinion."],
    ["7. Pick the owner by asking who can authorise the fix.",
     "The fix is engineering work on the data platform: kill the shared account, named access, mask pastoral notes from the analytics view, give sales a demo dataset. Who can direct that? Saskia, the CTO.",
     "Not Rob — he caused it and is not on the leadership team. Not Priya — two days a week and a contractor. Not you. Never you."],
    ["8. Give the treatment a shape.",
     "\"Shared credential disabled and named Metabase access issued within 10 working days; pastoral_notes and SEN excluded from the analytics view; demo dataset for sales before the Fenwick pitch. Owner: Saskia.\"",
     "What, who, by when. If you cannot write a date, you have not finished thinking — and that is the whole of what the grader calls professional craft."]
  ],
  outro: "That is a 4, comfortably, on all four dimensions. Nothing in it required knowing a control number. If you want the extra half-mark, add the Annex A references — A.5.15 access control, A.5.18 access rights, A.8.3 information access restriction, A.8.11 data masking — but they are decoration on top of the reasoning, not a substitute for it."
};

const DIM_EXPLAIN = [
  ["technical", "Is it right, according to the standard or the law?",
   "Did you get the controller/processor position right? Is the article number correct? Did you notice the certificate was for the wrong edition? This is the dimension that rewards looking things up.",
   "Cheapest way to gain marks: stop writing \"data breach\" and start writing which specific thing happened to which specific data."],
  ["judgement", "Proportionality, prioritisation, and knowing when to escalate versus decide.",
   "Did you demand ISO 27001 from a four-person supplier? Did you treat the loud email as the urgent one? Did you decide something that was not yours to decide?",
   "Cheapest way to gain marks: before you answer, ask \"how bad is this compared with the other things on my desk, and whose decision is it actually?\""],
  ["communication", "Clear, neutral, and written for the person who has to act on it.",
   "Would Nadia know what to do after reading it? Is it free of \"we take security seriously\" and \"robust processes\"? Is it short enough to be read?",
   "Cheapest way to gain marks: delete every sentence that would survive being moved to a different company's document."],
  ["craft", "Evidence-thinking, root causes, named owners, realistic dates.",
   "Does every action have a person and a date? Did you fix the cause or the symptom? Did you write down the decision and the reason?",
   "Cheapest way to gain marks: never end a piece of work without a name and a date in it."]
];
