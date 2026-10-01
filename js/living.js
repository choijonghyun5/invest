/* ===== 생활비 청구서 · 대출 =====
   - 보통/어려움: 서울 자취 생활비가 30일마다 청구서로 발행됩니다. 사용자가 직접 '납부' 버튼을 눌러야 현금에서 빠져나갑니다.
   - 납부 기한(발행 후 7일)을 넘기면 청구액의 LATE(3%)가 연체료로 한 번 붙습니다.
   - 대출: 실행하면 현금이 늘고 같은 금액만큼 대출 잔액(부채)이 생겨 순자산(total)은 그대로입니다.
     원리금은 30일마다 청구서로 발행되고 직접 납부합니다. 이자·연체료만 순자산을 줄입니다. */
const livQ=()=>DIFF[S.diff]||DIFF.normal,
 SEA={e:[1.1,1,.9,.9,1,1.2,1.5,1.6,1.2,.9,.9,1.1],g:[2.2,2,1.4,.8,.5,.4,.4,.4,.5,.8,1.4,2]},
 md=t=>new Date(t).toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'}),
 man=n=>n>=1e4&&n%1e4===0?(n/1e4).toLocaleString('ko-KR')+'만원':won(n),
 billSum=b=>b.amt+(b.late||0),
 nid=()=>S.bseq=(S.bseq||0)+1;
function livInit(){S.bills=S.bills||[];S.loans=S.loans||[];if(livQ().bills&&!S.liv)S.liv={next:Date.now()+30*DAY}}
const billsDue=()=>(S.bills||[]).length>0;
const lvMonth=()=>S.tx.filter(t=>(t.ty==='living'||t.ty==='loanint')&&inM(t.t,0)).reduce((s,t)=>s+t.a,0);

/* ---- 상환 일정 (원리금균등 'amort' / 만기일시 'bullet'), 원 단위 정수 ---- */
function amort(P,r,n,meth){const a=[];let b=P;
 if(meth==='bullet'){for(let i=1;i<=n;i++)a.push({p:i===n?P:0,i:Math.round(P*r)});return a}
 const pay=r>0?P*r/(1-Math.pow(1+r,-n)):P/n;
 for(let i=1;i<=n;i++){const it=Math.round(b*r),pr=i===n?b:Math.min(b,Math.round(pay-it));a.push({p:pr,i:it});b-=pr}
 return a}
const loanMax=()=>Math.min(3e7,Math.floor(Math.max(0,total()-loanBal())/1e4)*1e4); // 총 대출 잔액 ≤ 순자산

/* ---- 청구서 발행 ---- */
function billItems(t){const m=new Date(t).getMonth();return livQ().bills.map(([n,a,s])=>[n,Math.round(a*(s?SEA[s][m]:1)/100)*100])}
const dueOf=t=>Math.max(t+7*DAY,Date.now()+2*DAY); // 오래 접속하지 않았어도 발견 후 최소 2일은 여유
function issueLiving(t){const it=billItems(t),amt=it.reduce((s,x)=>s+x[1],0),d=new Date(t);
 S.bills.push({id:nid(),t,due:dueOf(t),ty:'living',m:d.getFullYear()+'년 '+(d.getMonth()+1)+'월 생활비',items:it,amt,late:0});
 note('생활비 청구서 '+won(amt)+' · 납부 기한 '+md(dueOf(t)))}
function issueLoan(l){const s=l.sch[l.k];l.k++;const t=l.next;l.next+=30*DAY;
 S.bills.push({id:nid(),t,due:dueOf(t),ty:'loan',loan:l.id,m:l.name+' '+l.k+'/'+l.n+'회차',items:[['원금',s.p],['이자',s.i]].filter(x=>x[1]>0),amt:s.p+s.i,p:s.p,i:s.i,late:0});
 note('대출 상환 청구서 '+won(s.p+s.i)+' · 납부 기한 '+md(dueOf(t)))}
function livProcess(){livInit();const n=Date.now();let ch=0;
 if(S.liv){let c=0;while(n>=S.liv.next&&c<6){issueLiving(S.liv.next);S.liv.next+=30*DAY;c++;ch=1}}
 S.loans.forEach(l=>{let c=0;while(l.k<l.n&&n>=l.next&&c<6){issueLoan(l);c++;ch=1}});
 S.bills.forEach(b=>{if(!b.late&&n>b.due){b.late=Math.round(b.amt*LATE);note('연체료 '+won(b.late)+' 부과 · '+b.m);ch=1}});
 if(ch){save();if(!document.getElementById('m').innerHTML&&!['game','market','detail'].includes(tab)&&typeof render==='function')render()}}
