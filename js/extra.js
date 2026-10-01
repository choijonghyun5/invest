/* ===== extra: 목표 자산 · 알림 전체보기 · 카드 게임 ===== */
let nall=false,gcsel='hi',gcur=1+Math.floor(Math.random()*13);
function setGoal(v){v=Math.max(0,Math.round(+v||0));S.goal=v;S.goalHit=v&&total()>=v?v:0;save();render();toast(v?'목표 자산 저장됨':'목표 자산 해제됨')}
function goalView(){const T=total(),g=S.goal||0,p=g?Math.min(100,T/g*100):0;
 return`<div class="lab">목표 자산</div><div class="card"><div class="sub">목표 금액 (원) · 비우면 해제</div><input type="number" inputmode="numeric" value="${g||''}" placeholder="예: 20000000" onchange="setGoal(this.value)">${g?`<div class="sub" style="display:flex;justify-content:space-between;margin-top:14px"><span>${won(T)}</span><span>${p.toFixed(1)}%</span></div><div class="bar" style="margin-top:8px"><div style="width:${p}%;background:var(--ink)"></div></div><div class="sub" style="margin-top:8px">${T>=g?'목표 달성':'남은 금액 '+won(g-T)}</div>`:''}</div>`}
function diffCard(){const Q=DIFF[S.diff]||DIFF.normal,bn=Q.tiers.filter(t=>t[1]>0).map(t=>`<div>${t[0]}시간 이상 +${Math.round(t[1]*100)}%</div>`).join(''),r=(l,v)=>`<div class="row dr" style="padding:6px 0;border:0"><span class="sub">${l}</span><span class="dv">${v}</span></div>`;
 return`<div class="lab">난이도</div><div class="card"><b>${Q.n}</b><div class="sub" style="margin-top:2px">새 시뮬레이션을 시작할 때 바꿀 수 있습니다</div><div style="margin-top:8px">${r('시간당 급여',won(Q.wage))}${r('공부 보너스',bn)}${r('게임 승리 확률','×'+Q.odds.toFixed(2))}${r('거래 수수료','0.015%')}</div></div>`}
function goalCheck(){const g=S.goal||0;if(g>0&&total()>=g&&S.goalHit!==g){S.goalHit=g;note('목표 자산 달성 · '+won(g));save()}}
setInterval(goalCheck,4000);
const _more=V.more;V.more=()=>_more().replace('<div class="lab">게임</div>',goalView()+'<div class="lab">게임</div>');
function ntView(){const L=nall?S.notes:S.notes.slice(0,5);
 return`<div class="lab">알림</div><div class="card">${L.map(n=>`<div class="row"><span>${n.m}</span><span class="sub">${new Date(n.t).toLocaleDateString('ko-KR')}</span></div>`).join('')||'<div class="sub">새로운 알림이 없습니다</div>'}${S.notes.length>5?`<button class="btn s w" style="margin-top:10px" onclick="nall=!nall;render()">${nall?'접기':'전체 보기 ('+S.notes.length+')'}</button>`:''}</div>`}
/* 카드 하이/로우 (게임머니 전용) */
const CL=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
function cardGame(){const w=gcsel==='hi'?(13-gcur)/13:(gcur-1)/13;
 return`<div class="card" style="margin-top:12px"><b>카드 하이/로우</b><div class="sub" style="margin-bottom:12px">다음 카드가 높을지 낮을지 맞히면 베팅액만큼 획득 · 같은 숫자는 무승부 (A가 가장 낮고 K가 가장 높음)</div><div style="text-align:center;font-size:44px;font-weight:700;margin:6px 0 14px">${CL[gcur-1]}</div>${gseg([['hi','높음'],['lo','낮음']],gcsel,'gcsel')}<div class="sub" style="text-align:center;margin-bottom:10px">승리 확률 ${(w*100).toFixed(0)}%</div><button class="btn w" onclick="playCard()" ${S.gm<=0?'disabled':''}>카드 뽑기</button></div>`}

