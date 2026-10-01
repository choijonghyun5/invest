/* ===== trade ===== */
function trade(id,side,q){
 const a=A(id),isB=a.k==='bond'&&!!a.b;if(isB)processBonds();
 const gross=a.p*q,fee=gross*S.fee,h=S.hold[id]||{q:0,c:0};
 if(!(q>0))return toast('수량을 입력하세요');
 if(isB&&bnow()>=a.b.mat)return toast('만기가 지난 채권입니다');
 if(side==='buy'){if(gross+fee>S.cash)return toast('현금이 부족합니다');
  if(isB&&S.hold[id])bondSettle(id);
  S.cash-=gross+fee;S.fees=(S.fees||0)+fee;S.hold[id]={...h,q:h.q+q,c:(h.q*h.c+gross)/(h.q+q)};if(isB&&h.t0==null){S.hold[id].t0=bnow();S.hold[id].acc=0}addTx(a.k,a.n+' '+q+'개 매수',-(gross+fee))}
 else{if(q>h.q+1e-9)return toast('보유 수량 초과');
  let ai=0;if(isB){bondSettle(id);const r=Math.min(1,q/h.q);ai=(h.acc||0)*r*bu(a);h.acc=(h.acc||0)*(1-r)}
  S.cash+=gross-fee+ai;S.fees=(S.fees||0)+fee;S.realized+=(a.p-h.c)*q-fee;h.q-=q;if(h.q<1e-9)delete S.hold[id];addTx(a.k,a.n+' '+q+'개 매도',gross-fee);if(ai>0)addTx('interest',a.n+' 경과이자',ai)}
 snap();closeM();toast('체결 완료');render()}
function sheet(inner,lock){document.getElementById('m').innerHTML='<div class="ov"'+(lock?'':' onclick="if(event.target===this)closeM()"')+'><div class="sheet">'+inner+'</div></div>'}
function closeM(){document.getElementById('m').innerHTML=''}
let side='buy';
function openTrade(id){detail=id;const a=A(id),h=S.hold[id];
 sheet(`<div style="display:flex;justify-content:space-between"><div><div style="font-weight:700;font-size:18px">${a.n}</div><div class="sub">${KIND[a.k]} · ${id}${a.usd?' · USD/KRW '+FX:''}</div></div><div style="text-align:right"><div style="font-weight:700;font-size:18px" id="tp">${won(a.p)}</div><div class="sub">보유 ${h?+h.q.toFixed(4):0}</div></div></div>
 <div class="seg" id="sd"><button class="on" onclick="setSide('buy')">매수</button><button onclick="setSide('sell')">매도</button></div>
 <input id="qty" type="number" inputmode="decimal" min="0" placeholder="수량" oninput="calc('${id}')">
 <div id="calc" class="sub" style="margin:14px 0 16px;line-height:1.9"></div>
 <button class="btn w" id="go" onclick="trade('${id}',side,parseFloat(document.getElementById('qty').value))">매수하기</button>`);side='buy';calc(id)}
function setSide(s){side=s;document.querySelectorAll('#sd button').forEach((b,i)=>b.classList.toggle('on',(i===0)===(s==='buy')));document.getElementById('go').textContent=s==='buy'?'매수하기':'매도하기';calc(detail)}
function calc(id){const a=A(id),q=parseFloat(document.getElementById('qty').value)||0,g=a.p*q,f=g*S.fee;
 document.getElementById('calc').innerHTML=`<div class="row" style="padding:2px 0;border:0"><span>거래 금액</span><b>${won(g)}</b></div><div class="row" style="padding:2px 0;border:0"><span>수수료 (${(S.fee*100).toFixed(3)}%)</span><b>${won(f)}</b></div><div class="row" style="padding:2px 0;border:0"><span>최종 금액</span><b style="color:var(--ink)">${won(side==='buy'?g+f:g-f)}</b></div><div class="row" style="padding:2px 0;border:0"><span>주문 가능 현금</span><span>${won(S.cash)}</span></div>`}
