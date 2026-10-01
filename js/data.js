/* ===== data layer (mock; swap fetchPrices() for a real API proxy later) ===== */
let FX=1470.2;
const ASSETS=[
{id:'005930',n:'삼성전자',k:'kr',p:82500,vol:.012},{id:'000660',n:'SK하이닉스',k:'kr',p:231000,vol:.018},{id:'005380',n:'현대차',k:'kr',p:248000,vol:.013},
{id:'AAPL',n:'Apple',k:'us',p:228*FX,vol:.011,usd:1},{id:'NVDA',n:'NVIDIA',k:'us',p:135*FX,vol:.022,usd:1},{id:'TSLA',n:'Tesla',k:'us',p:250*FX,vol:.026,usd:1},
{id:'069500',n:'KODEX 200',k:'etf',p:38200,vol:.007},{id:'SPY',n:'SPDR S&P 500',k:'etf',p:570*FX,vol:.008,usd:1},
{id:'GOLD',n:'금 (1g)',k:'gold',p:190000,vol:.006},{id:'SILVER',n:'은 (1g)',k:'silver',p:2400,vol:.011},
{id:'BTC',n:'Bitcoin',k:'coin',p:95000000,vol:.02},{id:'ETH',n:'Ethereum',k:'coin',p:3600000,vol:.025},{id:'KTB',n:'한국 국채 3Y',k:'bond',p:10000,vol:.0015}];
const KIND={kr:'한국 주식',us:'미국 주식',etf:'ETF',gold:'금',silver:'은',coin:'코인',bond:'채권'};
const A=id=>ASSETS.find(a=>a.id===id);
function fetchPrices(){ASSETS.forEach(a=>{a.o=a.o||a.p;a.p=Math.max(1,a.p*(1+(Math.random()-.5)*a.vol*.5))})} // API 연결 시 이 함수만 교체

/* ===== 난이도 (시작 금액 · 시간당 급여 · 공부 보너스 구간 · 게임 승리 확률 보정). 거래 수수료는 0.015% 고정 ===== */
const FEE=.00015,DIFF_ORDER=['easy','normal','hard'];
const LATE=.03; // 청구서 납부 기한(7일)을 넘기면 청구액의 3% 연체료 (한 번)
/* 생활비 [항목, 월 금액, 계절] — 계절: e=전기(여름·겨울↑), g=가스·난방(겨울↑). 쉬움은 생활비 청구 없음 */
const BILLS_N=[['월세',450000],['관리비',70000],['전기요금',25000,'e'],['가스·난방',20000,'g'],['수도요금',10000],['인터넷',22000],['통신비',50000],['식비·생필품',250000],['교통비',55000]],
 BILLS_H=[['월세',500000],['관리비',80000],['전기요금',30000,'e'],['가스·난방',25000,'g'],['수도요금',12000],['인터넷',25000],['통신비',55000],['식비·생필품',280000],['교통비',60000]];
const DIFF={
 easy:{n:'쉬움',start:3e6,wage:15000,odds:1,loan:.055,tiers:[[0,0],[2,.1],[4,.2],[6,.35],[8,.5]]},
 normal:{n:'보통',start:2e6,wage:10320,odds:.85,loan:.075,bills:BILLS_N,tiers:[[0,0],[2,.05],[4,.1],[6,.2],[8,.3]]},
 hard:{n:'어려움',start:1e6,wage:7000,odds:.7,loan:.095,bills:BILLS_H,tiers:[[0,0],[3,.02],[5,.05],[8,.1],[10,.15]]}};