/* ===== 월별 투자 기록 (초기자산 · 공부 수입 · 투자 손익 · 배당 · 이자 · 기타 · 월말 자산) ===== */
let mall=false;
monthView=function(){const M={},k=t=>{const d=new Date(t);return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')},g=t=>M[k(t)]=M[k(t)]||{inc:0,int:0,dv:0,etc:0,end:0};
 S.hist.forEach(h=>g(h.t).end=h.v);g(Date.now()).end=total();
 S.study.forEach(x=>g(x.t).inc+=x.base+x.bonus);
 S.tx.forEach(t=>{if(t.ty==='interest')g(t.t).int+=t.a;else if(t.ty==='div')g(t.t).dv+=t.a;else if(t.ty==='etc'&&!/초기 자금/.test(t.m))g(t.t).etc+=t.a});
 const K=Object.keys(M).sort(),all=K.map((m,i)=>{const pv=i?M[K[i-1]].end:S.start,o=M[m],pl=o.end-pv-o.inc-o.dv-o.int-o.etc;return{m,...o,pv,pl,r:(o.end/pv-1)*100}}).reverse(),rows=all.slice(0,4),shown=mall?all:all.slice(0,1);
 const it=(l,v,c)=>`<div class="row" style="padding:3px 0;border:0"><span class="sub">${l}</span><span class="${c||''}" style="font-size:14px">${v}</span></div>`;
 return`<div class="lab">월별 기록 <span style="font-weight:400">· 월말 자산(백만원)</span></div><div class="card" style="margin-bottom:12px">${bars(rows.slice().reverse().map(r=>r.end/1e6),rows.slice().reverse().map(r=>r.m.slice(5)+"월"),rows.length-1,false)}</div>
 ${shown.map(r=>`<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px"><b>${r.m.replace('.','년 ').replace(/^(\d+년 )0?/,'$1')}월</b><span class="${cl(r.r)}" style="font-weight:600">${pc(r.r)}</span></div>
 ${it('초기자산',won(r.pv))}${it('공부 수입',sg(r.inc),cl(r.inc))}${it('투자 손익',sg(r.pl),cl(r.pl))}${it('배당',sg(r.dv),cl(r.dv))}${it('이자',sg(r.int),cl(r.int))}${it('기타',sg(r.etc),cl(r.etc))}<div class="row" style="padding:10px 0 0;margin-top:6px"><b>월말 자산</b><b>${won(r.end)}</b></div></div>`).join('')}${all.length>1?`<button class="btn s w" onclick="mall=!mall;render()">${mall?'지난 달 접기':'지난 달 보기 ('+(all.length-1)+'개월)'}</button>`:''}`};
/* ===== 게임 애니메이션 (동전 던지기 · 주사위 · 룰렛 · 카드) + 결과 토스트 ===== */
const RED=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],GL={coin:'h',dice:1,rl:0,rla:0};let gbusy=false;
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,TM=ms=>RM?250:ms,SL=360/37;
const rcls=n=>n===0?'gn':RED.includes(n)?'rise':'';
const pips=n=>{const P={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]}[n];return Array.from({length:9},(_,i)=>`<i class="${P.includes(i)?'on':''}"></i>`).join('')};
const wheelBg=()=>'conic-gradient('+Array.from({length:37},(_,i)=>{const c=i===0?'#2f8f5b':RED.includes(i)?'#c62828':'#161616';return`${c} ${i*SL}deg ${(i+1)*SL}deg`}).join(',')+')';
/* 배팅 금액이 클수록 승리 확률 하락: 승산(odds)에 보정 계수 f를 곱함. 1만 G 이하 ×1.00, 이후 10배마다 −0.1, 최저 ×0.5 */
const dm=()=>(DIFF[S.diff]||DIFF.normal).odds,gf=b=>(b<=1e4?1:Math.max(.5,1-.1*Math.log10(b/1e4)))*dm(),gb=b=>b<=1e4?1:Math.max(.5,1-.1*Math.log10(b/1e4)),odds=(p,f)=>p*f/(p*f+1-p);
const cardWt=(i,f)=>i===gcur?1:((gcsel==='hi')===(i>gcur)?f:1);
function probs(){const b=Math.max(0,Math.floor(+gbet||0)),f=gf(b),W=Array.from({length:13},(_,i)=>cardWt(i+1,f)),T=W.reduce((x,y)=>x+y,0),wn=W.reduce((x,y,i)=>x+((i+1!==gcur&&(gcsel==='hi')===(i+1>gcur))?y:0),0);
 return{f,fb:gb(b),coin:odds(.5,f),dice:odds(1/6,f),rl:odds(18/37,f),card:wn/T}}
