/* ===== calc ===== */
const price=id=>A(id).p;
const holdVal=()=>Object.entries(S.hold).reduce((s,[id,h])=>s+h.q*price(id),0);
const total=()=>S.cash+holdVal()+bankVal();
const cost=()=>Object.values(S.hold).reduce((s,h)=>s+h.q*h.c,0);
const won=n=>(n<0?'-':'')+'₩'+Math.round(Math.abs(n)).toLocaleString('ko-KR');
const sg=n=>(n>=0?'+':'-')+'₩'+Math.round(Math.abs(n)).toLocaleString('ko-KR');
const pc=n=>(n>=0?'+':'')+n.toFixed(2)+'%';const cl=n=>n>=0?'up':'dn';
const hm=s=>Math.floor(s/3600)+'시간 '+Math.floor(s%3600/60)+'분';
const sameDay=(a,b)=>new Date(a).toDateString()===new Date(b).toDateString();
function snap(){S.hist.push({t:Date.now(),v:total()});if(S.hist.length>400)S.hist.shift();save()}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2200)}
function addTx(ty,m,a){S.tx.unshift({t:Date.now(),ty,m,a})}
