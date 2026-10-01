/* 실데이터 계층 v2 — api.js 다음에 로드. 프록시(API) 미설정/실패 시 기존 mock이 그대로 쓰입니다.
   한국 종목 실시간(네이버) · 실제 차트(Yahoo) · 한국 종목 지표 · 실제 뉴스 · 지수/유가/VIX */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* 0) 사용자가 검색해서 추가한 종목 (S.custom에 저장, 시작 시 복원) */
S.custom=S.custom||[];
function FASTY(id){const a=A(id);return !a||!a.custom||!!S.hold[id]||dsel===id}
function regAsset(c){if(A(c.id))return A(c.id);const a={id:c.id,n:c.n,k:c.k,p:c.p||0,o:c.o||c.p||0,vol:c.k==='coin'?.03:c.k==='etf'?.01:.015,custom:1};if(c.usd)a.usd=1;ASSETS.push(a);YS[c.id]=c.y;return a}
S.custom.forEach(regAsset);
setInterval(()=>S.custom.forEach(c=>{const a=A(c.id);if(a&&a.p>1){c.p=a.p;c.o=a.o}}),1e4);
const KR=ASSETS.filter(a=>/^\d{6}$/.test(a.id)).map(a=>a.id);
const ESYM={KOSPI:'^KS11',KOSDAQ:'^KQ11','S&P 500':'^GSPC',NASDAQ:'^IXIC','Dow Jones':'^DJI','WTI 국제유가':'CL=F','미국 국채 10Y':'^TNX',VIX:'^VIX','USD/KRW':'KRW=X','금 (1g)':'GC=F'};
let KRST='',NREAL=false,KTBY=0;const HC={},HP={},KI={},KIP={},ES={};
const unitOf=a=>(a.id==='GOLD'||a.id==='SILVER')?FX/31.1035:a.usd?FX:1;
const jget=async p=>{const r=await fetch(API+p);if(!r.ok)throw 0;return r.json()};
/* 1) 한국 종목 실시간 (2.5초) */
async function krPoll(ids){const dflt=!ids;ids=ids||KR.filter(FASTY);if(!API||!ids.length)return;try{const d=await jget('/kr?c='+ids.join(','));let n=0;
 for(const id of ids){const q=d[id];if(!q||!q.price)continue;const a=A(id),v=+q.vol||0,p=+q.price;a.p=p;a.o=+q.prev||a.o;
  a.real={o:+q.open,hv:+q.high,lv:+q.low,vol:v,amt:(+q.amt<v*p/100?+q.amt*1e6:+q.amt)};n++}
 if(dflt){KRLIVE=n>0;KRST=n?'한국 종목 실시간 (네이버 증권)':'한국 종목 응답 없음 · Yahoo 지연 시세 사용'}}catch(e){if(dflt){KRLIVE=false;KRST='한국 실시간 연결 실패'}}
 if(tab==='detail'){const e=document.getElementById('dh');if(e)e.innerHTML=dhead(A(dsel))}}
/* 2) 실제 차트 */
const _series=series;
window.series=function(a,days){const s=YS[a.id]||ESYM[a.id];if(!API||!s)return _series(a,days);
 const k=a.id+'|'+days,h=HC[k];
 if(!h){if(!HP[k]){HP[k]=1;jget('/chart?s='+encodeURIComponent(s)+'&d='+days).then(d=>{const c=(d.c||[]).map((x,i)=>x==null?null:{t:d.t[i]*1000,v:x,o:d.o[i]??x,h:d.h[i]??x,l:d.l[i]??x,q:d.v[i]||0}).filter(Boolean);
  if(c.length>3){HC[k]=c;if(tab==='detail'&&dsel===a.id||document.getElementById('m').innerHTML)render()}}).catch(()=>setTimeout(()=>delete HP[k],30000))}
  return _series(a,days)}
 const u=unitOf(a),v=h.map(x=>x.v*u),k2=a.p/v[v.length-1];return v.map(x=>x*k2)};
function ohlc(a,n){const h=HC[a.id+'|'+dper];if(!API||!h||h.length!==n.length)return null;const s=a.p/h[h.length-1].v,m=Math.max(...h.map(x=>x.q),1);
 return{O:h.map(x=>x.o*s),H:h.map(x=>x.h*s),L:h.map(x=>x.l*s),V:h.map(x=>.05+x.q/m)}}
