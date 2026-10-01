/* ===== monthly record & achievements ===== */
function monthView(){const M={},k=t=>{const d=new Date(t);return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')},g=t=>M[k(t)]=M[k(t)]||{inc:0,int:0,end:0};
 S.hist.forEach(h=>g(h.t).end=h.v);g(Date.now()).end=total();
 S.study.forEach(x=>g(x.t).inc+=x.base+x.bonus);S.tx.filter(t=>t.ty==='interest').forEach(t=>g(t.t).int+=t.a);
 const K=Object.keys(M).sort(),rows=K.map((m,i)=>{const pv=i?M[K[i-1]].end:S.start;return{m,...M[m],pv,r:(M[m].end/pv-1)*100}}).slice(-4).reverse();
 return`<div class="lab">월별 기록 <span style="font-weight:400">· 월말 자산(백만원)</span></div><div class="card" style="margin-bottom:12px">${bars(rows.slice().reverse().map(r=>r.end/1e6),rows.slice().reverse().map(r=>r.m.slice(5)+"월"),rows.length-1,false)}</div><div class="card">${rows.map(r=>`<div class="row"><div><b>${r.m}</b><div class="sub">공부 ${sg(r.inc)} · 이자 ${sg(r.int)}</div></div><div style="text-align:right"><b>${won(r.end)}</b><div class="${cl(r.r)}" style="font-size:13px">${pc(r.r)}</div></div></div>`).join('')}</div>`}
function achView(){const hrs=S.study.reduce((x,s)=>x+s.sec,0)/3600,T=total(),inv=['kr','us','etf','gold','silver','coin','bond'];
 const L=[['첫 투자',Object.keys(S.hold).length>0||S.tx.some(t=>inv.includes(t.ty)&&t.a<0)],['10시간 공부',hrs>=10],['100시간 공부',hrs>=100],['첫 이자',S.tx.some(t=>t.ty==='interest')],['첫 흑자',T>S.start],['100만원 자산',T>=1e6],['1,000만원 자산',T>=1e7]];
 return`<div class="lab">성취 ${L.filter(x=>x[1]).length}/${L.length}</div><div class="card">${L.map(([n,o])=>`<div class="row"><span style="color:${o?'var(--ink)':'var(--faint)'}">${n}</span><b>${o?'✓':''}</b></div>`).join('')}</div>`}
function list(){const s=q.trim().toLowerCase(),L=ASSETS.filter(a=>!s||a.n.toLowerCase().includes(s)||a.id.toLowerCase().includes(s));
 const el=document.getElementById('ml');if(el)el.innerHTML=L.map(a=>`<div class="row tap" onclick="openDetail('${a.id}')"><div><b>${a.n}</b><div class="sub">${KIND[a.k]} · ${a.id}</div></div><b>${a.usd?'$'+(a.p/FX).toFixed(2):won(a.p)}</b></div>`).join('')||'<div class="sub">검색 결과가 없습니다</div>'}
