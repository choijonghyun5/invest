/* 채권 v1 — 신규 발행(월별 시리즈) · 표면금리 고정 · 이표채 이자 · 만기 상환 · 시장금리 기반 가격
   - 매수하면 그 달에 발행된 시리즈를 사게 됩니다. 표면금리는 첫 매수 시점의 시장금리(0.125%p 단위)로 고정됩니다.
   - 가격 = 남은 이자와 원금을 현재 시장금리(만기수익률)로 할인한 값(경과이자 제외). 금리가 오르면 가격은 내립니다.
   - 이자: 한국 국채는 3개월, 미국 국채는 6개월마다 지급. 보유 기간만큼 일할 계산하고, 중도 매도 시 경과이자도 받습니다.
   - 시장금리: 한국은행 ECOS(한국, Worker에 ECOS_KEY 필요) · Yahoo(미국). 없으면 샘플 금리를 시뮬레이션합니다. */
const BYR=365.25*864e5,BDAY=864e5;
const BP={
 KTB3:{n:'한국 국채 3Y',cur:'KRW',term:3,f:4,face:1e4,y0:2.8,src:'한국은행 ECOS'},
 KTB10:{n:'한국 국채 10Y',cur:'KRW',term:10,f:4,face:1e4,y0:3.0,src:'한국은행 ECOS'},
 UST5:{n:'미국 국채 5Y',cur:'USD',term:5,f:2,face:100,y0:4.0,src:'Yahoo Finance'},
 UST10:{n:'미국 국채 10Y',cur:'USD',term:10,f:2,face:100,y0:4.2,src:'Yahoo Finance'}};
const BY={};Object.keys(BP).forEach(k=>BY[k]={y:BP[k].y0,prev:BP[k].y0,real:false});
const bnow=()=>Date.now();
const addMo=(t,m)=>{const d=new Date(t);d.setMonth(d.getMonth()+m);return +d};
const bu=a=>a.b.cur==='USD'?FX:1;
const fdate=t=>new Date(t).toLocaleDateString('ko-KR');
function cdates(b){if(!b.cd){const a=[],st=12/b.f;for(let k=1;;k++){const t=addMo(b.issue,k*st);a.push(t);if(t>=b.mat)break}b.cd=a}return b.cd}
function accr(b,now){const cd=cdates(b),i=cd.findIndex(t=>t>now);if(i<0)return 0;const L=i?cd[i-1]:b.issue;return b.face*b.coupon/100/b.f*Math.max(0,now-L)/(cd[i]-L)}
function bprice(b,y,now){if(now>=b.mat)return b.face;const f=b.f,c=b.coupon/100,r=y/100/f;let pv=0;
 for(const t of cdates(b))if(t>now)pv+=b.face*c/f/Math.pow(1+r,f*(t-now)/BYR);
 pv+=b.face/Math.pow(1+r,f*(b.mat-now)/BYR);return Math.max(pv-accr(b,now),b.face*.05)}
/* 보유분 경과이자(통화 단위) */
function holdAcc(a,h){const b=a.b,now=bnow(),cd=cdates(b),i=cd.findIndex(t=>t>now);if(i<0)return h.acc||0;const L=i?cd[i-1]:b.issue;
 return(h.acc||0)+h.q*b.face*b.coupon/100/b.f*Math.max(0,now-Math.max(h.t0==null?now:h.t0,L))/(cd[i]-L)}
function bondSettle(id){const a=A(id),h=S.hold[id];if(!a||!h||!a.b)return;h.acc=holdAcc(a,h);h.t0=bnow()}
/* 시리즈(발행 회차) 등록 */
function regSeries(s){if(A(s.id))return A(s.id);const P=BP[s.prod],d=new Date(s.issue),a={id:s.id,n:P.n+' · '+String(d.getFullYear()).slice(2)+'.'+String(d.getMonth()+1).padStart(2,'0')+' 발행',k:'bond',p:P.face,o:P.face,vol:.002,hide:1,
 b:{prod:s.prod,coupon:s.coupon,issue:s.issue,mat:s.mat,f:P.f,face:P.face,cur:P.cur}};if(P.cur==='USD')a.usd=1;ASSETS.push(a);bondPrices();return a}
