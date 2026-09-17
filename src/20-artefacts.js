/* ============================================================
   Artefact renderers — the in-fiction documents.
   ============================================================ */
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function para(t){ return String(t).split("\n\n").map(p => "<p>"+p.replace(/\n/g,"<br>")+"</p>").join(""); }

function sheet(kind, right, body){
  return `<div class="sheet"><div class="sheet-hd"><span class="t">${esc(kind)}</span>${right?`<span class="t">${esc(right)}</span>`:""}</div><div class="sheet-bd">${body}</div></div>`;
}
function metaBlock(pairs){
  return `<dl class="meta">${pairs.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("")}</dl>`;
}
function email(o){
  return sheet(o.kind||"Email", o.stamp||"", metaBlock([
    ["From", esc(o.from)], ["To", esc(o.to)]
  ].concat(o.cc?[["Cc",esc(o.cc)]]:[]).concat([["Sent", esc(o.sent)],["Subject","<strong>"+esc(o.subject)+"</strong>"]])) + para(o.body));
}
function thread(o){
  const msgs = o.messages.map(m => `<div class="msg"><div class="who">${esc(m.who)}</div><div class="when">${esc(m.when)}</div>${para(m.text)}</div>`).join("");
  return sheet(o.kind||"Email thread", o.stamp||"", metaBlock([["Subject","<strong>"+esc(o.subject)+"</strong>"],["Participants", esc(o.people)]]) + msgs);
}
function chat(o){
  const msgs = o.messages.map(m => `<div class="msg"><div class="who">${esc(m.who)}</div><div class="when">${esc(m.when)}</div>${para(m.text)}</div>`).join("");
  return sheet(o.kind||"Slack — "+(o.channel||"#general"), o.stamp||"", msgs);
}
function tableSheet(kind, right, intro, headers, rows){
  return sheet(kind, right, (intro?para(intro):"") +
    `<div class="scroller"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${
      rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
}
function qaSheet(kind, right, intro, pairs){
  return sheet(kind, right, (intro?para(intro):"") + `<dl class="qa">${pairs.map(([q,a])=>`<dt>${esc(q)}</dt><dd>${para(esc(a))}</dd>`).join("")}</dl>`);
}
function docSheet(kind, right, title, kv, body){
  return sheet(kind, right, `<p style="font-size:19px;font-weight:600;font-family:var(--sans);margin-bottom:10px">${esc(title)}</p>` +
    metaBlock(kv) + para(body));
}