function chl(a,n,days,now){const h=HC[a.id+'|'+days];
 if(h&&h.length===n.length)return h.map(x=>{const d=new Date(x.t);return days===1?d.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('ko-KR')});
 return n.map((_,i)=>{const d=new Date(now-(n.length-1-i)/(n.length-1)*days*DAY);return days===1?d.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('ko-KR')})}
/* 3) 한국 종목 투자지표 */
const capKR=s=>{if(!s)return 0;const j=/([\d,]+)조/.exec(s),e=/([\d,]+)억/.exec(s),f=x=>+x.replace(/,/g,'');return(j?f(j[1]):0)+(e?f(e[1])/1e4:0)};
const _info=info;
window.info=function(a){const I=_info(a);if(a.real&&a.real.vol)I.vol=a.real.vol;
 if(API&&KR.includes(a.id)){const k=KI[a.id];
  if(!k&&!KIP[a.id]){KIP[a.id]=1;jget('/krinfo?c='+a.id).then(d=>{KI[a.id]=d;if(tab==='detail'&&dsel===a.id)render()}).catch(()=>setTimeout(()=>delete KIP[a.id],30000))}
  if(k){if(k.per>0)I.PER=k.per;if(k.pbr>0)I.PBR=k.pbr;if(k.eps)I.EPS=k.eps;if(k.div!=null)I.DIV=k.div;if(k.per>0&&k.pbr>0)I.ROE=I.PBR/I.PER*100;const c=capKR(k.cap);if(c)I.cap=c}}
 if(API&&['kr','us','etf'].includes(a.k)){const d=DY[a.id];if(d)I.DIV=d.n?d.sum/(a.usd?a.p/FX:a.p)*100:0;else loadDiv(a)}
 return I};
/* 4) 지수·유가·VIX */
async function econPoll(){if(!API)return;try{const d=await jget('/q?s='+Object.values(ESYM).join(','));
 for(const [n,s] of Object.entries(ESYM))if(d[s]&&d[s].price&&n!=='USD/KRW'&&n!=='금 (1g)')ES[n]=d[s].price}catch(e){}}
const _el=econList;window.econList=()=>_el().map(e=>ES[e.n]?{...e,p:ES[e.n]}:e);
/* 5) 실제 뉴스 (Google News RSS) */
const NQ=[['한국 증시','코스피 증시'],['미국 증시','뉴욕증시 나스닥'],['경제','경제 물가 성장률'],['금리','기준금리'],['환율','원달러 환율'],['원자재','국제 금값 유가'],['코인','비트코인']];
const NCAT={kr:'한국 증시',us:'미국 증시',etf:'한국 증시',gold:'원자재',silver:'원자재',coin:'코인',bond:'금리'};
const NHQ={GOLD:'국제 금값',SILVER:'국제 은값',KTB:'국고채 금리',BTC:'비트코인',ETH:'이더리움'};
async function newsPoll(){if(!API)return;const qs=NQ.map(([c,q])=>[c,q,null,6]);
 Object.keys(S.hold).forEach(id=>{const a=A(id);qs.push([a.id==='SPY'?'미국 증시':NCAT[a.k],NHQ[id]||a.n.replace(/\s*\(.*\)/,'')+(a.k==='kr'||a.k==='us'?' 주가':''),id,3])});
 const R=await Promise.allSettled(qs.map(([c,q,id,m])=>jget('/news?q='+encodeURIComponent(q)).then(L=>Array.isArray(L)?L.slice(0,m).map(x=>({c,id,...x})):[])));
 const seen={},out=[];R.flatMap(r=>r.value||[]).sort((x,y)=>(y.id?1:0)-(x.id?1:0)).forEach(x=>{if(x.title&&x.link&&!seen[x.link]){seen[x.link]=1;out.push(x)}});
 if(!out.length)return;out.sort((a,b)=>b.t-a.t);NEWS.length=0;
 out.forEach(x=>NEWS.push([x.c,esc(x.title),x.id,Math.max(0,Math.round((Date.now()-x.t)/36e5)),x.link,esc(x.src||'')]));NREAL=true;if(tab==='market'&&!document.getElementById('m').innerHTML)render()}