function seriesFor(prod){const now=bnow(),d=new Date(now),ym=String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0'),id=prod+'-'+ym;if(A(id))return A(id);
 const P=BP[prod],issue=+new Date(d.getFullYear(),d.getMonth(),1),s={id,prod,coupon:Math.round(BY[prod].y*8)/8,issue,mat:addMo(issue,P.term*12)};
 S.bondSeries=S.bondSeries||[];S.bondSeries.push(s);save();return regSeries(s)}
S.bondSeries=S.bondSeries||[];S.bondSeries.forEach(regSeries);
/* 기존 'KTB' 보유분은 한국 국채 3Y 시리즈로 유지 */
(function(){const k=A('KTB');if(!k)return;S.ktbIssue=S.ktbIssue||+new Date(new Date(bnow()).getFullYear(),new Date(bnow()).getMonth(),1);
 const P=BP.KTB3;k.hide=1;k.n=P.n+' · 기존';k.b={prod:'KTB3',coupon:2.8,issue:S.ktbIssue,mat:addMo(S.ktbIssue,36),f:P.f,face:P.face,cur:'KRW'}})();
/* 시장금리 입력 */
function setBY(prod,y,prev){y=+y;if(y>20)y/=10;if(!(y>0&&y<20))return;prev=+prev;if(prev>20)prev/=10;if(!(prev>0&&prev<20))prev=y;BY[prod]={y,prev,real:true,t:Date.now()}}
function bondPrices(){const now=bnow();
 Object.keys(BY).forEach(k=>{const Y=BY[k];if(!Y.real){const y0=BP[k].y0;Y.y=Math.max(.1,Y.y+(y0-Y.y)*.02+(Math.random()-.5)*.01);Y.prev=y0}});
 ASSETS.forEach(a=>{if(a.k!=='bond'||!a.b)return;const Y=BY[a.b.prod],u=bu(a);a.p=bprice(a.b,Y.y,now)*u;a.o=bprice(a.b,Y.prev,now)*u})}
const _fp=window.fetchPrices;window.fetchPrices=async function(){await _fp();bondPrices()};bondPrices();
async function yieldPoll(){if(!API)return;try{const d=await jget('/q?s=%5ETNX,%5EFVX');
 if(d['^TNX']&&d['^TNX'].price)setBY('UST10',d['^TNX'].price,d['^TNX'].prev);if(d['^FVX']&&d['^FVX'].price)setBY('UST5',d['^FVX'].price,d['^FVX'].prev)}catch(e){}}
if(API){setTimeout(yieldPoll,800);setInterval(yieldPoll,15000)}
/* 이자 지급 · 만기 상환 */
function processBonds(){const now=bnow();let ch=0;
 for(const id of Object.keys(S.hold)){const a=A(id),h=S.hold[id];if(!a||a.k!=='bond'||!a.b||!h)continue;const b=a.b,u=bu(a);
  if(h.t0==null){h.t0=now;h.acc=0}
  const cd=cdates(b);
  for(let i=0;i<cd.length;i++){const N=cd[i];if(N<=h.t0)continue;if(N>now)break;const L=i?cd[i-1]:b.issue,q=h.q,
   v=((h.acc||0)+q*b.face*b.coupon/100/b.f*(N-Math.max(h.t0,L))/(N-L))*u;h.acc=0;h.t0=N;
   if(v>0){S.cash+=v;addTx('interest',a.n+' 이자 ('+(+q.toFixed(4))+'좌)',v);note(a.n+' 이자 '+sg(v)+' 지급');ch=1}
   if(N>=b.mat){const p=q*b.face*u;S.cash+=p;S.realized+=(b.face*u-h.c)*q;addTx('bond',a.n+' 만기 상환 ('+(+q.toFixed(4))+'좌)',p);note(a.n+' 만기 · 원금 '+won(p)+' 상환');delete S.hold[id];ch=1;break}}}
 return ch}
