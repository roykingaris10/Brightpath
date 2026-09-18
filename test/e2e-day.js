const {chromium}=require('playwright');
const RISK="Because Metabase access to the production replica is granted through a single shared credential (analytics@brightpath.io) with no MFA and no record of who holds it, there is a risk that staff and former contractors with no legitimate need read identifiable pupil records including SEN flags and free-text pastoral notes, resulting in a notifiable breach for the schools as controllers, harm to a child, and loss of the Fenwick contract. Likelihood 4 because the credential is already circulating and a fifth person asked for it this morning. Impact 4 because this is safeguarding-adjacent data about children. Score 16 is above appetite so we modify within 10 working days, not retain. Saskia owns the data platform and can authorise the change; Rob caused it and is not on the ELT. Least privilege applies, A.5.15 and A.8.3.";
const SUP="The certificate is for ISO/IEC 27001:2013, a withdrawn edition, it expired on 13 March 2025, its scope covers marketing and office support at the London office rather than the modelling service, and GlobalCert Assurance shows no UKAS accreditation. Q4 says no sub-processors but Q9 names a development partner in Bengaluru, which is an undisclosed sub-processor and an international transfer needing an IDTA and a transfer risk assessment plus the schools' authorisation under Article 28(2). Q10 admits they train their own models on our data under clause 9.3. Q12 refuses our DPA; Article 28(3) terms are mandatory. No pupil data moves until a signed DPA with clause 9.3 struck, sub-processors disclosed, and real assurance of the actual service. Owner Nadia, gate before the PO. Nadia and Ellie, I can't sign this off and the six-week date is at risk; there is a version that ships on time with a pseudonymised extract without SEN and FSM.";
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const p=await (await b.newContext()).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const step=async(l)=>{await p.waitForTimeout(250);console.log(l.padEnd(30),'→',(await p.textContent('.main')).replace(/\s+/g,' ').slice(0,72).trim())};

  await p.goto('file:///home/user/Brightpath/index.html'); await p.waitForTimeout(800);
  await step('load');
  await p.click('[data-act="begin"]');            await step('begin');
  await p.click('[data-act="toTriage"]');         await step('inbox');
  for(let i=0;i<7;i++){
    const bs=await p.$$('[data-act="pick"]');
    let clicked=false;
    for(const btn of bs){ if((await btn.textContent()).trim()==='Next'){ await btn.click(); clicked=true; break; } }
    if(!clicked) break;
    await p.waitForTimeout(60);
  }
  await p.fill('#triageJustify',"I've ordered by consequence and decay rather than volume. Priya's thread is first because Callum asked for the shared credential at 08:04 this morning and that is a live exposure I can stop in ten minutes; the register entry itself is due at 6pm. The Workspace sharing digest looks like noise and is the quietest thing here. Nadia has held a PO for three weeks. Bex takes four minutes and unblocks a colleague. Callum's 4pm is manufactured — Fenwick asked for Friday. If the day goes wrong I drop the Jira template.");
  await p.click('[data-act="submitTriage"]');     await step('triage submitted');
  await p.click('[data-act="continue"]');         await step('continue to task 1');

  // task 1
  await p.fill('textarea[data-fid="statement"]',RISK);
  await p.selectOption('select[data-fid="likelihood"]','4 Likely');
  await p.selectOption('select[data-fid="impact"]','4 Major');
  await p.selectOption('select[data-fid="treatment"]','Modify');
  await p.selectOption('select[data-fid="owner"]','Saskia Lindqvist — CTO');
  await p.fill('textarea[data-fid="rationale"]',"Score 16 is above Brightpath's appetite so Modify within 30 days. Saskia owns the data platform and can authorise the engineering change; Rob caused it and is not on the ELT. First step within 10 working days: kill the shared account, named SSO access, mask pastoral_notes, demo dataset for sales.");
  await p.click('[data-act="submitTask"]');       await step('task 1 marked');

  // THE BUG: reload mid-review
  await p.reload(); await p.waitForTimeout(900);
  await step('RELOAD mid-review');
  const stillThere = (await p.textContent('.main')).includes('Marked');
  console.log('  >> review survived reload:', stillThere);

  await p.click('[data-act="continue"]');         await step('continue to task 2');
  await p.fill('textarea[data-fid="findings"]',SUP);
  await p.fill('textarea[data-fid="conditions"]',"Signed DPA with Article 28(3) terms and clause 9.3 struck; sub-processors disclosed with an IDTA and TRA; scoped in-date UKAS-accredited assurance of the modelling service. Owner Nadia, all before the PO is released.");
  await p.fill('textarea[data-fid="note"]',"Nadia, Ellie — I can't approve Lumen on this pack. The certificate expired in March 2025 and covers marketing services, not modelling, and the questionnaire contradicts itself on sub-processors. The six-week release date is at risk and I'd rather say that today than in week five.");
  await p.selectOption('select[data-fid="tier"]','Critical');
  await p.click('.chip[data-v="Decline — do not proceed"]'); await p.waitForTimeout(150);
  await p.click('[data-act="submitTask"]');       await step('task 2 marked');
  await p.click('[data-act="continue"]');         await step('debrief');
  await p.waitForTimeout(600);
  await p.click('[data-act="closeDay"]');         await step('day end');
  const xp=await p.evaluate(()=>({xp:S.xp,cv:S.cv.length,day:S.day,integrity:S.integrity}));
  console.log('  >> state:',JSON.stringify(xp));
  await p.click('[data-act="nextDay"]');          await step('day 2 briefing');
  await p.reload(); await p.waitForTimeout(900);  await step('RELOAD on day 2');
  console.log('\npage errors:',errs.length?errs:'none');
  await b.close();
})();