const _on=openNews;
window.openNews=function(i){const n=NEWS[i];if(!n[4])return _on(i);
 sheet(`<div class="sub">${n[0]} · ${n[5]?n[5]+' · ':''}${n[3]}시간 전</div><div style="font-weight:700;font-size:18px;margin:6px 0 18px;line-height:1.4">${n[1]}</div>${n[2]?`<button class="btn s w" style="margin-bottom:10px" onclick="closeM();openDetail('${n[2]}')">관련 종목 보기</button>`:''}<a class="btn w" style="display:block;text-align:center;text-decoration:none" href="${esc(n[4])}" target="_blank" rel="noopener noreferrer">원문 보기</a>`)};
/* 6) 재무제표 (한국: 네이버 · 미국: Yahoo) */
const FN={},FP={};
function realFin(a){if(!API||!(a.k==='kr'||a.k==='us'))return null;const k=a.id+'|'+fp,F=FN[k];
 if(!F){if(!FP[k]){FP[k]=1;jget('/fin?'+(a.k==='kr'?'c=':'s=')+a.id+'&p='+fp).then(d=>{if(d.L&&d.L.length&&d.R)FN[k]=d;if(tab==='detail'&&dsel===a.id)render()}).catch(()=>setTimeout(()=>delete FP[k],30000))}return null}
 const g=(n,i)=>F.R[n]?F.R[n][i]:null;
 return{L:F.L,u:a.usd?'$B':'조 원',D:F.L.map((_,i)=>{const rev=g('rev',i),op=g('op',i),ni=g('ni',i),e=g('eps',i);
  return{rev,op,ni,opm:g('opm',i)??(rev&&op!=null?op/rev:null),npm:g('npm',i)??(rev&&ni!=null?ni/rev:null),eps:e==null?null:a.usd?e*FX:e,ta:g('ta',i),td:g('td',i),eq:g('eq',i),cash:g('cash',i),ca:g('ca',i),opcf:g('opcf',i),inv:g('inv',i),fin:g('fin',i),fcf:g('fcf',i)}})}}
/* 7) 미국 기준금리·CPI (FRED, 키 불필요) */
async function fredPoll(){if(!API)return;try{const r=await jget('/fred?id=DFEDTARGETU');if(r.length)ES['미국 기준금리']=r[r.length-1].v}catch(e){}
 try{const c=await jget('/fred?id=CPIAUCSL');if(c.length>=13)ES['CPI (YoY)']=(c[c.length-1].v/c[c.length-13].v-1)*100}catch(e){}}
if(API){fredPoll();setInterval(fredPoll,36e5)}
if(API){krPoll();econPoll();newsPoll();setInterval(krPoll,2500);setInterval(econPoll,15000);setInterval(newsPoll,3e5)}

/* 8) 전체 종목 검색 · 추가 */
let SR=[],SQ='',SB=false,SRT=0;
const applyY=(a,q)=>{if(!q||!q.price)return;const u=unitOf(a);a.p=q.price*u;a.o=q.prev*u};
async function slowPoll(){if(!API)return;const L=ASSETS.filter(a=>a.custom&&!FASTY(a.id)),k=L.filter(a=>KR.includes(a.id)).map(a=>a.id),y=L.filter(a=>!KR.includes(a.id));
 for(let i=0;i<k.length;i+=20)await krPoll(k.slice(i,i+20));
 for(let i=0;i<y.length;i+=20){const c=y.slice(i,i+20);try{const d=await jget('/q?s='+c.map(a=>YS[a.id]).join(','));c.forEach(a=>applyY(a,d[YS[a.id]]))}catch(e){}}}
const _list=list;let SERR='';
const COINDUP=id=>/-USD$/.test(id)&&!!A(id.replace(/-USD$/,''));
window.list=function(){_list();const s=q.trim();if(!API)return;if(!s){SQ='';SR=[];SERR='';return}
 if(SQ!==s){SQ=s;SB=true;SERR='';SR=[];clearTimeout(SRT);SRT=setTimeout(async()=>{try{const r=await jget('/search?q='+encodeURIComponent(s));
   if(SQ!==s)return;if(Array.isArray(r))SR=r;else{SR=[];SERR=r&&r.error?'fail':'old'}}catch(e){if(SQ===s){SR=[];SERR='fail'}}
  if(SQ===s){SB=false;if(tab==='market')list()}},350)}
 const el=document.getElementById('ml'),R=SR.filter(r=>!A(r.id)&&!COINDUP(r.id));if(!el)return;
 const lab=t=>`<div class=\"lab\" style=\"margin:14px 0 4px\">${t}</div>`,msg=t=>`<div class=\"sub\" style=\"padding:8px 2px;line-height:1.6\">${t}</div>`;
 if(el.querySelector('.row')===null)el.innerHTML='';
 el.innerHTML+=(SB&&!R.length?lab('전체 종목 검색 중…'):R.length?lab('전체 종목 검색 결과'):'')+
  (!SB&&!R.length?(SERR==='old'?msg('검색 기능이 없는 이전 버전 Worker입니다. worker/worker.js 코드를 최신으로 교체하고 Deploy해 주세요.'):SERR==='fail'?msg('검색 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'):SR.length?'':msg('전체 종목에서도 검색 결과가 없습니다. 종목명, 티커(AAPL), 6자리 종목코드로 검색해 보세요.')):'')+
  R.map(r=>{const i=SR.indexOf(r);return`<div class=\"row tap\" onclick=\"pickRes(${i})\"><div><b>${esc(r.n)}</b><div class=\"sub\">${KIND[r.k]} · ${esc(r.id)}${r.x?' · '+esc(r.x):''}</div></div><span class=\"sub\">추가</span></div>`}).join('')};
