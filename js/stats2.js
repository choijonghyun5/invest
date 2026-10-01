/* ===== monthly record & achievements ===== */
function monthView(){const M={},k=t=>{const d=new Date(t);return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')},g=t=>M[k(t)]=M[k(t)]||{inc:0,int:0,dv:0,end:0};
 S.hist.forEach(h=>g(h.t).end=h.v);g(Date.now()).end=total();
 S.study.forEach(x=>g(x.t).inc+=x.base+x.bonus);S.tx.filter(t=>t.ty==='interest').forEach(t=>g(t.t).int+=t.a);S.tx.filter(t=>t.ty==='div').forEach(t=>g(t.t).dv+=t.a);
 const K=Object.keys(M).sort(),rows=K.map((m,i)=>{const pv=i?M[K[i-1]].end:S.start;return{m,...M[m],pv,r:(M[m].end/pv-1)*100}}).slice(-4).reverse();
 return`<div class="lab">월별 기록 <span style="font-weight:400">· 월말 자산(백만원)</span></div><div class="card" style="margin-bottom:12px">${bars(rows.slice().reverse().map(r=>r.end/1e6),rows.slice().reverse().map(r=>r.m.slice(5)+"월"),rows.length-1,false)}</div><div class="card">${rows.map(r=>`<div class="row"><div><b>${r.m}</b><div class="sub">공부 ${sg(r.inc)} · 이자 ${sg(r.int)} · 배당 ${sg(r.dv)}</div></div><div style="text-align:right"><b>${won(r.end)}</b><div class="${cl(r.r)}" style="font-size:13px">${pc(r.r)}</div></div></div>`).join('')}</div>`}
/* 종목 목록: 종류별 그룹 · 상승 빨강 / 하락 파랑 */
const LG=[['주식',['kr','us']],['ETF',['etf']],['채권',['bond']],['금 · 은',['gold','silver']],['코인',['coin']]];
const chg=a=>a.o>0?(a.p/a.o-1)*100:0,dirc=c=>Math.abs(c)<.005?'':c>0?'rise':'fall';
function mrow(a){const c=chg(a),k=dirc(c);return`<div class="row tap" onclick="openDetail('${a.id}')"><div><b>${a.n}</b><div class="sub">${KIND[a.k]||'기타'} · ${a.id}</div></div><div><b class="${k}">${a.usd?'$'+(a.p/FX).toFixed(2):won(a.p)}</b><div class="${k}" style="font-size:13px">${k?(c>0?'▲ ':'▼ '):''}${Math.abs(c).toFixed(2)}%</div></div></div>`}
function list(){const s=q.trim().toLowerCase(),L=ASSETS.filter(a=>!a.hide&&(!s||a.n.toLowerCase().includes(s)||a.id.toLowerCase().includes(s))),el=document.getElementById('ml');if(!el)return;
 const used=LG.flatMap(g=>g[1]),G=[...LG,['기타',[...new Set(L.filter(a=>!used.includes(a.k)).map(a=>a.k))]]];
 const html=G.map(([t,ks])=>{const rows=L.filter(a=>ks.includes(a.k)).map(mrow).join('')+(ks.includes('bond')&&window.bondRows?bondRows(s,1):'');return rows?`<div class="lab" style="margin:18px 0 8px">${t}</div><div class="card">${rows}</div>`:''}).join('');
 el.innerHTML=html||'<div class="sub">검색 결과가 없습니다</div>'}
