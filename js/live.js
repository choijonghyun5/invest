/* 실데이터 계층 v2 — api.js 다음에 로드. 프록시(API) 미설정/실패 시 기존 mock이 그대로 쓰입니다.
   한국 종목 실시간(네이버) · 실제 차트(Yahoo) · 한국 종목 지표 · 실제 뉴스 · 지수/유가/VIX */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KR=ASSETS.filter(a=>/^\d{6}$/.test(a.id)).map(a=>a.id);
const ESYM={KOSPI:'^KS11',KOSDAQ:'^KQ11','S&P 500':'^GSPC',NASDAQ:'^IXIC','Dow Jones':'^DJI','WTI 국제유가':'CL=F','미국 국채 10Y':'^TNX',VIX:'^VIX','USD/KRW':'KRW=X','금 (1g)':'GC=F'};
let KRST='',NREAL=false;const HC={},HP={},KI={},KIP={},ES={};
const unitOf=a=>(a.id==='GOLD'||a.id==='SILVER')?FX/31.1035:a.usd?FX:1;
const jget=async p=>{const r=await fetch(API+p);if(!r.ok)throw 0;return r.json()};
/* 1) 한국 종목 실시간 (2.5초) */
async function krPoll(){if(!API)return;try{const d=await jget('/kr?c='+KR.join(',')),n0=KR.length;let n=0;
 for(const id of KR){const q=d[id];if(!q||!q.price)continue;const a=A(id),v=+q.vol||0,p=+q.price;a.p=p;a.o=+q.prev||a.o;
  a.real={o:+q.open,hv:+q.high,lv:+q.low,vol:v,amt:(+q.amt<v*p/100?+q.amt*1e6:+q.amt)};n++}
 KRLIVE=n>0;KRST=n?'한국 종목 실시간 (네이버 증권)':'한국 종목 응답 없음 · Yahoo 지연 시세 사용'}catch(e){KRLIVE=false;KRST='한국 실시간 연결 실패'}
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
