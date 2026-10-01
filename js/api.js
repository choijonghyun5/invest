/* 실시간 시세 계층 — data.js의 fetchPrices()를 덮어씁니다. 실패하면 자동으로 mock으로 fallback.
   - BTC/ETH: Binance 공개 WebSocket (키 불필요, 틱 단위 실시간)
   - 주식/ETF/금/은/환율: Cloudflare Worker 프록시(worker/worker.js) 경유 Yahoo Finance (3~5초 폴링)
   API 키는 프론트에 두지 않습니다. 프록시 주소는 더보기 > 실시간 시세에서 입력합니다. */
let KRLIVE=false,_st='';try{_st=localStorage.getItem('si-api')||''}catch(e){}
const API=(_st||window.API_BASE||'').replace(/\/$/,'');
let APIST=API?'연결 중':'Mock (프록시 미설정)',wsLive=false;
const YS={'005930':'005930.KS','000660':'000660.KS','005380':'005380.KS',AAPL:'AAPL',NVDA:'NVDA',TSLA:'TSLA','069500':'069500.KS',SPY:'SPY',GOLD:'GC=F',SILVER:'SI=F'};
const _mock=window.fetchPrices;
function mock(){const k=wsLive?['BTC','ETH'].map(i=>A(i).p):null;_mock();if(k){A('BTC').p=k[0];A('ETH').p=k[1]}}
window.fetchPrices=async function(){
 if(!API){mock();return}
 try{
  const r=await fetch(API+'/q?s='+['KRW=X',...Object.values(YS)].join(',')),d=await r.json();
  if(d['KRW=X']&&d['KRW=X'].price)FX=d['KRW=X'].price;
  for(const [id,sym] of Object.entries(YS)){const q=d[sym];if(!q||!q.price||(KRLIVE&&/^\d{6}$/.test(id)))continue;const a=A(id),u=(id==='GOLD'||id==='SILVER')?FX/31.1035:a.usd?FX:1;a.p=q.price*u;a.o=q.prev*u}
  const b=A('KTB');b.p*=1+(Math.random()-.5)*.0007; // 국채는 mock 유지
  APIST='실시간 연결 (Yahoo)';
 }catch(e){APIST='연결 실패 · Mock 사용';mock()}
};
function openWS(){try{const w=new WebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker');
 w.onmessage=e=>{const m=JSON.parse(e.data).data,a=A(m.s==='BTCUSDT'?'BTC':'ETH');a.p=+m.c*FX;a.o=+m.o*FX;wsLive=true};
 w.onclose=()=>{wsLive=false;setTimeout(openWS,3000)}}catch(e){}}
openWS();