async function addAsset(r){if(A(r.id))return true;toast('시세 불러오는 중…');const a=regAsset(r),isKR=/^\d{6}$/.test(r.id);
 try{if(isKR){KR.push(r.id);await krPoll([r.id])}else{const d=await jget('/q?s='+encodeURIComponent(r.y));applyY(a,d[r.y])}}catch(e){}
 if(!(a.p>1)){ASSETS.splice(ASSETS.indexOf(a),1);delete YS[r.id];const i=KR.indexOf(r.id);if(i>=0)KR.splice(i,1);toast('시세를 불러오지 못했습니다');return false}
 a.o=a.o||a.p;S.custom=S.custom||[];S.custom.push({id:r.id,n:r.n,k:r.k,y:r.y,usd:r.usd?1:0,p:a.p,o:a.o});save();return true}
async function pickRes(i){const r=SR[i];if(r&&await addAsset(r))openDetail(r.id)}
if(API){setInterval(slowPoll,45000);setTimeout(slowPoll,1500)}

/* 9) 배당금 자동 입금 — API 연결 시 최근 12개월 실제 배당 이력(주기·금액) 기준, 미연결 시 배당수익률 기준 분기 지급 (시뮬레이션) */
const DY={},DP={};
async function loadDiv(a){const s=YS[a.id];if(!s||DP[a.id])return;DP[a.id]=1;try{DY[a.id]=await jget('/div?s='+encodeURIComponent(s));if(tab==='detail'&&dsel===a.id)render()}catch(e){setTimeout(()=>delete DP[a.id],6e4)}}
function divTick(){S.divAt=S.divAt||{};const n=Date.now();let ch=0;
 Object.keys(S.divAt).forEach(id=>{if(!S.hold[id])delete S.divAt[id]});
 for(const id of Object.keys(S.hold)){const a=A(id),h=S.hold[id];if(!a||!['kr','us','etf'].includes(a.k))continue;if(!S.divAt[id])S.divAt[id]=n;
  let per,amt;if(API){const d=DY[id];if(!d){loadDiv(a);continue}if(!d.n)continue;per=365/d.n*DAY;amt=d.sum/d.n*(a.usd?FX:1)}else{per=90*DAY;amt=a.p*info(a).DIV/100/4}
  while(n-S.divAt[id]>=per){S.divAt[id]+=per;const v=h.q*amt;if(!(v>0))break;S.cash+=v;addTx('div',a.n+' 배당금 ('+(+h.q.toFixed(4))+'주)',v);note(a.n+' 배당금 '+sg(v)+' 지급');ch=1}}
 if(ch){snap();if(!document.getElementById('m').innerHTML)render()}}
setInterval(divTick,3e4);setTimeout(divTick,3000);
/* 10) 한국 기준금리·국고채 3년·10년 (ECOS) — Worker에 ECOS_KEY가 없으면 건너뜀(샘플 금리 유지). 채권 가격 계산은 bonds.js */
async function ecosPoll(){if(!API)return;try{const d=await jget('/ecos');if(d.error)return;if(d.base)ES['한국 기준금리']=d.base;
 if(d.ktb){KTBY=d.ktb;setBY('KTB3',d.ktb,d.ktbPrev)}if(d.ktb10)setBY('KTB10',d.ktb10,d.ktb10Prev)}catch(e){}}
if(API){ecosPoll();setInterval(ecosPoll,6e5)}
