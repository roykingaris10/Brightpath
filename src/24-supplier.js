/* ============================================================
   Task type: SUPPLIER ASSESSMENT
   ============================================================ */

function supplierFields(extra){
  return [
    { id:"tier", kind:"select", label:"Supplier tier", options:["—","Critical","High","Medium","Low"] },
    { id:"decision", kind:"chips", label:"Recommendation", options:[
      "Approve","Approve with conditions","Decline — do not proceed","Escalate — I cannot decide this alone"] },
    { id:"findings", kind:"textarea", rows:7, label:"What is wrong with the assurance you have been given?",
      hint:"Be specific. An auditor will read this line by line.", placeholder:"" },
    { id:"conditions", kind:"textarea", rows:5, label:"Conditions and next steps",
      hint:"What must be true before this supplier touches our data, who does it, by when.", placeholder:"" },
    { id:"note", kind:"textarea", rows:5, label:"The note that goes to the business",
      hint: extra || "Two short paragraphs. Written for a non-security reader who has to act on it.", placeholder:"" }
  ];
}

const SUPPLIER_SCENARIOS = [
{
  id:"sup-lumen", type:"supplier", skill:"tprm", secondary:"iso",
  title:"Lumen Learning Analytics — assurance pack",
  from:"nadia",
  brief:"Nadia has chased this pack for three weeks. Product want Lumen live before the summer release. Read what came back, and read the certificate.",
  render(){ return email({
    from:"Nadia Haq <nadia.haq@brightpath.io>",
    to:"Alex Osei <alex.osei@brightpath.io>",
    cc:"Dr Ellie Mensah",
    sent:"Today 08:52",
    subject:"FW: Brightpath security questionnaire — Lumen Learning Analytics Ltd",
    body:`Alex — finally. Three chases and a phone call. Their ops director sent this over last night with the certificate attached.\n\nContext so you have it: Lumen build the attainment prediction models. Ellie's team want to send them a nightly extract of pupil attainment records — pupil identifier, year group, prior attainment, SEN flag, free school meals flag, and predicted grades — for about 180,000 pupils across our school estate. Ellie says the SEN and FSM flags materially improve the model, so they're in the extract.\n\nProduct want them switched on for the summer release, which is six weeks away. I've held the PO. Tell me what you need.\n\nNadia`
  }) + qaSheet("Returned questionnaire — Lumen Learning Analytics Ltd", "Received 16 Jan, 23:41",
    "Brightpath Supplier Security Questionnaire (short form). Responses as submitted, unedited.",
    [
      ["1. Do you hold any information security certifications?",
       "Yes — we are ISO 27001 certified. Certificate attached."],
      ["2. Where will Brightpath data be stored and processed?",
       "Our infrastructure is cloud-based and we use industry-leading providers. Data is stored securely."],
      ["3. Is data encrypted?",
       "Yes, all data is encrypted."],
      ["4. Do you use any sub-processors or third parties to deliver this service?",
       "No sub-processors are used for this engagement."],
      ["5. Describe your access control model for customer data.",
       "Access is restricted to authorised personnel on a need-to-know basis. We take security very seriously and all staff sign a confidentiality agreement."],
      ["6. Do you enforce multi-factor authentication for administrative access?",
       "MFA is available."],
      ["7. When was your last penetration test, and can you share the summary?",
       "We undertake regular security testing as part of our development lifecycle."],
      ["8. Do you have a documented incident response process, and what is your breach notification commitment to customers?",
       "Yes. We would notify affected customers promptly."],
      ["9. Which of your staff will have access to Brightpath data, and where are they located?",
       "Our modelling team in Manchester, supported by our development partner in Bengaluru who handle platform engineering and out-of-hours support."],
      ["10. Do you use customer data to train, improve or benchmark your models?",
       "Model improvement is a core part of our offering and is covered in our standard terms (clause 9.3)."],
      ["11. What is your data retention and deletion commitment on termination?",
       "Data is retained in line with our retention policy."],
      ["12. Please confirm you will sign Brightpath's data processing agreement.",
       "We would prefer to contract on our own standard terms, which include comprehensive data protection provisions. Our legal team advise this is equivalent."]
    ]) +
    docSheet("Attachment — certificate.pdf", "1 page",
      "Certificate of Registration",
      [["Standard","ISO/IEC 27001:2013 Information Security Management"],
       ["Certificate no.","GCA-UK-114-2022"],
       ["Organisation","Lumen Learning Analytics Ltd, 4th Floor, 22 Cornhill Buildings, London EC3V"],
       ["Scope of registration","The provision of marketing, administrative and general office support services at the registered London office."],
       ["Original certification","14 March 2022"],
       ["Valid until","13 March 2025"],
       ["Issued by","GlobalCert Assurance Ltd"]],
      `<em>This is to certify that the management system of the above organisation has been assessed and found to conform to the requirements of the standard shown. GlobalCert Assurance Ltd is an accredited certification body. Certification is subject to the continuing satisfactory operation of the organisation's management system.</em>`);
  },
  fields: supplierFields("Nadia is holding a PO and Ellie wants this live in six weeks. Write the note you would actually send."),
  checks:[
    { id:"c_ver", dim:"technical", w:1, label:"Certificate is against ISO/IEC 27001:2013 — a withdrawn edition, not the 2022 standard",
      any:[/2013/i] },
    { id:"c_exp", dim:"technical", w:2, label:"Certificate expired on 13 March 2025",
      any:[/expir|lapsed|out of date|no longer valid|13 march|2025|not current|three-?year cycle ended/i] },
    { id:"c_scope", dim:"technical", w:3, label:"The scope covers marketing and office support in London — it does not cover the service Brightpath is buying",
      any:[/scope|marketing|office support|administrat|does not cover|doesn'?t cover|unrelated|nothing to do with|london office|not the service|excludes the model/i] },
    { id:"c_ukas", dim:"technical", w:3, label:"No UKAS accreditation — 'an accredited certification body' with no accreditation mark or reference means nothing",
      any:[/ukas|accredit|unaccredited|non-?accredited|iaf|accreditation (body|mark|number)|self-?declared|who accredit/i] },
    { id:"subp", dim:"technical", w:3, label:"Q4 says no sub-processors; Q9 names a development partner in Bengaluru with out-of-hours access — the pack contradicts itself",
      any:[/contradict|q4|question 4|inconsisten|sub-?processor|bengaluru|india|development partner|says no.*but|denied|undisclosed/i] },
    { id:"transfer", dim:"technical", w:2, label:"Access from India is an international transfer needing a transfer mechanism (IDTA or the UK Addendum) and a TRA",
      any:[/international transfer|restricted transfer|third country|idta|addendum|transfer (risk )?assessment|\btra\b|chapter v|adequa|sccs?\b/i] },
    { id:"train", dim:"technical", w:2, label:"Q10 is an admission that pupil data would be used to improve Lumen's own models — a purpose beyond the instruction",
      any:[/train|improve (their|its|the) model|clause 9\.3|own purpose|beyond (the )?instruction|secondary use|article 28\(?10|becomes (a )?controller|their own product|benchmark/i] },
    { id:"art28", dim:"technical", w:2, label:"Refusal to sign the DPA — 'our terms are equivalent' is not a defence; Article 28 terms are mandatory and Brightpath must flow them down",
      any:[/article 28|art\.? ?28|\bdpa\b|data processing agreement|mandatory|flow[- ]down|not negotiab|equivalent is not|must sign|written contract|28\(3\)/i] },
    { id:"controller", dim:"judgement", w:2, label:"The schools are the controllers — they authorise sub-processors, and SEN/FSM data about 180,000 children raises the bar",
      any:[/school|controller|authoris|authoriz|\bsen\b|special category|free school meal|\bfsm\b|180,?000|children|dpia|consult/i] },
    { id:"vague", dim:"judgement", w:1, label:"Called out the evasions — 'MFA is available', 'encrypted', 'regular testing' answer nothing",
      any:[/vague|evasive|non-?answer|available (is not|≠|does not mean)|not enforced|doesn'?t say|unspecific|at rest|in transit|key management|no date|no evidence|meaningless|boilerplate/i] },
    { id:"gate", dim:"craft", w:2, label:"Conditions are hard gates with an owner and a date — not 'we will monitor'",
      any:[/before|prior to|until|must|by \d|\d+ (working )?days|owner|nadia|ellie|no data (until|before)|gate|hold the po|sign(ed)? (the )?dpa/i] },
    { id:"timeline", dim:"judgement", w:1, label:"Engaged with the six-week release date instead of ignoring it",
      any:[/six weeks|6 weeks|summer release|timeline|deadline|slip|not (going to )?(be )?ready|realistic|delay|synthetic|pseudonym|without (sen|fsm)|reduced (extract|dataset)|pilot/i] }
  ],
  scoring:{
    goodTier:["Critical","High"], badTier:["Low","Medium"],
    goodDecision:["Decline — do not proceed","Approve with conditions"], badDecision:["Approve"],
    decisionNote:"Either 'Decline' or 'Approve with conditions' is defensible — what is not defensible is 'Approve'. If you chose conditions, they have to be hard gates: no pupil data moves until a signed Article 28 DPA, disclosed sub-processors with a transfer mechanism, clause 9.3 struck out, and assurance that is not the attached certificate."
  },
  model:`The certificate is worthless four times over: it is against the withdrawn 2013 edition, it expired on 13 March 2025, its scope is "marketing, administrative and general office support services at the registered London office" — which is not the modelling service Brightpath is buying — and GlobalCert Assurance's claim to be "an accredited certification body" carries no UKAS accreditation mark or reference. A UKAS-accredited certificate names the accreditation body and carries its mark. This one does not, so it is a piece of paper a company bought.

The pack also contradicts itself. Q4 says no sub-processors; Q9 names a development partner in Bengaluru with out-of-hours platform access. That is an undisclosed sub-processor and an international transfer, which needs a transfer mechanism (IDTA or the UK Addendum to the EU SCCs) and a transfer risk assessment — and, because Brightpath is a processor, the schools' authorisation under Article 28(2).

Q10 is the one that should stop the PO on its own. "Model improvement is a core part of our offering, covered in clause 9.3" is Lumen telling you they will process 180,000 children's SEN and FSM flags for their own purposes. A processor that determines its own purpose stops being a processor.

Q12 is not a negotiating position. Article 28(3) terms are mandatory. "Our legal team advise this is equivalent" is a sentence you write down and send to whoever owns the contract.

Tier: Critical or High — special-category-adjacent data about 180,000 children, nightly, at volume.

Recommendation: do not proceed on this pack. If Product still want Lumen, the conditions are gates, not aspirations: signed Brightpath DPA with Article 28(3) terms and clause 9.3 struck; sub-processors disclosed in writing with an IDTA and a TRA; independent assurance of the actual service (a scoped, in-date, UKAS-accredited certificate or a SOC 2 Type II covering the modelling platform, or a controls walkthrough plus a recent pen test summary); and confirmation of how the schools' Article 28(2) authorisation is handled. Nothing leaves Brightpath until those are in place.

On the six weeks: say so now. There is a version of the summer release that ships with a pseudonymised extract without SEN and FSM, and that conversation is better had today than in week five.`,
  aiBrief:`Planted flaws the learner must catch, in rough order of importance:
(1) Certificate scope is "marketing, administrative and general office support services at the registered London office" — it does not cover the analytics/modelling service being purchased. This is the biggest catch.
(2) The issuing body, GlobalCert Assurance Ltd, claims to be "an accredited certification body" but shows no UKAS accreditation mark or reference number — an unaccredited certificate.
(3) The certificate is against ISO/IEC 27001:2013, a withdrawn edition (should be 2022).
(4) It expired on 13 March 2025.
(5) Q4 ("no sub-processors") directly contradicts Q9 (development partner in Bengaluru with out-of-hours access) — an undisclosed sub-processor and an international transfer requiring an IDTA/UK Addendum and a transfer risk assessment, plus the schools' authorisation under Article 28(2) since Brightpath is itself a processor.
(6) Q10 admits customer data is used for Lumen's own model improvement under clause 9.3 — processing beyond the controller's instruction; a processor determining its own purposes becomes a controller in its own right.
(7) Q12 refuses Brightpath's DPA; Article 28(3) terms are mandatory and "equivalent" is not a legal test.
(8) Evasive non-answers throughout: "MFA is available" (not enforced), "data is encrypted" (at rest? in transit? key management?), "regular security testing" (no date, no scope, no report).
Correct tier: Critical or High (180,000 pupils, SEN and FSM flags, nightly). Correct recommendation: "Decline" or "Approve with conditions" where the conditions are hard pre-conditions. "Approve" is wrong. Reward a learner who tells Nadia and Ellie now that the six-week date is at risk and offers a reduced-dataset alternative, rather than silently blocking.`
},

{
  id:"sup-cloudspan", type:"supplier", skill:"tprm", secondary:"audit",
  title:"Cloudspan Hosting — SOC 2 review",
  from:"nadia",
  brief:"Cloudspan render the school report PDFs. They have sent a SOC 2 report instead of answering the questionnaire. Nadia wants to know if that is good enough.",
  render(){ return email({
    from:"Nadia Haq <nadia.haq@brightpath.io>",
    to:"Alex Osei <alex.osei@brightpath.io>",
    sent:"Today 09:15",
    subject:"Cloudspan — they've sent a SOC 2 instead",
    body:`Their account manager says "we don't complete questionnaires, here's our SOC 2, this satisfies all our enterprise customers". I've pulled the key pages out for you below — the full report is 94 pages and in the shared drive if you need it.\n\nFor context: Cloudspan take the pupil progress data, render it into the termly report PDFs the schools download, and hold each rendered document for 30 days. Renewal is on 28 February so we have about six weeks. They've gone up 18% and Tom wants a reason to push back, which is not my problem or yours but I thought you'd want to know the temperature.\n\nNadia`
  }) + docSheet("Extract — Cloudspan Hosting Ltd, SOC 2 report", "Pages 1–3, 9, 61",
    "Independent Service Auditor's Report",
    [["Report type","SOC 2 <strong>Type I</strong>"],
     ["Trust services criteria","Security, Availability"],
     ["As of date","30 September 2024"],
     ["Service organisation","Cloudspan Hosting Ltd"],
     ["Auditor","Marrow &amp; Kline LLP"],
     ["System scope","Cloudspan Render Platform hosted in the Frankfurt (eu-central-1) and Ashburn (us-east-1) regions."]],
    `<strong>From the auditor's opinion (page 3):</strong>\n\n<span class="quoted">In our opinion, the description presents the Cloudspan Render Platform that was designed and implemented as of 30 September 2024, and the controls stated in the description were suitably designed as of 30 September 2024 to provide reasonable assurance that the service organisation's service commitments and system requirements would be achieved.</span>\n\n<strong>From Section 4, Complementary User Entity Controls (page 9) — extract, 7 of 11 listed:</strong>\n\nCUEC-1. User entities are responsible for provisioning and de-provisioning their own administrative users in the Cloudspan console.\nCUEC-2. User entities are responsible for enforcing multi-factor authentication on their console accounts.\nCUEC-4. User entities are responsible for reviewing access to the Cloudspan console at least quarterly.\nCUEC-6. User entities are responsible for classifying data submitted to the platform and for determining whether the platform is appropriate for that classification.\nCUEC-7. User entities are responsible for configuring document retention settings appropriate to their obligations.\nCUEC-9. User entities are responsible for monitoring the notification endpoint for security advisories.\nCUEC-11. User entities are responsible for encryption of data prior to submission where end-to-end confidentiality is required.\n\n<strong>From Cloudspan's covering email:</strong>\n\n<span class="quoted">Please note our SOC 2 covers all controls relevant to your use of the platform. We have no exceptions. A Type II report is scheduled for a future period. We consider this report to satisfy your due diligence requirements in full.</span>`);
  },
  fields: supplierFields("Nadia is not a security person and has a renewal in six weeks. Give her something she can act on."),
  checks:[
    { id:"type1", dim:"technical", w:3, label:"Type I tests design at a point in time only — it says nothing about whether controls actually operated",
      any:[/type (i|1)\b|type one|point in time|as of|design(ed)? (only|but)|not (test|operat)|operating effective|over a period|says nothing about|suitably designed/i] },
    { id:"stale", dim:"technical", w:2, label:"The as-of date is 30 September 2024 — the report is well over a year old and there is no bridge letter",
      any:[/30 september|2024|stale|out of date|over a year|bridge letter|gap letter|how old|age of the report|since then|no coverage (since|after)/i] },
    { id:"cuec", dim:"technical", w:3, label:"The CUECs are Brightpath's obligations — and Brightpath does not currently meet CUEC-1, 2, 4 or 7",
      any:[/cuec|complementary|user entity|our (own )?responsibilit|on us|we (are|would be) responsible|we do not (do|meet)|quarterly (access )?review|mfa on|retention setting|not doing/i] },
    { id:"noexc", dim:"judgement", w:2, label:"'We have no exceptions' is meaningless in a Type I — there is no testing period in which an exception could arise",
      any:[/no exception|meaningless|cannot have|by definition|nothing was tested|no testing|misleading|not a boast|doesn'?t mean/i] },
    { id:"region", dim:"technical", w:2, label:"Scope names Frankfurt and Ashburn — pupil data rendered in the US is a restricted transfer nobody has assessed",
      any:[/ashburn|us-?east|united states|\bus\b region|frankfurt|international transfer|restricted transfer|third country|idta|addendum|where is the data|data residen|adequa/i] },
    { id:"criteria", dim:"technical", w:1, label:"Trust services criteria cover Security and Availability only — no Confidentiality, no Privacy",
      any:[/confidential|privacy|trust services|criteria (are|only|cover)|two criteria|security and availability|not (include|cover) (confidential|privacy)/i] },
    { id:"notno", dim:"judgement", w:2, label:"Did not simply reject it — a SOC 2 is real assurance, the issue is what this one covers and what it leaves to Brightpath",
      any:[/useful|does (give|tell|provide)|partial|some assurance|not worthless|starting point|better than|accept.*(with|subject to)|proportionat|in itself|combined with/i] },
    { id:"ask", dim:"craft", w:2, label:"Asked for the right next artefact: a Type II covering a real period, or a bridge letter plus a date for one",
      any:[/type (ii|2)\b|type two|bridge letter|gap letter|commit(ment)? to|when will|next report|period covering|contract(ual)? (right|clause)|audit right|renewal/i] },
    { id:"own", dim:"craft", w:2, label:"Turned CUECs into Brightpath actions with owners — that is the finding, not the supplier's problem",
      any:[/owner|rob|nadia|saskia|action|we (need|must|should) (to )?(implement|enable|start|do)|raise (a )?risk|register|by \d|quarterly|add to/i] },
    { id:"lever", dim:"judgement", w:1, label:"Used the renewal and the 18% increase as the moment to get the contract terms right",
      any:[/renew|28 february|leverage|negotiat|18 ?%|price|contract|now is the|before we sign|use the/i] }
  ],
  scoring:{
    goodTier:["High","Critical"], badTier:["Low"],
    goodDecision:["Approve with conditions","Escalate — I cannot decide this alone"], badDecision:["Approve","Decline — do not proceed"],
    decisionNote:"'Approve with conditions' is the grown-up answer. Declining outright over a Type I is disproportionate — Cloudspan are already live, the service is low-drama, and you have a renewal date that gives you leverage. Approving as-is means signing up to eleven control obligations you have not read."
  },
  model:`A Type I tells you an auditor looked at the design of the controls on one day — 30 September 2024 — and thought they were suitably designed. It does not tell you a single control operated, because nothing was tested over a period. "We have no exceptions" follows automatically from that and is not a boast; there was no window in which an exception could have been observed.

The report is also more than a year old with no bridge letter, and it covers Security and Availability only. Not Confidentiality. Not Privacy. For a supplier rendering identifiable pupil progress data into documents, that is a conspicuous pair of gaps.

The scoped regions are Frankfurt and Ashburn. Ashburn is Virginia. If school pupil data is being rendered in the United States, that is a restricted transfer under Chapter V that nobody at Brightpath has assessed or papered, and it is a question the schools' own DPAs will eventually ask.

The part most people skim is Section 4. Those eleven CUECs are not Cloudspan's controls — they are conditions Cloudspan's assurance depends on, and they are Brightpath's to run. We do not provision and de-provision Cloudspan console users through any process. We do not enforce MFA on them. We have never reviewed that access quarterly. We have never set the document retention configuration. Four control failures, ours, found in a supplier's report — which is exactly what these sections are for.

Tier: High. Recommendation: approve with conditions, and use the 28 February renewal as the lever.

Conditions: a written commitment to a Type II covering a named period, with a bridge letter for the interval; Confidentiality added to the criteria; written confirmation of where pupil data is processed and an IDTA or UK Addendum if Ashburn is in the path; an audit-rights and sub-processor clause in the renewal. And separately from Cloudspan: four actions on us, with Rob and Nadia named, to close the CUEC gaps before the renewal date.

That is the note Nadia can act on. It gives Tom a reason to push back on the 18% that is better than "it feels like a lot".`,
  aiBrief:`Planted flaws: (1) It is a SOC 2 Type I — design at a point in time, no operating effectiveness, no testing period. This is the central catch. (2) "As of 30 September 2024" — the report is stale and there is no bridge/gap letter covering the interval. (3) The eleven Complementary User Entity Controls are Brightpath's own obligations, and Brightpath demonstrably fails CUEC-1 (no console user provisioning process), CUEC-2 (no MFA enforcement), CUEC-4 (no quarterly access review) and CUEC-7 (retention never configured) — a strong answer converts these into Brightpath actions with owners, not supplier findings. (4) "We have no exceptions" is vacuous in a Type I. (5) Scope includes Ashburn (us-east-1) — a restricted international transfer of pupil data that has never been assessed. (6) Trust services criteria are Security and Availability only — Confidentiality and Privacy are absent, which matters for this service. Correct tier High (Critical defensible). Correct recommendation: "Approve with conditions" (or "Escalate"); an outright Decline is disproportionate for a live, low-drama rendering service and "Approve" as-is is wrong. Reward using the 28 February renewal as leverage for contract terms.`
},

{
  id:"sup-snapdesk", type:"supplier", skill:"tprm", secondary:"stake",
  title:"Snapdesk — room booking, four people, no certifications",
  from:"nadia",
  brief:"Nadia wants a meeting-room booking tool. It costs £41 a month. She has filled in your questionnaire on the supplier's behalf because they did not understand it.",
  render(){ return email({
    from:"Nadia Haq <nadia.haq@brightpath.io>",
    to:"Alex Osei <alex.osei@brightpath.io>",
    sent:"Today 09:40",
    subject:"Snapdesk — room booking. Please don't make this hard.",
    body:`We have four meeting rooms and a spreadsheet, and the spreadsheet has now caused two arguments and a missed board call. Snapdesk is £41 a month and does exactly one thing.\n\nI sent them your questionnaire. The founder rang me, very nice, slightly baffled, and we went through it on the phone — I've written down what he said below. There are four of them. They do not have ISO 27001 and he was quite funny about the idea.\n\nI'd like to buy it this week. Tell me what you need from me. And Alex — I'm going to say this kindly — the last thing security did here was block Ellie's transcription tool for nine weeks and then approve it unchanged, so.\n\nNadia`
  }) + qaSheet("Questionnaire responses — Snapdesk Ltd", "Taken by phone, 17 Jan",
    "Notes taken by Nadia Haq during a call with the Snapdesk founder. Not written by the supplier.",
    [
      ["Company", "Snapdesk Ltd, registered in England, four employees, trading since 2021. ~600 customers, mostly small offices and one NHS trust's admin building."],
      ["What data will they hold?", "Staff name, work email address, meeting room, start and end time, and the meeting title if the person types one. Calendar sync is optional and we would not turn it on."],
      ["Certifications?", "None. He said \"we're four people, we'd fail an ISO audit on the paperwork alone, but I'll show you anything you want to look at\"."],
      ["Hosting?", "AWS London (eu-west-2). He confirmed it's a company account, not his personal one — he said someone asked that before and he'd moved it in 2022."],
      ["Authentication", "Email and password, or Google sign-in. No SSO/SAML. No enforced MFA — he said Google sign-in gives you whatever MFA Google gives you."],
      ["Admin access to customer data", "\"Me and one other person. I can see bookings if you raise a support ticket. I can't see anything you haven't typed into the tool.\""],
      ["Leaver process at Snapdesk", "\"If someone left I'd remove their access the same day. We've never had anyone leave.\""],
      ["Backups / availability", "Nightly database backup to a separate AWS account. No formal SLA. \"If it goes down for a day you'd use the spreadsheet again.\""],
      ["Breach notification", "Not in the standard terms. He said he would obviously tell us and was happy to put it in writing."],
      ["Terms of service", "Clause 6.2 permits Snapdesk to use \"aggregated and anonymised usage data to improve the service and produce industry benchmarks\"."],
      ["Deletion on termination", "\"Export your data, tell me, I'll delete it and confirm by email.\" Nothing contractual."],
      ["Anything else he volunteered", "That an NHS trust did a full assurance review on them last year and he'd send us the correspondence if it helped."]
    ]);
  },
  fields: supplierFields("Nadia has a point about the transcription tool. Write the note that makes the decision, and makes it this week."),
  checks:[
    { id:"prop", dim:"judgement", w:3, label:"Tiered this proportionately — staff names, work emails and room bookings, no pupil data, £41 a month",
      any:[/proportion|low (risk|tier|impact)|no pupil|not (personal|sensitive|special)|small (amount|footprint|dataset)|staff (name|email)|room booking|scale|£41|minimal|limited data/i] },
    { id:"noiso", dim:"judgement", w:3, label:"Did not demand ISO 27001, a pen test or a SOC 2 from a four-person supplier for a room booking tool",
      any:[/not (require|demand|expect|ask for)|no need for|disproportionate|would not (be )?(sensible|reasonable)|unreasonable to|four[- ]person|too small|overkill|wouldn'?t insist|not appropriate|instead of (a )?(certification|iso)/i],
      penaltyAny:[/must (obtain|achieve|hold|provide) (iso|a certification|soc 2|cyber essentials)|require(s|d)? iso 27001|penetration test (is )?(required|mandatory|needed)|cannot (approve|proceed) without (iso|certification|soc)/i] },
    { id:"dpa", dim:"technical", w:2, label:"Article 28 terms are still required — size does not exempt a processor",
      any:[/article 28|art\.? ?28|\bdpa\b|data processing (agreement|terms)|written contract|processor terms|28\(3\)/i] },
    { id:"breach", dim:"technical", w:2, label:"Breach notification must be contractual, not a promise on a phone call — he offered, so take it",
      any:[/breach notification|notif(y|ication) (clause|commitment|in writing)|put (it|that) in writing|contractual|in the contract|take him up|timescale|without undue delay|72/i] },
    { id:"terms", dim:"technical", w:2, label:"Clause 6.2 — check what 'aggregated and anonymised' actually means here, and whether meeting titles are in it",
      any:[/6\.2|clause|aggregat|anonymis|anonymiz|benchmark|meeting title|what does.*mean|define|pseudonym|scope of|opt out/i] },
    { id:"titles", dim:"judgement", w:1, label:"Noticed meeting titles are free text and staff will put customer and candidate names in them",
      any:[/meeting title|free[- ]text|people (will|do) (type|put|write)|candidate|interview|school name|1:1|disciplinary|confidential|guidance to staff|don'?t put/i] },
    { id:"auth", dim:"technical", w:1, label:"Handled the no-SSO reality sensibly — Google sign-in, no separate passwords, offboarding via Google",
      any:[/google sign|\bsso\b|single sign|use google|no separate password|offboard|joiner|leaver|revoke|1password|unique password|mfa via/i] },
    { id:"keyperson", dim:"judgement", w:1, label:"Named the real residual risk — a four-person company is a key-person and continuity risk, and that is a business decision, not a security veto",
      any:[/key ?person|four people|if (he|they) |continuity|goes (bust|under)|viabilit|exit|export|fallback|spreadsheet|business decision|accept(able|ed)? risk|retain/i] },
    { id:"nhs", dim:"craft", w:1, label:"Took the free evidence — the NHS trust assurance correspondence costs nothing to read",
      any:[/nhs|correspondence|take him up|ask for (it|the)|free|worth (a )?look|send it|review that/i] },
    { id:"speed", dim:"stake", w:2, label:"Answered Nadia this week, and answered the thing she said about the transcription tool",
      any:[/this week|today|tomorrow|by friday|quick|fast|won'?t hold|no need to wait|go ahead|approve now|you'?re right|fair|last time|transcription|i'?ll (turn|get) (it|this) (around|back)/i] }
  ],
  scoring:{
    goodTier:["Low"], badTier:["Critical","High"],
    goodDecision:["Approve with conditions","Approve"], badDecision:["Decline — do not proceed","Escalate — I cannot decide this alone"],
    decisionNote:"Low tier, approve with light conditions. Declining or escalating a £41-a-month room booking tool that holds staff names and meeting times is how a GRC function becomes the department everyone routes around. The conditions should fit on one line each."
  },
  model:`Tier: Low. Staff name, work email, room, time, and an optional free-text title. No pupil data, no special category data, no access to Brightpath systems, no integration unless we turn calendar sync on — which we would not.

Approve with conditions, this week. The conditions are small because the risk is small:

1. Snapdesk sign Brightpath's short-form processing terms — Article 28(3) obligations still apply to a four-person company, and there is a one-page version of this for exactly these suppliers.
2. Breach notification goes into the contract with a timescale. He offered; take him up on it in writing.
3. Ask what clause 6.2 covers. "Aggregated and anonymised" is doing a lot of work in a product where the free-text field will end up containing "1:1 — performance", "Fenwick renewal" and candidate surnames. If meeting titles are in scope of 6.2, we want them out.
4. Accounts via Google sign-in only, so joiners and leavers are handled by the process Nadia already runs and there is no separate password to orphan.
5. One line of guidance when it is rolled out: don't put names or anything confidential in the meeting title.
6. Read the NHS trust correspondence he offered. It is free assurance from someone who did the work.

Residual risk, stated plainly for the record: Snapdesk is four people. If they fold, we go back to the spreadsheet — which is where we are now — so the continuity exposure is the inconvenience we already live with. That is worth retaining, and Nadia can sign it off.

What I am not going to ask for: ISO 27001, a SOC 2, or a penetration test report. Demanding a certification scheme that costs more than the annual contract value tells the business that security has no sense of proportion, and the next tool gets bought without asking us.

Nadia — you were right about the transcription tool. Buy this one.`,
  aiBrief:`This is a PROPORTIONALITY test and the trap runs in the opposite direction to the usual one. The data is staff name, work email, room, time and an optional free-text meeting title. No pupil data, no special category data, no system integration, £41/month, and the supplier is candid and cooperative. The correct answer is Low tier and approve with light conditions, this week.
Penalise heavily: demanding ISO 27001, a SOC 2 report, a penetration test, or a full-fat questionnaire from a four-person supplier for a room booking tool; declining; escalating; or producing a list of conditions so long it functions as a refusal. Nadia's remark about the transcription tool (blocked nine weeks then approved unchanged) is a direct signal about the GRC function's credibility and a good answer acknowledges it.
Real points that should still appear: Article 28 processing terms are required regardless of supplier size (a short-form DPA); breach notification must be contractual not verbal — and he already offered, so take it in writing; clause 6.2's "aggregated and anonymised usage data" needs defining, particularly whether free-text meeting titles are in scope; meeting titles will in practice contain candidate names, customer names and "1:1 — performance", so one line of user guidance is worth more than any certificate; accounts should go through Google sign-in so joiner/leaver runs through Nadia's existing process; the four-person company is a genuine continuity/key-person exposure that should be stated and retained with Nadia's sign-off, not treated as a blocker; and the NHS trust assurance correspondence he volunteered is free evidence worth reading.`
}
];
