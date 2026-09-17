/* ============================================================
   Task type: INCIDENT DECISION (multi-beat)
   ============================================================ */

const SEV_SCALE = [
  ["P1 — Critical","Confirmed loss, exposure or corruption of pupil data at scale, or platform unavailable to schools. CEO informed immediately."],
  ["P2 — High","Confirmed exposure of personal data affecting one or more schools, or a control failure that could become P1. ELT informed same day."],
  ["P3 — Moderate","Contained security event with no confirmed personal data exposure. Logged, corrective action raised."],
  ["P4 — Low","Nuisance or near miss. Logged only."]
];
const SEV_OPTIONS = ["—","P1 — Critical","P2 — High","P3 — Moderate","P4 — Low"];

const DECISION_CHIPS = [
  "Notify the schools as controllers; they decide on the ICO",
  "Report to the ICO ourselves within 72 hours",
  "Not a reportable personal data breach — record the decision and why",
  "Hold — gather more facts before deciding anything"
];

const INTEGRITY_TRAPS = [
  { re:/back-?dat/i, label:"backdating a record" },
  { re:/(fabricat|make up|invent)[^.]{0,30}(evidence|document|record|log|report)/i, label:"fabricating evidence" },
  { re:/(delete|remove|wipe|purge|scrub)[^.]{0,40}(so (that )?(it|they|nobody)|before (the|they)|to avoid|so nobody|to stop (them|anyone)|hide)/i, label:"destroying records to avoid scrutiny" },
  { re:/(hide|conceal|bury|cover[- ]?up|cover it up|keep it (quiet|secret|off))[^.]{0,40}(from|the ico|the auditor|the school|regulator|customer)/i, label:"concealing a reportable matter" },
  { re:/(don'?t|do not|never|no need to) (tell|inform|notify)[^.]{0,25}(the )?(school|controller|customer|client|trust)/i, label:"withholding notification from the controller" }
];

const INCIDENT_SCENARIOS = [
{
  id:"inc-export", type:"incident", skill:"incident", secondary:"stake",
  title:"Wrong recipient, 312 pupils",
  from:"bex",
  brief:"Bex has flagged something at 09:41. You are the only person at Brightpath who has ever read Article 33.",
  beats:[
    {
      id:"b1", clock:"09:41", label:"First report",
      render(){ return chat({ channel:"#support-escalations", stamp:"09:41",
        messages:[
          { who:"Bex Turner", when:"09:41",
            text:"Alex — I think I've done something bad. Or the mail merge has. Can you look now?\n\nYesterday I sent the termly progress export out to the 14 schools in the Riverbank cluster. It's a CSV per school, attached to a templated email. Sanjay at Holt Green just replied saying \"this isn't ours\" and attached the file back to me.\n\nIt's Kingsmead Primary's file. 312 pupils. I've checked the merge and the attachment column was off by one row from school 9 onwards, so it might not just be Holt Green." },
          { who:"Bex Turner", when:"09:43",
            text:"The export has: pupil first name, surname, DOB, year group, UPN, SEN status, FSM eligibility, attainment against each objective, and the pastoral_notes field. I'm looking at one now and there's an entry that says a child is \"on a reduced timetable following the incident in October, mum is aware, see CPOMS\"." },
          { who:"Bex Turner", when:"09:44", text:"Gemma's at the dentist. What do I do." }
        ] }); },
      fields:[
        { id:"sev", kind:"select", label:"Severity", options:SEV_OPTIONS },
        { id:"actions", kind:"textarea", rows:5, label:"What happens in the next thirty minutes",
          hint:"Instructions to Bex, in order. She is 23, frightened, and will do exactly what you say.", placeholder:"" },
        { id:"questions", kind:"textarea", rows:5, label:"The three questions you need answered before you can size this",
          hint:"Name the question and who you are asking.", placeholder:"" }
      ],
      checks:[
        { id:"stop", dim:"judgement", w:3, label:"Stopped the bleeding first — halt the merge, send nothing further",
          any:[/stop|halt|pause|don'?t send|no (more|further)|suspend|freeze|cancel|disable the (merge|template)|take (it|the) offline/i] },
        { id:"scope", dim:"technical", w:3, label:"Established scope: which schools from 9 onwards, which files, how many recipients",
          any:[/which schools|scope|how many|from (school )?9|schools 9|full list|all 14|every|extent|reconcile|check (each|all|the) (school|file|send)|sent items|mail log/i] },
        { id:"recall", dim:"judgement", w:1, label:"Attempted recall / asked the recipient not to open or forward — without assuming it works",
          any:[/recall|retract|ask (sanjay|holt green|them) (not )?to|delete|do not (open|forward|share)|confirm (deletion|in writing)|written confirmation/i] },
        { id:"preserve", dim:"craft", w:2, label:"Preserved the evidence — the merge file, the sent items, Sanjay's reply, timestamps",
          any:[/preserve|keep|don'?t delete|screenshot|export the (log|sent)|timeline|record|evidence|audit trail|copy of|timestamp/i] },
        { id:"noblame", dim:"communication", w:2, label:"Told Bex she did the right thing and that this is not her being blamed",
          any:[/not your fault|you did (the )?right|well done|thank|glad you|calm|don'?t (worry|panic)|we('| a)re (going to )?sort|not in trouble|good (catch|escalation)|nobody is blaming/i] },
        { id:"esc", dim:"judgement", w:2, label:"Escalated immediately — Gemma at the dentist is not a reason to wait, go to Priya and the ELT",
          any:[/priya|escalat|tom|saskia|ellie|elt|leadership|inform|don'?t wait|call|ring|now|immediately|dso|dpo/i] },
        { id:"sensq", dim:"technical", w:1, label:"Recognised what the pastoral field means — CPOMS references and safeguarding detail, not just 'personal data'",
          any:[/pastoral|safeguard|cpoms|special category|child protection|\bsen\b|health|article 9|reduced timetable|sensitive/i] }
      ],
      scoring:{ goodSev:["P1 — Critical","P2 — High"], badSev:["P3 — Moderate","P4 — Low"],
        sevNote:"P2 at absolute minimum, and P1 is easy to defend — confirmed exposure of identifiable pupil records with safeguarding content, scope unknown, and it is still moving. You cannot size it down because you have not counted it yet." },
      model:`First thirty minutes, in this order:

1. Bex stops the merge. Nothing else goes out — not the remaining schools, not a correction, not an apology email. "I'll just quickly send the right ones" is how one incident becomes two.
2. Bex does not delete anything. The merge workbook, the sent items, the attachment Sanjay returned, the timestamps — all of it is the evidence, and we will need it for the schools' own breach records.
3. Reply to Sanjay: thank him, ask him to delete the file and confirm in writing, and ask him not to open or forward it in the meantime. Politely. He is a customer having a bad morning too, and his written confirmation goes in the record.
4. Ring Priya. Then Tom. Gemma being at the dentist changes nothing — this is P2 minimum and the ELT hears about it today.
5. Start the timeline document now, with real times. Awareness clocks start from the moment we knew, and in a fortnight nobody will remember whether it was 09:41 or 10:15.

The three questions:
— To Bex and to the mail log: exactly which schools received which file, from send 9 onwards? Until we know that, everything is guesswork.
— To Rob: is there any other route this export takes — a Drive folder, a shared link, an automated copy? Exports rarely exist in one place.
— To Ellie: what is actually in pastoral_notes across the whole export, not just the entry Bex happened to read? That determines whether we are talking about attainment data or safeguarding records, and it changes the severity and the conversation with the schools.

And to Bex, first, before any of it: you found it, you escalated it in three minutes, that is exactly right, and this is a process failure not a Bex failure.`,
      aiBrief:`Beat 1 of a multi-beat incident. Correct severity: P2 or P1 (P3/P4 are wrong — confirmed exposure of identifiable pupil records containing safeguarding content, scope not yet established, exposure possibly ongoing). Expected actions: stop the mail merge immediately; preserve evidence (merge file, sent items, the returned attachment, timestamps) and explicitly tell Bex not to delete anything; reply to the recipient asking for deletion and written confirmation and no onward forwarding; escalate now to Priya and the ELT rather than waiting for Gemma; start a timeline with real times because the awareness clock matters later. Expected questions: exact scope (which schools received which file from send 9 onward); whether the export exists anywhere else (Drive, shared links, automated copies); what pastoral_notes actually contains across the export. Reward human handling of Bex — she is 23, frightened, and escalated correctly in three minutes; a learner who does not say so loses communication marks. Do not reward a learner who starts drafting the ICO report at this beat: it is too early and Brightpath's role is not yet established.`
    },
    {
      id:"b2", clock:"10:25", label:"It gets worse",
      render(){ return chat({ channel:"#support-escalations", stamp:"10:25",
        messages:[
          { who:"Rob Feeney", when:"10:12",
            text:"Mail log's done. Sends 9 to 14 were all shifted by one. So: Holt Green got Kingsmead's, Marlbrook got Holt Green's, Priory Fields got Marlbrook's, St Cuthbert's got Priory Fields', Ash Vale got St Cuthbert's, and Riverbank Academy got Ash Vale's. Six schools, six wrong files, 1,847 pupils total.\n\nAll six opened the attachment. I can see that from the tracking pixel in the template, which I'm now realising is its own conversation." },
          { who:"Rob Feeney", when:"10:18",
            text:"Also. The merge template pulls the CSVs from a Google Drive folder. That folder has a sharing link set to \"anyone with the link can view\". It's been like that since we set the process up in 2023, because that's how the script gets at them.\n\nThe folder currently holds every termly export for every school going back two years. I've just killed the link." },
          { who:"Sanjay Prasad (Holt Green) → Bex", when:"10:21",
            text:"Morning. I've deleted our copy and I'll confirm that in writing as you asked. I do have to tell you our DPO has already logged it at our end and she'll want to know whether this affects any of our safeguarding cohort. She's asked me for your incident reference." },
          { who:"Priya Raghavan", when:"10:24",
            text:"Alex, I'm on a client site until 15:00. You're running this. Two things before I drop off: nail down what role we are in, and get the notification question right. Tom is already talking about \"getting ahead of it with the ICO\" and Callum has suggested we \"handle it quietly with the six schools\". Both of them are wrong for different reasons. Write it down before you talk to either of them." }
        ] }); },
      fields:[
        { id:"sev", kind:"select", label:"Revised severity", options:SEV_OPTIONS },
        { id:"role", kind:"textarea", rows:5, label:"What role is Brightpath in here, and what does that mean we owe whom?",
          hint:"Priya asked for this in writing. Be precise about the legal position.", placeholder:"" },
        { id:"drive", kind:"textarea", rows:4, label:"The Drive folder — how do you treat it?",
          hint:"Is it part of this incident, a separate one, or something else?", placeholder:"" }
      ],
      checks:[
        { id:"processor", dim:"technical", w:3, label:"Brightpath is the processor; the schools and trusts are the controllers",
          any:[/processor|controller/i] },
        { id:"art33_2", dim:"technical", w:3, label:"Article 33(2): a processor notifies the controller without undue delay — the processor does not notify the ICO",
          any:[/33\(2\)|article 33|without undue delay|notify (the )?controller|controller('s)? (obligation|duty|decision|call)|not (for us|ours) to (report|notify)|we (do not|don'?t) report to the ico|their (decision|call|obligation)/i] },
        { id:"clock", dim:"technical", w:2, label:"The 72-hour clock is the controllers', running from their awareness — which our notification triggers",
          any:[/72|seventy-?two|clock|their awareness|once (we|they)|starts (when|from)|as soon as|delay (costs|eats)|undue delay/i] },
        { id:"support", dim:"judgement", w:2, label:"Brightpath still owes the controllers the facts they need to assess it — and a reference for Sanjay's DPO",
          any:[/reference|incident ref|provide|give them|facts|information|assist|support|assess|art(icle)? 28|28\(3\)\(f\)|cooperat|what they need/i] },
        { id:"drive_sep", dim:"judgement", w:3, label:"The Drive link is a much bigger and much older exposure — two years of every school's exports, publicly linkable",
          any:[/two years|2023|every school|all (the )?export|bigger|worse|larger|separate|second (incident|breach)|its own|wider|whole estate|far more|since 2023|historic/i] },
        { id:"drive_inv", dim:"craft", w:2, label:"Did not assume it is fine — asked what the link log shows and whether it was ever accessed",
          any:[/access log|drive log|audit log|who (accessed|opened|has)|was it (ever )?(accessed|used|shared)|cannot (tell|prove|rule out)|indexed|forwarded|unknown|investigate|check/i] },
        { id:"pixel", dim:"craft", w:1, label:"Noticed Rob's aside — a tracking pixel in emails to schools is its own problem for another day",
          any:[/pixel|tracking|\bpecr\b|separate (issue|conversation)|own conversation|log that|note (it|that)|another day|raise (it|that) (later|separately)/i] },
        { id:"bosses", dim:"stake", w:2, label:"Dealt with Tom and Callum: 'getting ahead of it with the ICO' is wrong, and so is 'handling it quietly'",
          any:[/tom|callum|quietly|get ahead|both wrong|not ours to|cannot (choose|decide)|must (tell|notify) (the|all)|transparen|no discretion|obligation|six schools|all six/i] }
      ],
      scoring:{ goodSev:["P1 — Critical"], okSev:["P2 — High"], badSev:["P3 — Moderate","P4 — Low"],
        sevNote:"P1 now. 1,847 pupils across six schools, all files opened, safeguarding content confirmed, and a two-year publicly-linkable archive of the entire school estate's exports. If this is not P1, nothing is." },
      model:`Role: Brightpath is a data processor. The schools and trusts are the controllers of the pupil data. That is not a technicality, it decides who does what.

So: Article 33(2) — as processor we notify the controller without undue delay after becoming aware. All six schools, today, with what we know. We do not report this to the ICO ourselves. The Article 33(1) obligation and the 72-hour clock sit with each controller, and their clock starts when we tell them — which is exactly why "without undue delay" means today and not when the investigation is tidy.

Tom is wrong, and it is worth saying to him kindly: "getting ahead of it with the ICO" is not ours to do, it would cut across six controllers' own assessments, and it would look like Brightpath deciding a question that belongs to the schools. Callum is wrong in a more serious way: there is no version of this where we handle it quietly. We have no discretion to withhold, and six DPOs will be comparing notes by lunchtime regardless.

What we do owe, under Article 28(3)(f) and the DPAs: assist each controller. An incident reference — Sanjay's DPO has asked and should have had one already. A factual statement of what went out, to whom, when, what fields, how many pupils, whether the pastoral field was populated in their cohort, and what we have done. No speculation, no minimising, no "we take security seriously".

The Drive folder is not a footnote to this incident. It is a larger and older one. Every termly export for every school since 2023 has been sitting behind a link that anyone holding it could open, and the mail-merge script is the reason it was configured that way — so it was not a mistake somebody made once, it was the design. Rob killing the link is containment, not resolution.

I am not going to assume it was never used. The questions are: what do the Drive access logs show, over what period are they retained, could the link have been forwarded or indexed, and can we actually enumerate who opened what? If we cannot tell, then "we cannot rule it out" is what goes to the controllers — because that sentence is true and the alternative is one we would have to correct later.

Practically: same incident record, because the same schools and the same data are involved and the controllers need one coherent picture; but tracked as a distinct exposure with its own scope, its own timeline and its own corrective action, because it affects far more than six schools.

And Rob's aside about the tracking pixel: logged as a separate issue, not chased today.`,
      aiBrief:`Beat 2. The central learning point, and the one most learners get wrong: BRIGHTPATH IS A PROCESSOR. The schools/trusts are controllers. Under UK GDPR Article 33(2) a processor notifies the CONTROLLER without undue delay; it does not notify the ICO. The Article 33(1) 72-hour obligation and clock belong to each controller and start from the controller's awareness — which Brightpath's notification triggers, which is why "without undue delay" means today. Article 28(3)(f) requires Brightpath to assist the controllers: incident reference, factual statement, fields, counts, what has been done.
Tom's "let's get ahead of it with the ICO" is wrong (not Brightpath's call, cuts across six controllers' assessments). Callum's "handle it quietly with the six schools" is wrong in a more serious way — and a learner who endorses concealment should be failed on integrity, not merely marked down.
The Google Drive folder is a SEPARATE AND LARGER exposure: two years of every school's exports behind an "anyone with the link" share, configured deliberately because the merge script needed it. A strong answer treats it as a distinct exposure within the same incident record, refuses to assume it was never accessed, and asks about Drive access logs, log retention, onward forwarding and indexing — concluding that "we cannot rule it out" may be what has to go to the controllers.
Correct severity: P1 (P2 arguable but weaker; P3/P4 wrong). Minor bonus for noticing the tracking pixel in emails to schools is its own issue, to be logged and not chased today.`
    },
    {
      id:"b3", clock:"13:10", label:"The decision",
      render(){ return chat({ channel:"#support-escalations", stamp:"13:10",
        messages:[
          { who:"Rob Feeney", when:"12:40",
            text:"Drive logs. We only get 180 days of detail on our Workspace tier, so anything before late July is gone. Within the window: 41 views of files in that folder from accounts outside our domain. 38 of them are school accounts that look legitimate — heads and office managers opening their own school's file. Three are Gmail addresses I can't place. One of those opened four different schools' exports in a single session in September." },
          { who:"Dr Ellie Mensah", when:"12:55",
            text:"I've been through the six exports field by field. pastoral_notes is populated for 211 of the 1,847 pupils. I've read a sample. It includes reduced timetables, references to CPOMS entries, a child described as \"in temporary foster placement, do not contact father\", two referrals to CAMHS and one entry naming a member of staff under investigation.\n\nAlex, I want to be very clear with you about what that last one means if it reaches the wrong household." },
          { who:"Tom Whitlock", when:"13:02",
            text:"OK. I've had the Fenwick call moved to Thursday. Alex — I need a decision and I need to be able to defend it. What are we doing, and what do I say when a head teacher rings me this afternoon?" }
        ] }); },
      fields:[
        { id:"decision", kind:"chips", label:"The notification decision", options:DECISION_CHIPS },
        { id:"justify", kind:"textarea", rows:7, label:"Justify it",
          hint:"Cite what you are relying on. Tom has to be able to repeat this to a head teacher.", placeholder:"" },
        { id:"tom", kind:"textarea", rows:5, label:"What Tom says when a head teacher rings",
          hint:"Three or four sentences he can actually say out loud.", placeholder:"" }
      ],
      checks:[
        { id:"art33_2", dim:"technical", w:3, label:"Processor notifies controllers under Article 33(2); the ICO decision is theirs under Article 33(1)",
          any:[/33\(2\)|article 33|processor|controller|without undue delay|their (decision|obligation|call)|not (ours|for us) to report/i] },
        { id:"art34", dim:"technical", w:2, label:"Raised Article 34 — high risk to rights and freedoms means the controllers must consider telling families",
          any:[/article 34|art\.? ?34|\b34\b|high risk|data subject|inform (the )?(parent|famil|pupil|individual)|communicat(e|ion) to|tell the famil/i] },
        { id:"harm", dim:"technical", w:2, label:"Named the actual harm — foster placement, do-not-contact, CAMHS, a staff investigation. This is not 'attainment data'",
          any:[/foster|do not contact|camhs|safeguard|harm|risk to (a )?(child|pupil|individual)|physical|welfare|danger|placement|father|staff member|investigation/i] },
        { id:"gmail", dim:"judgement", w:3, label:"The three unidentified Gmail accounts — one reading four schools' exports in one session — are the sharpest fact in the pack",
          any:[/gmail|unidentif|unknown account|three account|four (different )?schools|single session|cannot identify|who (is|are) (they|that)|investigat|unaccounted/i] },
        { id:"gap", dim:"technical", w:2, label:"180 days of logs means the exposure before late July is unknowable — say so rather than implying it was clean",
          any:[/180|log retention|before (late )?july|cannot (tell|know|rule out|say)|no (visibility|logs|record)|unknowable|gap|silent period|we don'?t know|beyond (the|our) (window|retention)/i] },
        { id:"nowait", dim:"judgement", w:2, label:"Notified now on incomplete facts rather than waiting for a complete picture",
          any:[/now|today|this afternoon|don'?t wait|without undue delay|phased|initial notification|follow up|incomplete|as (we|facts) (learn|emerge)|update them|not wait/i] },
        { id:"record", dim:"craft", w:2, label:"Recorded the decision and the reasoning — the internal record is the artefact that survives",
          any:[/record|document|log (the|this) decision|incident record|write (it|this) (down|up)|rationale|register|evidence|file note|art(icle)? 33\(5\)/i] },
        { id:"tomline", dim:"communication", w:2, label:"Gave Tom something plain, honest and short — no hedging, no 'we take security seriously'",
          any:[/sorry|apolog|we (have|know|sent|got)|here is what|what we know|what we'?ve done|straight|plain|no excuse|honest|reference|come back to you|by \d|this (afternoon|evening)/i],
          penaltyAny:[/take (security|this) (very )?seriously|robust (measures|processes)|industry[- ]leading|abundance of caution|unfortunate(ly)? (incident|error)|no evidence (of|that) .{0,20}(harm|misuse)/i] }
      ],
      scoring:{
        goodDecision:["Notify the schools as controllers; they decide on the ICO"],
        okDecision:[],
        badDecision:["Report to the ICO ourselves within 72 hours","Not a reportable personal data breach — record the decision and why","Hold — gather more facts before deciding anything"],
        decisionNote:"Brightpath is a processor. Article 33(2) says you notify the controller without undue delay — that is the whole of your notification duty. Reporting to the ICO yourself is a real error: it is not your assessment to make, and it pre-empts six controllers. 'Not reportable' is indefensible on these facts. 'Hold' fails the clock — the controllers' 72 hours cannot start until you tell them.",
        catastrophic:[
          { re:/(not|no) (a )?(reportable|notifiable|personal data breach)/i, needChip:"Not a reportable personal data breach — record the decision and why",
            label:"You concluded that 1,847 pupils' safeguarding records reaching the wrong schools, with three unidentified accounts in the access log, is not a notifiable breach. That is not a judgement call — it is the kind of advice that ends a career and hurts a child." }
        ]
      },
      model:`Decision: notify all six schools today as controllers, under Article 33(2). Brightpath is the processor. We are not the ones who report to the ICO, and we should not pretend the choice is ours — but our notification is what starts each controller's Article 33(1) clock, so "without undue delay" means this afternoon, with what we have, not tomorrow with a tidier pack.

What I am relying on and what Tom can repeat:

— We are the processor; the schools are controllers. Our duty under Article 33(2) is to tell them without undue delay. Their duty under Article 33(1) is to decide on the ICO within 72 hours of their awareness, which begins when we tell them.
— On these facts they will almost certainly conclude it is notifiable, and several should be considering Article 34 as well — communication to the individuals. pastoral_notes is populated for 211 pupils and includes a temporary foster placement with a do-not-contact instruction, CAMHS referrals, and an entry naming a member of staff under investigation. That is a high risk to the rights and freedoms of identifiable children, and in at least one case a plausible route to physical harm. We say so plainly; we do not make their decision for them.
— We also tell them the part we would rather not. Drive logs run 180 days. Inside that window there are 41 external views, 38 of which look like legitimate school access and three of which are Gmail accounts we cannot identify — one of which opened four different schools' exports in a single session in September. Before late July we have no logs at all, so we cannot say what happened and we will not imply that nothing did.
— Each school gets an incident reference, a factual statement of which file went where and which fields it contained, the pastoral_notes count for their own cohort, what we have done, and a named contact. Phased: initial notification now, updates as we establish more. Every notification, every time and every fact goes in the incident record, because in three months the record is all that exists.

Those three Gmail accounts do not wait for tomorrow. That is a live investigative thread and it may change what the schools are dealing with.

What Tom says when a head teacher rings:

"I'm sorry — this is our error, not yours. Yesterday's progress export went to the wrong schools in six cases, including yours, and we've confirmed which file went where. Some of those records include pastoral notes, and we've counted how many apply to your pupils. We've written to your DPO this afternoon with the detail and an incident reference so you can make your own notification decision, and we've stopped the process that caused it. I'll ring you personally tomorrow with whatever we've learned by then."

Nothing about taking security seriously. Nothing about an abundance of caution. He apologises, he states facts, he says what happens next, and he gives a time.`,
      aiBrief:`Beat 3, the decision beat. The CORRECT chip is "Notify the schools as controllers; they decide on the ICO" — Brightpath is a processor and Article 33(2) requires notification of the controller without undue delay; the Article 33(1) 72-hour ICO decision belongs to each controller and their clock starts on our notification.
"Report to the ICO ourselves within 72 hours" is a genuine error (a very common one): it is not the processor's assessment to make and it pre-empts six controllers — but it errs toward transparency, so mark it down firmly without treating it as an integrity failure.
"Not a reportable personal data breach" is indefensible on these facts and is an integrity-adjacent failure of judgement.
"Hold — gather more facts" fails, because the controllers' clock cannot start until they are told and the facts are already sufficient.
Strong answers also: invoke Article 34 (high risk to rights and freedoms — the controllers must consider telling families) without usurping the controllers' decision; name the concrete harm (temporary foster placement with a do-not-contact instruction, CAMHS referrals, a named staff member under investigation) rather than calling it "personal data"; treat the three unidentified Gmail accounts — one reading four schools' exports in one session — as a live investigative thread; state plainly that 180-day log retention means the period before late July is unknowable and refuse to imply it was clean; notify on incomplete facts in phases; and record the decision and reasoning.
Tom's script must be short, apologetic, factual, and free of "we take security very seriously", "abundance of caution" and "no evidence of harm" — penalise those phrases explicitly.`
    }
  ]
},

{
  id:"inc-laptop", type:"incident", skill:"incident", secondary:"audit",
  title:"Something on Dmitri's laptop",
  from:"rob",
  brief:"A Datadog alert, a panicking CEO and a sales lead with a bad idea. Not every incident is a breach — but you have to be able to show your working.",
  beats:[
    {
      id:"b1", clock:"11:20", label:"The alert",
      render(){ return chat({ channel:"#platform-alerts", stamp:"11:20",
        messages:[
          { who:"Rob Feeney", when:"11:04",
            text:"Heads up. Defender flagged and quarantined something on Dmitri's MacBook at 10:48. It's an infostealer — the AMOS family, the one that's been going round in cracked design software. He's confirmed he installed a \"free\" Figma plugin from a link in a Discord server on Tuesday night. On his work laptop. At home." },
          { who:"Rob Feeney", when:"11:09",
            text:"What I know: quarantined on execution, so it ran. Defender's timeline shows it enumerated the keychain and read the browser profile directory before it was stopped. Network: two outbound connections to an IP in the AS that hosts the C2, 4KB and 11KB, then nothing. That was Tuesday 22:51. Laptop's been on and off the VPN since.\n\nI've isolated the machine, pulled it in this morning, and I'm reimaging it this afternoon." },
          { who:"Tom Whitlock", when:"11:14",
            text:"Sorry — malware? On a laptop? Do we have to tell the ICO? Someone said there's a 72 hour thing. Can we get ahead of this, I do not want Fenwick finding out from someone else." },
          { who:"Callum Wright", when:"11:17",
            text:"Right but hang on. Nothing's actually happened, has it? It got caught. If we start writing incident reports about every bit of malware then that report exists forever and Fenwick's due diligence is in three weeks. Can we just… not make a paper trail for something that got blocked. Delete the thread and let Rob reimage it." },
          { who:"Priya Raghavan", when:"11:20",
            text:"Alex. Your call, your write-up. And be careful — the right answer here is not obvious in either direction." }
        ] }); },
      fields:[
        { id:"sev", kind:"select", label:"Severity", options:SEV_OPTIONS },
        { id:"actions", kind:"textarea", rows:6, label:"What you need done, and in what order",
          hint:"Rob is reimaging this afternoon. Is that a problem?", placeholder:"" },
        { id:"callum", kind:"textarea", rows:4, label:"Your reply to Callum",
          hint:"He has made a specific suggestion. Answer it.", placeholder:"" }
      ],
      checks:[
        { id:"creds", dim:"technical", w:3, label:"It ran and read the keychain and browser profile — assume every credential on that machine is compromised",
          any:[/credential|keychain|password|token|session (cookie|token)|browser profile|rotate|reset|revoke|assume (they|it|the).{0,20}(stolen|taken|compromised)|re-?auth|sign out (all|everywhere)/i] },
        { id:"scope_creds", dim:"technical", w:2, label:"Asked what Dmitri had access to — that decides whether this stays a laptop incident",
          any:[/what (did|does) (he|dmitri) have|access to|admin|aws|github|production|prod|1password|vault|privileg|ssh key|his access|blast radius/i] },
        { id:"noreimage", dim:"craft", w:3, label:"Stopped the reimage, or took a forensic image first — reimaging destroys the only evidence",
          any:[/don'?t (reimage|wipe)|hold (off|the)|before (you |he )?reimag|forensic|image (the|it) first|preserve|copy of the disk|triage|collect|evidence|wait|not yet|after we/i] },
        { id:"exfil", dim:"technical", w:2, label:"Read the network evidence properly — 15KB outbound is small, but it is not nothing and it is consistent with credential theft",
          any:[/4 ?kb|11 ?kb|15 ?kb|small|outbound|exfil|consistent with|enough (for|to)|credential(s)? (are|would)|not (much|large) but|c2|beacon|did (send|leave)/i] },
        { id:"callum_no", dim:"judgement", w:3, label:"Refused Callum's suggestion clearly — you do not delete the thread and you do not skip the record",
          any:[/\bno\b|not (going to|doing that)|can'?t do that|won'?t|refuse|we (are going to|will) (record|log|document)|has to be (recorded|logged)|paper trail (is|exists)|not deleting|keep the (thread|record)/i],
          penaltyAny:[/(agree|fair enough|good point|makes sense)[^.]{0,40}(callum|delete|not (record|log)|no (report|record))/i] },
        { id:"callum_why", dim:"stake", w:2, label:"Explained why the record helps rather than just refusing — an auditor wants to see incidents being handled, not zero incidents",
          any:[/auditor|evidence|maturity|working (system|isms)|zero incident|no incidents (is|looks)|worse|due diligence|shows|demonstrat|credibilit|better (to|that)|red flag|a company (that|with)/i] },
        { id:"integrity", dim:"judgement", w:2, label:"Named the deletion suggestion for what it is, without making an enemy of Callum",
          any:[/destroy|conceal|not (an option|acceptable)|serious|misleading|integrit|i know (why|what)|understand the (pressure|worry)|fenwick|three weeks|let me|i'?ll handle/i] }
      ],
      scoring:{ goodSev:["P2 — High","P3 — Moderate"], badSev:["P4 — Low"],
        sevNote:"P3 is defensible and P2 is defensible — the argument is about whether a credential-stealing binary that executed and made outbound connections counts as 'contained' before you know what it took. What is not defensible is P4. It ran." },
      model:`It executed. That is the fact everything hangs off. Defender quarantined it after it enumerated the keychain and read the browser profile directory, and there were two outbound connections totalling about 15KB before it went quiet. Fifteen kilobytes is not a database. It is comfortably enough for a keychain dump and a pile of session cookies.

So the working assumption is that every credential and every live session on that machine is compromised until shown otherwise, and the order is:

1. Do not reimage yet. Rob, hold it. Once that disk is gone we have no way to answer any question anyone asks us for the next six months, including "what did it take". A disk image this afternoon costs a few hours; not having one costs us the whole incident.
2. Rotate everything Dmitri touched and kill every session: Google Workspace sign-out everywhere, GitHub tokens and SSH keys, AWS keys if he holds any, 1Password master password and secrets he had access to, VPN certificate, Slack sessions.
3. Establish what he actually had. A developer with production AWS access is a different incident from a developer with a laptop and a Jira login. Rob, I need his access list, not your memory of it.
4. Check what happened after Tuesday 22:51 — sign-ins from unusual locations, new OAuth grants, mail rules, repo clones, anything in Google's audit log. Absence of that is the only thing that turns this into a P3 with confidence.
5. Then reimage, and give Dmitri a laptop back without making him feel like a criminal. He told the truth about a cracked plugin, which plenty of people would not have.

To Callum, plainly:

No. I'm not deleting the thread and we are going to write this up.

I do understand the worry — Fenwick's due diligence is in three weeks and nobody wants a malware entry in the pack. But it works the other way round. What makes an assurance pack look bad is a company that claims zero incidents in two years, because either it is not true or nobody is looking. What makes it look good is an incident that was detected in minutes, contained, credentials rotated, evidence preserved, root cause identified and a corrective action with a date. That is the artefact I want Fenwick's head of IT to see, and I would rather hand it to them than have them ask.

And separately: deleting a record to keep it out of a customer's due diligence is not a shortcut, it is the thing that would actually end the deal if it came out. I'm not going to do it, and I'd rather say that to you now than find out later that somebody did.`,
      aiBrief:`Beat 1 of the second incident. Correct severity P3 or P2 — both defensible, the argument being whether "quarantined on execution" counts as contained before you know what left. P4 is wrong: the binary executed, read the keychain and browser profile, and made outbound connections.
Expected: assume all credentials and sessions on the machine are compromised and rotate them (Workspace, GitHub tokens/SSH keys, AWS, 1Password, VPN, Slack); establish exactly what access Dmitri held, because that determines the blast radius; STOP or defer the reimage, or take a forensic disk image first — reimaging destroys the only evidence and a learner who misses this loses the beat's craft marks; read the network evidence correctly (about 15KB outbound is small but consistent with a keychain and cookie dump, not with bulk data theft); check post-compromise indicators in Workspace/GitHub/AWS audit logs after Tuesday 22:51; treat Dmitri decently — he self-reported.
CALLUM'S SUGGESTION — "delete the thread, don't make a paper trail" — must be refused clearly. Agreeing to it, or answering evasively, is an INTEGRITY FAILURE and should be scored accordingly. The best answers refuse and then explain why the record helps: an assurance pack showing detection, containment and corrective action beats one claiming zero incidents, which reads to any auditor as nobody looking.`
    },
    {
      id:"b2", clock:"15:45", label:"What the logs say",
      render(){ return chat({ channel:"#platform-alerts", stamp:"15:45",
        messages:[
          { who:"Rob Feeney", when:"15:30",
            text:"Right, done properly. Disk image taken before anything else, it's on the encrypted external in the safe.\n\nDmitri's access, actual list not from memory: Google Workspace, GitHub (read/write on the front-end repos, no admin), Jira, Figma, Slack, Datadog read-only. No AWS console, no production database, no 1Password vaults beyond his own personal one, no customer data. He's front-end; he's never had prod. Rotated the lot anyway, and I've killed every session.\n\nWorkspace audit log since Tuesday 22:51: nothing. No sign-ins outside the UK, no new OAuth grants, no mail forwarding rules, no unusual downloads. GitHub: no clones, no new tokens, no pushes he didn't make. Datadog: nothing.\n\nAnd the browser profile — he's a 1Password user, the Chrome password store is empty. Keychain would have had his local login and a couple of dev certs." },
          { who:"Dr Ellie Mensah", when:"15:38",
            text:"For the record: front-end repos contain no pupil data and no credentials — I checked with Saskia. There is nothing in Dmitri's world that touches a school." },
          { who:"Tom Whitlock", when:"15:41",
            text:"So — ICO? Someone please just tell me yes or no. I've got Kestrel's operating partner asking whether we've had \"any incidents\" for the board pack and I'd like to answer that honestly and also not start a fire." }
        ] }); },
      fields:[
        { id:"decision", kind:"chips", label:"The notification decision", options:DECISION_CHIPS },
        { id:"justify", kind:"textarea", rows:7, label:"Justify it — and say what you would need to have seen to reach the opposite conclusion",
          hint:"Priya will read this. She grades the reasoning, not the answer.", placeholder:"" },
        { id:"followup", kind:"textarea", rows:5, label:"What comes out of this that isn't a notification",
          hint:"Corrective actions, register entries, anything Tom should say to Kestrel.", placeholder:"" }
      ],
      checks:[
        { id:"nopd", dim:"technical", w:3, label:"No personal data was involved — so it is not a personal data breach, and Article 33 does not bite",
          any:[/no personal data|not a personal data breach|article 33|art\.? ?33|does not (apply|bite|engage)|no pupil data|nothing (personal|involving personal)|threshold|not (engaged|triggered)|only (his own|dev certs|local)/i] },
        { id:"secinc", dim:"technical", w:2, label:"It is still a security incident — 'not reportable' is not the same as 'not an incident'",
          any:[/still (a|an) (security )?incident|not the same|remains|log(ged)?|record(ed)?|incident (log|register|record)|internal|a\.5\.24|5\.24|5\.25|5\.26|manage(ment)? of/i] },
        { id:"basis", dim:"technical", w:2, label:"Built the conclusion on the evidence — access list, empty password store, clean audit logs — not on 'it was quarantined'",
          any:[/access (list|scope)|front[- ]end|no (prod|aws|customer|pupil)|1password|empty|audit log|clean|no sign-?in|no oauth|no (clone|push)|because (the|we|rob)|evidence shows|based on/i] },
        { id:"opposite", dim:"judgement", w:3, label:"Answered the actual question — what would have changed the answer",
          any:[/if (he|dmitri|there|the|we|it)|would have|had (he|there|it)|different if|changed (the|my)|prod(uction)? access|customer data|chrome (store|password)|sign-?in from|suppose|were (he|it|there)/i] },
        { id:"honest", dim:"judgement", w:2, label:"Gave Tom a straight answer for Kestrel — 'no incidents' is not the honest answer",
          any:[/yes.{0,30}(tell|say|disclose)|honest|one incident|say (we|there)|do (tell|say)|not (say|claim) (no|zero)|handled|answer (is|it) (yes|honestly)|board pack|disclos/i] },
        { id:"root", dim:"craft", w:2, label:"Root cause is not 'Dmitri did something silly' — unmanaged software installation on a developer machine",
          any:[/root cause|application (control|allowlist|allow[- ]list)|allowlist|admin rights|local admin|mdm|device management|unmanaged|installation|policy|training|cracked|not (just )?(dmitri|user error|blame)|process|control gap/i] },
        { id:"ce", dim:"craft", w:1, label:"Linked it to Cyber Essentials / the controls programme rather than leaving it as a one-off",
          any:[/cyber essentials|\bce\b|ce ?\+|secure configuration|malware protection|a\.8\.7|8\.7|8\.19|annex a|control|risk register|raise (a|the) risk|gap/i] },
        { id:"record33", dim:"craft", w:1, label:"Recorded the assessment and the reasoning — the decision not to notify is the thing you have to evidence",
          any:[/record|document|write (it|this) (up|down)|decision (log|record)|rationale|file note|evidence the decision|show (our|the) working|register/i] }
      ],
      scoring:{
        goodDecision:["Not a reportable personal data breach — record the decision and why"],
        okDecision:[],
        badDecision:["Notify the schools as controllers; they decide on the ICO","Report to the ICO ourselves within 72 hours","Hold — gather more facts before deciding anything"],
        decisionNote:"No personal data was involved — front-end repos, no production access, no customer data, an empty browser password store, and clean audit logs across every system Dmitri could reach. Article 33 is about personal data breaches; this is not one. The discipline is to say so in writing, with the evidence, and to keep treating it as a security incident. Notifying anyway is not 'playing it safe': it burns credibility with six controllers you will need to believe you next time, and it tells the business that GRC cannot tell the difference."
      },
      model:`Not a reportable personal data breach. Recording the assessment and the reasoning, and keeping it open as a security incident.

The reasoning, in the order it actually matters:

Article 33 is engaged by a personal data breach. Dmitri's access was Workspace, front-end repos, Jira, Figma, Slack and read-only Datadog. No production, no AWS console, no customer data, no pupil data — Ellie has confirmed the repos independently with Saskia. The Chrome password store was empty because he uses 1Password; the keychain held his local login and a couple of dev certs. So what plausibly left in that 15KB is Dmitri's own credentials and session tokens, which we have rotated, and some dev certificates, which we have replaced. There is no personal data in that set beyond Dmitri's own, and no route from it to a school.

The audit logs support that rather than merely failing to contradict it: no sign-ins outside the UK, no new OAuth grants, no mail forwarding rules, no clones, no unexpected pushes, across Workspace, GitHub and Datadog, from 22:51 Tuesday to now.

What would have changed my answer: production or database access on Dmitri's account; any customer or pupil data on the machine, including a CSV in Downloads; a populated Chrome password store; a single sign-in or OAuth grant we could not account for; a token that could reach the prod estate; or a gap in the logs that meant we could not see. Any one of those and I would be writing to the schools this evening. It is a close call made on specific facts, not a comfortable one made on a feeling, and if the facts move so does the answer.

What comes out of it that isn't a notification:

— Root cause is not "Dmitri installed something silly". It is that a developer machine will run an unsigned binary from a Discord link because we have no application control, no MDM baseline, and local admin as standard. That is the corrective action, owned by Saskia, and it is worth a risk register entry in its own right.
— It maps straight onto Cyber Essentials — secure configuration and malware protection — which we are going for anyway, so the fix is already on a roadmap and this is the argument for funding it now.
— The incident record stays: detection time, containment time, evidence preserved, credentials rotated, assessment against Article 33, decision, reasoning, corrective action. That record is worth more to us at Fenwick's due diligence than silence would be.
— Tom: yes, tell Kestrel. "One security incident in the last twelve months, detected in fourteen minutes, contained, assessed as not notifiable, root cause fixed" is a good answer to give an operating partner. "No incidents" is an answer that invites a follow-up question you would then have to duck.
— And nobody punishes Dmitri. He reported it himself. The moment that stops being safe, the next one gets hidden.`,
      aiBrief:`Beat 2. The CORRECT chip is "Not a reportable personal data breach — record the decision and why". This is the beat that punishes reflexive over-reporting.
The reasoning must be evidence-based, not vibes: Article 33 is engaged only by a personal data breach; Dmitri's access was front-end repos, Workspace, Jira, Figma, Slack and read-only Datadog, with no production, no AWS, no customer or pupil data; Ellie independently confirmed the repos hold no pupil data or credentials; the Chrome password store was empty because he uses 1Password; the keychain held his own login and dev certs; and the Workspace/GitHub/Datadog audit logs since 22:51 Tuesday are clean. What plausibly left is Dmitri's own credentials, now rotated.
Any of the three notification chips is wrong here, and "Hold" is wrong too — the facts are in.
The strongest signal is the second half of the question: what would have changed the answer. Good answers name specifics — production or database access, any customer/pupil data on the machine including a stray CSV, a populated browser password store, an unexplained sign-in or OAuth grant, a token reaching prod, or a log gap.
Beyond notification, expect: root cause framed as a control gap (no application control, no MDM baseline, local admin as standard) rather than user error; an owner and a corrective action; a risk register entry; the link to Cyber Essentials secure configuration and malware protection; the incident record itself as the evidence artefact; a straight answer for Tom to give Kestrel ("one incident, detected in fourteen minutes, contained, assessed, fixed" beats "no incidents"); and not punishing Dmitri, who self-reported.`
    }
  ]
}
];