const _livPB=processBank;processBank=function(){_livPB();livProcess()};

/* ---- 납부 ---- */
function payCore(b){const T=billSum(b);if(T>S.cash)return false;S.cash-=T;
 if(b.ty==='living')addTx('living',b.m+' 납부',-T);
 else{const l=S.loans.find(x=>x.id===b.loan);if(b.p>0)addTx('loan',b.m+' 원금 상환',-b.p);const ex=b.i+(b.late||0);if(ex>0)addTx('loanint',b.m+(b.late?' 이자 · 연체료':' 이자'),-ex);
  if(l){l.bal=Math.max(0,l.bal-b.p);S.bills=S.bills.filter(x=>x!==b);if(l.k>=l.n&&l.bal<=0&&!S.bills.some(x=>x.loan===l.id)){S.loans=S.loans.filter(x=>x!==l);note('대출을 모두 상환했습니다 · '+l.name)}}}
 S.bills=S.bills.filter(x=>x!==b);return true}
function payBill(id){const b=S.bills.find(x=>x.id===id);if(!b)return;if(!payCore(b))return toast('현금이 부족합니다 (필요 '+won(billSum(b))+')');snap();toast('납부 완료');render()}
function payAll(){let c=0,fail=0;for(const b of S.bills.slice().sort((a,b)=>a.due-b.due)){if(payCore(b))c++;else{fail=1;break}}
 if(c)snap();toast(fail?(c?c+'건 납부 · 나머지는 현금이 부족합니다':'현금이 부족합니다'):c+'건 납부 완료');render()}

