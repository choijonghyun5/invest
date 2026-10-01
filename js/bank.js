/* ===== bank ===== */
const DAY=864e5,RATE={dep:.032,sav:.035};
const bankPrin=b=>b.ty==='dep'?b.amt:b.amt*b.paid;
const bankVal=()=>S.bank.reduce((x,b)=>x+bankPrin(b),0);
const bankInt=b=>b.ty==='dep'?b.amt*b.rate*b.mo/12:b.amt*b.rate/12*b.mo*(b.mo+1)/2;
function openBank(ty){const dep=ty==='dep';
 sheet(`<div style="font-weight:700;font-size:18px">${dep?'예금 가입':'적금 가입'}</div><div class="sub">연 ${RATE[ty]*100}% · 만기 시 원금과 이자 지급${dep?'':' · 매월 자동 납입'}</div>
 <div class="sub" style="margin-top:16px">${dep?'가입금액':'월 납입금'} (원)</div><input id="ba" type="number" inputmode="numeric" value="${dep?1000000:300000}" oninput="bcalc('${ty}')">
 <div class="sub" style="margin-top:12px">기간 (개월)</div><input id="bm" type="number" inputmode="numeric" value="12" oninput="bcalc('${ty}')">
 <div id="bc" class="sub" style="margin:14px 0 16px;line-height:1.9"></div><button class="btn w" onclick="joinBank('${ty}')">가입하기</button>`);bcalc(ty)}
function bget(ty){const amt=+document.getElementById('ba').value||0,mo=Math.max(1,Math.min(60,+document.getElementById('bm').value|0||0));return{ty,amt,mo,rate:RATE[ty]}}
function bcalc(ty){const b=bget(ty);document.getElementById('bc').innerHTML=`<div class="row" style="padding:2px 0;border:0"><span>총 납입 원금</span><b>${won(ty==='dep'?b.amt:b.amt*b.mo)}</b></div><div class="row" style="padding:2px 0;border:0"><span>예상 이자</span><b class="up">${sg(bankInt(b))}</b></div><div class="row" style="padding:2px 0;border:0"><span>만기일</span><span>${new Date(Date.now()+b.mo*30*DAY).toLocaleDateString('ko-KR')}</span></div>`}
function joinBank(ty){const b=bget(ty);if(b.amt<=0)return toast('금액을 입력하세요');if(b.amt>S.cash)return toast('현금이 부족합니다');
 S.cash-=b.amt;b.start=Date.now();b.paid=1;b.next=Date.now()+30*DAY;S.bank.push(b);
 addTx('bank',(ty==='dep'?'예금 가입 ':'적금 1회차 납입 ')+won(b.amt),-b.amt);snap();closeM();toast('가입 완료');render()}
function processBank(){let ch=0;const n=Date.now();
 S.bank=S.bank.filter(b=>{
  if(b.ty==='sav')while(b.paid<b.mo&&n>=b.next){if(S.cash<b.amt){if(b.warn!==b.paid){b.warn=b.paid;note('현금 부족으로 적금 납입이 보류되었습니다')}break}S.cash-=b.amt;b.paid++;b.next+=30*DAY;addTx('bank','적금 납입 '+b.paid+'회차',-b.amt);note('적금 '+b.paid+'회차 납입 '+won(b.amt));ch=1}
  if(b.ty==='sav'&&b.paid<b.mo&&b.next-n<=DAY&&b.next>n&&b.pre!==b.paid){b.pre=b.paid;note('내일은 적금 납입일입니다 ('+won(b.amt)+')')}
  const done=n>=b.start+b.mo*30*DAY&&(b.ty==='dep'||b.paid>=b.mo);
  if(done){const i=bankInt(b),p=bankPrin(b);S.cash+=p+i;addTx('bank',(b.ty==='dep'?'예금':'적금')+' 만기 원금',p);addTx('interest',(b.ty==='dep'?'예금':'적금')+' 이자수익',i);note('만기 · 이자 '+sg(i));ch=1;return false}
  return true});
 if(processBonds())ch=1;
 if(ch){snap();if(!document.getElementById('m').innerHTML)render()}}
function bankView(){return`<div class="lab">예금 · 적금</div><div class="grid g2"><div class="card tap" onclick="openBank('dep')"><b>예금</b><div class="sub">연 3.2% · 목돈 맡기기</div></div><div class="card tap" onclick="openBank('sav')"><b>적금</b><div class="sub">연 3.5% · 매월 자동 납입</div></div></div>`+(S.bank.length?`<div class="card" style="margin-top:12px">${S.bank.map(b=>`<div class="row"><div><b>${b.ty==='dep'?'예금':'적금'} ${won(b.amt)}${b.ty==='sav'?' /월':''}</b><div class="sub">만기 ${new Date(b.start+b.mo*30*DAY).toLocaleDateString('ko-KR')} · 예상 이자 ${won(bankInt(b))}${b.ty==='sav'?' · '+b.paid+'/'+b.mo+'회':''}</div></div><b>${won(bankPrin(b))}</b></div>`).join('')}</div>`:'')}