/* 시장 탭 목록에 신규 발행 상품 */
function bondRows(s){const L=Object.keys(BP).filter(k=>!s||BP[k].n.toLowerCase().includes(s)||(s.length>=2&&(BP[k].n+' '+k+' 채권 국채 bond treasury').toLowerCase().includes(s)));
 return L.length?`<div class="lab" style="margin:14px 0 4px">채권 · 신규 발행</div>`+L.map(k=>{const P=BP[k],Y=BY[k];return`<div class="row tap" onclick="openDetail('bp:${k}')"><div><b>${P.n}</b><div class="sub">채권 · 만기 ${P.term}년 · 이자 ${P.f===4?'3개월':'6개월'}마다</div></div><div style="text-align:right"><b>${Y.y.toFixed(2)}%</b><div class="sub">시장금리${Y.real?'':' · 샘플'}</div></div></div>`}).join(''):''}
/* 화면 */
const kv=(l,v,c)=>`<div class="row"><span>${l}</span><b${c?` class="${c}"`:''}>${v}</b></div>`;
const srcTxt=k=>BY[k].real?'실시간 금리 ('+BP[k].src+')':'샘플 금리 (시뮬레이션) · 실제 금리 연결 전';
function buyBond(k){const a=seriesFor(k);openTrade(a.id)}
function bpView(k){const P=BP[k],Y=BY[k],now=bnow(),d=new Date(now),iss=+new Date(d.getFullYear(),d.getMonth(),1),cp=Math.round(Y.y*8)/8,
 mine=Object.keys(S.hold).filter(id=>A(id)&&A(id).b&&A(id).b.prod===k),dy=Y.y-Y.prev;
 return`<div class="sub" style="cursor:pointer;margin-bottom:14px" onclick="tab='market';render()">‹ 시장</div><div style="font-weight:700;font-size:20px">${P.n}</div><div class="sub" style="margin-bottom:10px">채권 · 신규 발행${P.cur==='USD'?' · USD/KRW '+FX.toFixed(2):''}</div>
 <div class="big" style="font-size:32px">${Y.y.toFixed(2)}%</div><div class="sub">시장금리(만기수익률) · ${Math.abs(dy)<.005?'변동 없음':(dy>0?'▲ ':'▼ ')+Math.abs(dy).toFixed(2)+'%p'}</div>
 <div class="card" style="margin-top:16px">${kv('이번 달 발행 표면금리','연 '+cp.toFixed(3)+'%')}${kv('만기',fdate(addMo(iss,P.term*12))+' ('+P.term+'년)')}${kv('이자 지급','연 '+P.f+'회 · '+(P.f===4?'3개월':'6개월')+'마다')}${kv('1좌 액면',P.cur==='USD'?'$'+P.face+' (≈ '+won(P.face*FX)+')':won(P.face))}${kv('이자 수령 예상(1좌·연)',P.cur==='USD'?'$'+(P.face*cp/100).toFixed(2):won(P.face*cp/100))}</div>
 <div class="sub" style="margin:10px 2px;line-height:1.7">${srcTxt(k)}. 매수하면 이번 달 발행분을 사게 되며 표면금리는 만기까지 고정됩니다. 만기 전에 팔면 그때의 시장금리에 따른 가격으로 팔립니다.</div>
 <button class="btn w" onclick="buyBond('${k}')">매수</button>
 ${mine.length?`<div class="lab">내 ${P.n}</div><div class="card">${mine.map(id=>{const a=A(id),h=S.hold[id];return`<div class="row tap" onclick="openDetail('${id}')"><div><b>${a.n}</b><div class="sub">${+h.q.toFixed(4)}좌 · 표면 ${a.b.coupon}% · 만기 ${fdate(a.b.mat)}</div></div><b>${won(h.q*a.p)}</b></div>`}).join('')}</div>`:''}`}