function updateProbs(){const P=probs();['coin','dice','rl','card'].forEach(k=>{const e=document.getElementById('gp-'+k);if(e)e.textContent='승리 확률 '+(P[k]*100).toFixed(1)+'%'});const h=document.getElementById('gph');if(h)h.textContent=P.fb<1?'배팅 금액이 커서 승리 확률이 낮아졌습니다 (×'+P.fb.toFixed(2)+')':'1만 G를 넘기면 배팅 금액이 클수록 승리 확률이 낮아집니다'}
const stage={
 coin:()=>`<div class="gs"><div id="o-w" style="display:inline-block"><div class="coin" id="o-coin" style="transform:rotateX(${GL.coin==='t'?180:0}deg)"><div class="cf">앞</div><div class="cf cb">뒤</div></div></div></div>`,
 dice:()=>`<div class="gs"><div class="die" id="o-dice">${pips(GL.dice)}</div></div>`,
 rl:()=>`<div class="gs"><div class="wh"><div class="p"></div><div class="w" id="o-rl" style="background:${wheelBg()};transform:rotate(${GL.rla}deg)"></div><div class="c ${GL.rlshown?rcls(GL.rl):''}" id="o-rlc">${GL.rlshown?GL.rl:''}</div></div></div>`,
 card:()=>`<div class="gs"><div class="pk" id="o-card"><div class="cf">${CL[gcur-1]}</div><div class="cf cb" id="o-cb"></div></div></div>`};
const gcard=(t,d,k,ctl,btn)=>`<div class="card" style="margin-top:12px"><b>${t}</b><div class="sub" style="margin-bottom:10px">${d}</div>${stage[k]()}${ctl}<div class="sub" id="gp-${k}" style="text-align:center;margin-bottom:10px">승리 확률 ${(probs()[k]*100).toFixed(1)}%</div><button class="btn w" style="margin-top:4px" onclick="${btn}" ${S.gm<=0?'disabled':''}>플레이</button></div>`;
gameView=function(){return`<div class="sub" style="cursor:pointer;margin-bottom:14px" onclick="tab='more';render()">‹ 더보기</div><h1 style="margin-bottom:8px">게임</h1><div class="sub" style="margin-bottom:14px;line-height:1.6">게임머니는 모두 가상 화폐이며, 아래 환전 기능으로 가상 현금으로 바꿀 수 있습니다. 실제 돈과는 아무 관련이 없습니다.</div>
 <div class="card"><div class="sub">게임머니</div><div class="big" style="font-size:30px">${gm(S.gm)}</div><div class="sub" style="min-height:22px;margin-top:6px">${gres}</div>${chargeBox()}</div>
 ${exView()}<div class="lab">베팅 금액</div><input type="number" inputmode="numeric" value="${gbet}" oninput="gbet=+this.value;updateProbs()"><div class="sub" id="gph" style="margin:8px 2px 0">${probs().fb<1?'배팅 금액이 커서 승리 확률이 낮아졌습니다 (×'+probs().fb.toFixed(2)+')':'1만 G를 넘기면 배팅 금액이 클수록 승리 확률이 낮아집니다'}</div>
 ${gcard('코인 플립','맞히면 베팅액만큼 획득','coin',gseg([['h','앞면'],['t','뒷면']],gcoin,'gcoin'),"playG('coin')")}
 ${gcard('주사위','숫자를 맞히면 베팅액의 4배 획득','dice',gseg([1,2,3,4,5,6].map(n=>[n,n]),gdice,'gdice'),"playG('dice')")}
 ${gcard('룰렛','색을 맞히면 베팅액만큼 획득 · 0은 초록(패배)','rl',gseg([['r','빨강'],['b','검정']],grl,'grl'),"playG('rl')")}
 ${gcard('카드 하이/로우','다음 카드가 높을지 낮을지 맞히면 베팅액만큼 획득 · 같은 숫자는 무승부 (A 최저, K 최고)','card',gseg([['hi','높음'],['lo','낮음']],gcsel,'gcsel'),"playG('card')")}`};