/* ---- 화면: 청구서 ---- */
function billsView(){livInit();const Q=livQ(),B=S.bills;if(!Q.bills&&!B.length)return'';
 const tot=B.reduce((s,b)=>s+billSum(b),0),mon=Q.bills?Q.bills.reduce((s,x)=>s+x[1],0):0,row=(l,v,c)=>`<div class="row" style="padding:3px 0;border:0"><span class="sub">${l}</span><span class="${c||''}" style="font-size:14px">${v}</span></div>`;
 return`<div class="lab">생활비 · 청구서</div><div class="card"><div class="sub" style="line-height:1.6">${Q.bills?`서울 자취 기준 월 약 ${won(mon)} (월세·관리비·공과금·통신·식비·교통). 30일마다 청구되고, 납부 기한(7일)이 지나면 연체료 ${Math.round(LATE*100)}%가 붙습니다.${S.liv?' 다음 청구일 '+md(S.liv.next)+'.':''}`:'대출 상환 청구서가 여기에 표시됩니다.'}</div>
 ${B.length?B.slice().sort((a,b)=>a.due-b.due).map(b=>{const od=Date.now()>b.due;return`<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:baseline"><b>${b.m}</b><b>${won(billSum(b))}</b></div><div style="margin:6px 0 10px">${b.items.map(x=>row(x[0],won(x[1]))).join('')}${b.late?row('연체료',won(b.late),'rise'):''}${row('납부 기한',md(b.due)+(od?' · 기한 지남':''),od?'rise':'')}</div><button class="btn w" onclick="payBill(${b.id})">납부하기 ${won(billSum(b))}</button></div>`}).join('')+(B.length>1?`<button class="btn s w" style="margin-top:10px" onclick="payAll()">전체 납부 (${won(tot)})</button>`:'')
 :'<div class="sub" style="margin-top:12px">미납 청구서가 없습니다</div>'}<div class="sub" style="margin-top:10px">보유 현금 ${won(S.cash)}</div></div>`}

/* ---- 화면: 대출 ---- */
function loanView(){livInit();const L=S.loans,Q=livQ();
 return`<div class="lab">대출</div><div class="card"><div class="sub" style="line-height:1.6">연 ${(Q.loan*100).toFixed(1)}% 고정금리 · 총 대출 잔액은 순자산을 넘을 수 없습니다 (지금 받을 수 있는 한도 ${won(loanMax())}). 원리금은 30일마다 청구서로 발행되며 직접 납부합니다.</div>
 ${L.map(l=>`<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:baseline"><b>${l.name}</b><b>${won(l.bal)}</b></div><div class="sub" style="margin:4px 0 10px;line-height:1.6">${l.n}개월 · ${l.meth==='bullet'?'만기일시상환':'원리금균등상환'} · 연 ${(l.rate*100).toFixed(1)}%<br>${l.k}/${l.n}회 청구${l.k<l.n?' · 다음 청구일 '+md(l.next):' · 청구 완료'}</div><button class="btn s w" onclick="openPrepay(${l.id})">중도 상환</button></div>`).join('')}
 <button class="btn w" style="margin-top:14px" onclick="openLoan()">대출 받기</button></div>`}

/* ---- 대출 실행 ---- */
let lmeth='amort';
function lget(){return{amt:Math.floor(+document.getElementById('la').value||0),n:Math.max(1,Math.min(60,Math.floor(+document.getElementById('lmo').value)||0)),meth:lmeth}}
function lpick(m){lmeth=m;document.querySelectorAll('#lseg button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));lcalc()}
function lcalc(){const{amt,n,meth}=lget(),Q=livQ(),mx=loanMax(),el=document.getElementById('lc');if(!el)return;
 const row=(l,v,c)=>`<div class="row" style="padding:2px 0;border:0"><span>${l}</span><b class="${c||''}">${v}</b></div>`;
 if(!(amt>0)){el.innerHTML=row('대출 가능 한도',won(mx));return}
 const s=amort(amt,Q.loan/12,n,meth),ti=s.reduce((x,y)=>x+y.i,0);
 el.innerHTML=row('연 이자율',(Q.loan*100).toFixed(1)+'%')+(meth==='bullet'?row('매월 이자',won(s[0].i))+row('만기 시 원금',won(amt)):row('매월 상환액',won(s[0].p+s[0].i)))+row('총 이자',won(ti))+row('최종 상환일',new Date(Date.now()+n*30*DAY).toLocaleDateString('ko-KR'))+row('대출 가능 한도',won(mx),amt>mx?'rise':'')+(amt>mx?'<div class="rise" style="margin-top:4px">한도를 넘었습니다</div>':amt<1e5?'<div class="rise" style="margin-top:4px">최소 대출 금액은 10만원입니다</div>':'')}
function openLoan(){lmeth='amort';const mx=loanMax(),Q=livQ();
 sheet(`${shead('대출 받기',true)}<div class="sub" style="margin:4px 0 0;line-height:1.6">연 ${(Q.loan*100).toFixed(1)}% 고정금리 · 대출금은 바로 현금으로 들어오고, 원리금은 청구서로 발행됩니다.</div>
 <div class="sub" style="margin-top:14px">대출 금액 (원)</div><input id="la" type="number" inputmode="numeric" value="${Math.min(mx,1e6)||''}" oninput="lcalc()"><div class="chg"><button class="btn s" onclick="document.getElementById('la').value=Math.min(${mx},1e6);lcalc()">100만</button><button class="btn s" onclick="document.getElementById('la').value=Math.min(${mx},3e6);lcalc()">300만</button><button class="btn s" onclick="document.getElementById('la').value=${mx};lcalc()">최대</button></div>
 <div class="sub" style="margin-top:6px">기간 (개월, 1~60)</div><input id="lmo" type="number" inputmode="numeric" value="12" oninput="lcalc()">
 <div class="seg" id="lseg" style="margin:12px 0 0"><button class="on" data-m="amort" onclick="lpick('amort')">원리금균등</button><button data-m="bullet" onclick="lpick('bullet')">만기일시</button></div>
 <div id="lc" class="sub" style="margin:14px 0 16px;line-height:1.9"></div><button class="btn w" onclick="takeLoan()">대출 실행</button>`);lcalc()}
function takeLoan(){const{amt,n,meth}=lget(),Q=livQ(),mx=loanMax();
 if(amt<1e5)return toast('최소 대출 금액은 10만원입니다');if(amt>mx)return toast('대출 한도를 넘었습니다 (한도 '+won(mx)+')');
 const id=nid(),l={id,name:'대출 '+man(amt),amt,bal:amt,n,k:0,meth,rate:Q.loan,r:Q.loan/12,sch:amort(amt,Q.loan/12,n,meth),next:Date.now()+30*DAY,start:Date.now()};
 S.loans.push(l);S.cash+=amt;addTx('loan','대출 실행 '+won(amt),amt);snap();closeM();note('대출 실행 '+won(amt)+' · 첫 청구일 '+md(l.next));render()}

/* ---- 중도 상환 (수수료 없음, 경과이자만 정산) ---- */
const loanAccr=l=>Math.round(l.bal*l.r*Math.min(1,Math.max(0,(Date.now()-(l.next-30*DAY))/(30*DAY))));
function openPrepay(id){const l=S.loans.find(x=>x.id===id);if(!l)return;
 if(S.bills.some(b=>b.loan===id))return toast('먼저 미납 청구서를 납부해 주세요');
 sheet(`${shead('중도 상환',true)}<div class="sub" style="margin:4px 0 12px">${l.name} · 남은 원금 ${won(l.bal)}</div><div class="sub">상환할 원금 (원)</div><input id="pa" type="number" inputmode="numeric" value="${l.bal}" oninput="pcalc(${id})"><div class="chg"><button class="btn s" onclick="document.getElementById('pa').value=${l.bal};pcalc(${id})">전액</button><button class="btn s" onclick="document.getElementById('pa').value=Math.min(${l.bal},Math.floor(${S.cash}));pcalc(${id})">가능한 만큼</button></div><div id="pc" class="sub" style="margin:10px 0 16px;line-height:1.9"></div><button class="btn w" onclick="prepay(${id})">상환하기</button>`);pcalc(id)}
function pcalc(id){const l=S.loans.find(x=>x.id===id),el=document.getElementById('pc');if(!l||!el)return;const x=Math.min(l.bal,Math.max(0,Math.floor(+document.getElementById('pa').value||0))),a=loanAccr(l),t=x+a;
 const row=(k,v,c)=>`<div class="row" style="padding:2px 0;border:0"><span>${k}</span><b class="${c||''}">${v}</b></div>`;
 el.innerHTML=row('원금',won(x))+row('경과 이자',won(a))+row('총 필요 금액',won(t),t>S.cash?'rise':'')+row('상환 후 보유 현금',won(S.cash-t),t>S.cash?'rise':'')+(t>S.cash?'<div class="rise" style="margin-top:4px">현금이 부족합니다</div>':'')}
function prepay(id){const l=S.loans.find(x=>x.id===id);if(!l)return;const x=Math.min(l.bal,Math.floor(+document.getElementById('pa').value||0));if(!(x>0))return toast('상환할 금액을 입력하세요');
 const a=loanAccr(l);if(x+a>S.cash)return toast('현금이 부족합니다 (필요 '+won(x+a)+')');
 S.cash-=x+a;addTx('loan','대출 중도 상환 '+l.name,-x);if(a>0)addTx('loanint','대출 경과이자 '+l.name,-a);
 if(x>=l.bal){S.loans=S.loans.filter(y=>y!==l);note('대출을 모두 상환했습니다 · '+l.name)}
 else{l.bal-=x;l.sch=l.sch.slice(0,l.k).concat(amort(l.bal,l.r,l.n-l.k,l.meth));l.next=Date.now()+30*DAY;note('중도 상환 '+won(x)+' · 남은 원금 '+won(l.bal))}
 snap();closeM();render()}

/* ---- 화면 연결 ---- */
const _livMore=V.more;V.more=()=>{livInit();return _livMore().replace('<h1>더보기</h1>','<h1>더보기</h1>'+billsView()).replace('<div class="lab">예금 · 적금</div>',loanView()+'<div class="lab">예금 · 적금</div>')};
const _livHome=V.home;V.home=()=>{livInit();let h=_livHome();const B=S.bills;
 if(B.length){const od=B.some(b=>b.late||Date.now()>b.due);h=h.replace('<div class="lab">오늘</div>',`<div class="card tap" style="margin-top:18px" onclick="tab='more';render();scrollTo(0,0)"><div style="display:flex;justify-content:space-between;align-items:baseline"><b>미납 청구서 ${B.length}건</b><b class="${od?'rise':''}">${won(B.reduce((s,b)=>s+billSum(b),0))}</b></div><div class="sub" style="margin-top:2px">${od?'기한이 지난 청구서가 있습니다 · ':''}가장 빠른 납부 기한 ${md(Math.min(...B.map(b=>b.due)))} · 눌러서 납부</div></div><div class="lab">오늘</div>`)}
 return h};
livProcess();
