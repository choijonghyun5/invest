/* ===== calc ===== */
const price=id=>A(id).p;
const holdVal=()=>Object.entries(S.hold).reduce((s,[id,h])=>s+h.q*price(id),0);
const loanBal=()=>(S.loans||[]).reduce((s,l)=>s+l.bal,0);
const total=()=>S.cash+holdVal()+bankVal()-loanBal(); // 순자산 = 자산 − 대출 잔액
const cost=()=>Object.values(S.hold).reduce((s,h)=>s+h.q*h.c,0);
const won=n=>(n<0?'-':'')+'₩'+Math.round(Math.abs(n)).toLocaleString('ko-KR');
const sg=n=>(n>=0?'+':'-')+'₩'+Math.round(Math.abs(n)).toLocaleString('ko-KR');
const pc=n=>(n>=0?'+':'')+n.toFixed(2)+'%';const cl=n=>n>=0?'up':'dn';
const hm=s=>Math.floor(s/3600)+'시간 '+Math.floor(s%3600/60)+'분';
const sameDay=(a,b)=>new Date(a).toDateString()===new Date(b).toDateString();
function compactHist(){const n=Date.now(),R=36e5*36,o=[];let k='';
 for(const h of S.hist){const key=n-h.t>R?'d'+new Date(h.t).toDateString():'m'+Math.floor(h.t/6e5);if(o.length&&k===key)o[o.length-1]=h;else{o.push(h);k=key}}
 S.hist=o.length>1500?o.slice(-1500):o}
function histP(){const c=Date.now()-period*864e5,H=S.hist.filter(x=>x.t>=c);return H.length>=2?H:S.hist.slice(-2)}
function snap(){S.hist.push({t:Date.now(),v:total()});compactHist();save()}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2200)}
function addTx(ty,m,a){S.tx.unshift({t:Date.now(),ty,m,a})}
