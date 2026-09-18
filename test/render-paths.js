const fs=require('fs'),vm=require('vm');
global.window={};
const store={};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
let HTML="";
const appEl={set innerHTML(v){HTML=v}, get innerHTML(){return HTML}};
global.document={addEventListener(){}, getElementById(id){return id==="app"?appEl:null}, activeElement:null};
global.AbortController=class{constructor(){this.signal={}}abort(){}};
vm.runInThisContext((()=>{const h=fs.readFileSync(__dirname+'/../index.html','utf8');return h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'))})());

function check(label){
  try{ render(); }catch(e){ console.log("FAIL",label,"::",e.message); return; }
  const bad=/undefined|\[object Object\]|NaN/.exec(HTML);
  console.log((bad?"WARN "+bad[0]:"ok   ").padEnd(10), label.padEnd(34), HTML.length+" chars");
}
S=newGame("Alex Osei");
check("onboarding");
["handbook","register","company","record","save"].forEach(v=>{S.ui.view=v;check("view:"+v)});
S.ui.view="day"; startDay(); check("briefing");
S.flow.phase="triage"; check("triage");
S.flow.order=currentPlan().inbox.map(i=>i.id); check("triage full");
BUSY={label:"Priya is reading your triage",ctl:{}}; check("triage busy"); BUSY=null;
["job","bridge","words","worked","marks"].forEach(k=>{S.ui.view="handbook";S.ui.hb=k;check("handbook:"+k)});
S.ui.view="day";

// walk every scenario / beat, rendering the task form
let n=0;
DAY_PLANS.forEach(plan=>{
  S.flow.planDay=plan.day;
  plan.tasks.forEach((tid,ti)=>{
    S.flow.taskIdx=ti; const sc=ALL_SCENARIOS[tid];
    const beats=sc.type==="incident"?sc.beats.length:1;
    for(let b=0;b<beats;b++){ S.flow.beatIdx=b; S.flow.phase="task"; check("task "+tid+" b"+(b+1)); S.settings.coached=false; check("task "+tid+" b"+(b+1)+" uncoached"); S.settings.coached=true; n++; }
  });
});
console.log("rendered",n,"task screens");

// review screens
S.flow.beatIdx=0; S.flow.taskIdx=0; S.flow.planDay=1;
const spec=specForCurrent();
const res=localGrade(spec,{statement:"Because the analytics account is shared there is a risk that pupil data including SEN and pastoral notes is read by people with no need, resulting in a notifiable breach for the schools and loss of the Fenwick contract.",likelihood:"4 Likely",impact:"4 Major",treatment:"Modify",owner:"Saskia Lindqvist — CTO",rationale:"Score 16 is above appetite so we modify. Saskia owns the platform and can authorise the change within 10 working days."},ctxFor(spec));
res.title=spec.title; res.model=spec.model; res.npcFrom=spec.from; res.gained=99; res.nextLabel="Next task";
LAST_RESULT=res; S.flow.phase="taskReview"; check("taskReview (mid answer "+JSON.stringify(res.dims)+")");
LAST_RESULT={refused:true,reason:"Nothing submitted.",hints:["Look again."]}; check("taskReview refused");
S.flow.phase="debrief"; check("debrief pending");
S.flow.results=[{taskId:"x",title:"Morning triage",dims:{technical:3,judgement:4,communication:3,craft:2},hits:["a"],misses:["b"]}];
S.flow.debrief={text:"Right. Two pieces of work.\n\nWatch this: dates.",source:"local"}; check("debrief done");
S.flow.phase="dayEnd"; check("dayEnd"); S.day=4; check("dayEnd week done");
console.log("\nfallback debrief:\n"+debriefFallback().slice(0,300));