function gtoast(m,res,win,tie){const o=document.createElement('div');o.className='gt';o.innerHTML=`<div class="gt-m">${m}</div><div class="gt-r ${tie?'':win?'rise':'fall'}">${res}</div>`;document.body.append(o);setTimeout(()=>o.remove(),2200);if(win&&!tie&&!RM)boom()}
function boom(){const c=document.createElement('div');c.className='fx';document.body.append(c);const col=['#ff4d4d','#2f6bff','#ffc83d','#9b5cff','#ff8fb1','#2fcf9b'];
 for(let k=0;k<3;k++)setTimeout(()=>{const ox=(Math.random()-.5)*160,oy=(Math.random()-.5)*80;for(let i=0;i<22;i++){const p=document.createElement('i'),a=Math.random()*Math.PI*2,d=80+Math.random()*140,w=5+Math.random()*4,dx=ox+Math.cos(a)*d,dy=oy+Math.sin(a)*d-30;
  p.style.cssText=`width:${w}px;height:${w*1.6}px;background:${col[(i+k)%6]}`;c.append(p);
  p.animate([{transform:'translate(-50%,-50%) rotate(0deg)',opacity:1},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${Math.random()*540}deg)`,opacity:1,offset:.55},{transform:`translate(calc(-50% + ${dx*1.08}px),calc(-50% + ${dy+110}px)) rotate(${Math.random()*720}deg)`,opacity:0}],{duration:1200+Math.random()*500,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'})}},k*220);
 setTimeout(()=>c.remove(),2300)}
let gch=10000;
/* 게임머니 충전: 1 G = ₩1, 보유 현금에서 차감. 현금이 모자라면 충전 불가. 남은 게임머니가 있어도 언제든 추가 충전 가능 */
function chargeBox(){const v=Math.floor(+gch||0),ok=v>0&&v<=S.cash;
 return`<div class="sub" style="margin-top:12px;display:flex;justify-content:space-between"><span>충전할 금액 (G)</span><span>보유 현금 ${won(S.cash)}</span></div><input id="chi" type="number" inputmode="numeric" min="1" value="${gch}" oninput="gch=+this.value;chPrev()"><div class="chg">${[[1e4,'1만'],[1e5,'10만'],[1e6,'100만'],[1e7,'1,000만']].map(([v,l])=>`<button class="btn s" onclick="gch=${v};render()">${l}</button>`).join('')}<button class="btn s" onclick="gch=Math.max(0,Math.floor(S.cash));render()">최대</button></div><div class="sub" id="chp" style="margin:2px 0 10px">${chText(v)}</div><button class="btn s w" id="chb" onclick="chargeG()" ${ok?'':'disabled'}>게임머니 충전</button>`}
function chText(v){return v<=0?'1 G = ₩1 · 충전한 금액만큼 보유 현금에서 빠져나갑니다':v>S.cash?'<span class="fall">현금이 부족합니다 (부족 '+won(v-S.cash)+')</span>':'충전 후 보유 현금 '+won(S.cash-v)}
function chPrev(){const v=Math.floor(+gch||0),e=document.getElementById('chp'),b=document.getElementById('chb');if(e)e.innerHTML=chText(v);if(b)b.disabled=!(v>0&&v<=S.cash)}
function chargeG(){const v=Math.floor(+gch||0);if(!(v>0))return toast('충전할 금액을 입력하세요');if(v>S.cash)return toast('현금이 부족합니다');
 S.cash-=v;S.gm+=v;addTx('etc','게임머니 충전 ('+gm(v)+')',-v);snap();gres='충전 +'+gm(v)+' (현금 -'+won(v)+')';save();render()}
function anim(el,kf,ms,ease,cb){let d=0;const once=()=>{if(!d){d=1;cb()}};if(!el||!el.animate){setTimeout(once,60);return}
 const a=el.animate(kf,{duration:ms,easing:ease,fill:'forwards'});a.onfinish=once;setTimeout(once,ms+600)}
function playG(k){if(gbusy)return;const b=Math.floor(gbet);if(!(b>0))return toast('베팅 금액을 입력하세요');if(b>S.gm)return toast('게임머니가 부족합니다');
 const f=gf(b);let win=false,tie=false,m,mult=1,go;const $=id=>document.getElementById(id),app=$('app');
 const fin=()=>{const res=tie?'무승부':win?'승리 +'+gm(b*mult):'패배 -'+gm(b);if(!tie)S.gm+=win?b*mult:-b;gres=m+' · '+res;gtoast(m,res,win,tie);gbusy=false;app.style.pointerEvents='';save();if(tab==='game')render()};
 if(k==='coin'){win=Math.random()<odds(.5,f);const r=win?gcoin:(gcoin==='h'?'t':'h');m=r==='h'?'앞면':'뒷면';const from=GL.coin==='t'?180:0,to=(r==='t'?180:0)+1800;
  go=()=>{GL.coin=r;anim($('o-w'),[{transform:'translateY(0)'},{transform:'translateY(-46px)',offset:.45},{transform:'translateY(0)'}],TM(1500),'ease-out',()=>{});anim($('o-coin'),[{transform:`rotateX(${from}deg)`},{transform:`rotateX(${to}deg)`}],TM(1500),'cubic-bezier(.2,.7,.2,1)',fin)}}
 if(k==='dice'){win=Math.random()<odds(1/6,f);const O=[1,2,3,4,5,6].filter(x=>x!==gdice),r=win?gdice:O[Math.floor(Math.random()*5)];m='주사위 '+r;mult=4;
  go=()=>{const e=$('o-dice'),iv=setInterval(()=>{if(e)e.innerHTML=pips(1+Math.floor(Math.random()*6))},90);GL.dice=r;
   anim(e,[{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(-36px) rotate(200deg)',offset:.4},{transform:'translateY(0) rotate(360deg)'}],TM(1200),'ease-in-out',()=>{clearInterval(iv);if(e)e.innerHTML=pips(r);fin()})}}
 if(k==='rl'){win=Math.random()<odds(18/37,f);const cw=n=>n>0&&(RED.includes(n)?'r':'b')===grl,PP=Array.from({length:37},(_,i)=>i).filter(n=>cw(n)===win),r=PP[Math.floor(Math.random()*PP.length)],red=RED.includes(r);m='룰렛 '+r+(r===0?' (초록)':red?' (빨강)':' (검정)');const tgt=-(r+.5)*SL;
  go=()=>{const c=$('o-rlc');if(c)c.textContent='';GL.rlshown=0;anim($('o-rl'),[{transform:`rotate(${GL.rla}deg)`},{transform:`rotate(${tgt-1800}deg)`}],TM(3000),'cubic-bezier(.1,.6,.1,1)',()=>{GL.rla=tgt;GL.rl=r;GL.rlshown=1;if(c){c.textContent=r;c.className='c '+rcls(r)}setTimeout(fin,RM?0:450)})}}
 if(k==='card'){let x=Math.random()*Array.from({length:13},(_,i)=>cardWt(i+1,f)).reduce((a,c)=>a+c,0),n=13;for(let i=1;i<=13;i++){x-=cardWt(i,f);if(x<0){n=i;break}}const p=CL[gcur-1];if(n===gcur)tie=true;else win=(gcsel==='hi')===(n>gcur);m='카드 '+p+' → '+CL[n-1];
  go=()=>{const cb=$('o-cb');if(cb)cb.textContent=CL[n-1];anim($('o-card'),[{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],TM(900),'ease-in-out',()=>{gcur=n;fin()})}}
 gbusy=true;app.style.pointerEvents='none';const st=$('o-'+({coin:'coin',dice:'dice',rl:'rl',card:'card'})[k]);if(st&&st.scrollIntoView)st.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'});go()}
function playCard(){playG('card')}

/* ===== 게임머니 → 현금 환전 ===== */
let exg='';
const exRate=()=>1,exCap=()=>5e6; // 환율 1G=₩1, 하루 한도 ₩5,000,000 고정
function exUsed(){const d=new Date().toDateString();if(!S.gmx||S.gmx.d!==d)S.gmx={d,w:0};return S.gmx.w}
const exWon=g=>Math.floor(g/exRate());
function exView(){const used=exUsed(),left=Math.max(0,exCap()-used),w=exWon(+exg||0);
 return`<div class="lab">게임머니 환전</div><div class="card"><div class="sub" style="line-height:1.6;margin-bottom:12px">${exRate()} G = ₩1 · 오늘 남은 환전 한도 ${won(left)} / ${won(exCap())}</div>
 <div class="sub">환전할 게임머니 (G)</div><input id="exi" type="number" inputmode="numeric" value="${exg}" placeholder="0" oninput="exg=this.value;exPrev()">
 <div class="grid g2" style="gap:8px;margin:8px 0"><button class="btn s w" onclick="exMax()">최대</button><button class="btn s w" onclick="exg='';render()">지우기</button></div>
 <div class="row" style="border:0;padding:6px 0"><span class="sub">받게 될 현금</span><b id="exw">${won(w)}</b></div><button class="btn w" onclick="doExchange()" ${S.gm<=0||left<=0?'disabled':''}>현금으로 환전</button></div>`}
function exPrev(){const e=document.getElementById('exw');if(e)e.textContent=won(exWon(+exg||0))}
function exMax(){const left=Math.max(0,exCap()-exUsed());exg=String(Math.max(0,Math.min(Math.floor(S.gm),left*exRate())));render()}
function doExchange(){if(gbusy)return;const g=Math.floor(+exg||0);if(!(g>0))return toast('환전할 게임머니를 입력하세요');if(g>S.gm)return toast('게임머니가 부족합니다');
 const w=exWon(g);if(w<1)return toast('최소 '+exRate()+' G부터 환전할 수 있습니다');const left=exCap()-exUsed();if(w>left)return toast('오늘 환전 한도를 넘었습니다 (남은 한도 '+won(Math.max(0,left))+')');
 const used=Math.ceil(w*exRate());S.gm-=used;S.cash+=w;S.gmx.w+=w;addTx('etc','게임머니 환전 ('+gm(used)+')',w);snap();note('게임머니 환전 '+sg(w)+' · 현금 반영');exg='';gres='환전 '+gm(used)+' → '+won(w);save();render()}