function bondView(a){const b=a.b,h=S.hold[a.id],u=bu(a),now=bnow(),Y=BY[b.prod],cd=cdates(b),nx=cd.filter(t=>t>now),yrs=Math.max(0,(b.mat-now)/BYR),
 P=(y)=>bprice(b,y,now)*u,pm=(y)=>(P(y)/a.p-1)*100;let mine='';
 if(h){const i=cd.findIndex(t=>t>now),N=cd[i],L=i?cd[i-1]:b.issue,full=h.q*b.face*b.coupon/100/b.f,nextAmt=(h.acc||0)+full*(N-Math.max(h.t0==null?now:h.t0,L))/(N-L),
  coup=(nextAmt+full*(nx.length-1))*u,prin=h.q*b.face*u,cost=h.q*h.c,pl=(a.p-h.c)*h.q,acc=holdAcc(a,h)*u;
  mine=`<div class="lab">내 보유</div><div class="card">${kv('보유 수량',(+h.q.toFixed(4))+'좌')}${kv('평가금액',won(h.q*a.p))}${kv('취득 단가',won(h.c))}${kv('평가손익',sg(pl)+' ('+pc((a.p/h.c-1)*100)+')',cl(pl))}${kv('경과 이자(받을 몫)',won(acc))}${kv('다음 이자 지급액',won(nextAmt*u)+' · '+fdate(N))}${kv('만기까지 받을 이자',won(coup))}${kv('만기 상환금',won(prin))}${kv('만기까지 예상 수익',sg(coup+prin-cost),cl(coup+prin-cost))}</div><div class="sub" style="margin:8px 2px;line-height:1.6">만기까지 보유하는 경우의 금액이며, 미국 국채는 현재 환율 기준입니다.</div>`}
 return`<div class="sub" style="cursor:pointer;margin-bottom:14px" onclick="tab='portfolio';render()">‹ 자산</div><div style="font-weight:700;font-size:20px">${a.n}</div><div class="sub" style="margin-bottom:10px">채권 · ${a.id}${a.usd?' · USD/KRW '+FX.toFixed(2):''}</div><div id="dh">${dhead(a)}</div><div class="sub" style="margin-top:2px">1좌(액면 ${b.cur==='USD'?'$'+b.face:won(b.face)}) 가격</div>
 <div class="grid g2" style="margin-top:14px"><button class="btn w" onclick="openTrade('${a.id}')">매수</button><button class="btn s w" onclick="openTrade('${a.id}');setSide('sell')">매도${h?' · 보유 '+(+h.q.toFixed(4)):''}</button></div>
 ${mine}<div class="lab">채권 정보</div><div class="card">${kv('표면금리','연 '+b.coupon+'%')}${kv('시장금리(만기수익률)',Y.y.toFixed(2)+'%')}${kv('발행일',fdate(b.issue))}${kv('만기',fdate(b.mat)+(yrs>0?' · 잔존 '+yrs.toFixed(1)+'년':' · 만기 도래'))}${kv('이자 지급일',nx.length?nx.slice(0,2).map(fdate).join(', ')+(nx.length>2?' …':''):'모두 지급됨')}${kv('이자 지급 주기',(b.f===4?'3개월':'6개월')+'마다')}</div>
 <div class="lab">금리가 변하면 가격은? <span style="font-weight:400">· 현재가 대비</span></div><div class="card">${[-1,-.5,.5,1].map(d=>kv('시장금리 '+(d>0?'+':'')+d+'%p',pc(pm(Y.y+d)),cl(pm(Y.y+d)))).join('')}</div>
 <div class="sub" style="margin:8px 2px;line-height:1.6">${srcTxt(b.prod)}. 금리가 오르면 채권 가격은 내리고, 만기가 길수록 더 크게 움직입니다.</div>`}
const _dv=window.detailView;window.detailView=function(){if(String(dsel).startsWith('bp:'))return bpView(dsel.slice(3));const a=A(dsel);if(a&&a.k==='bond'&&a.b)return bondView(a);return _dv()};
