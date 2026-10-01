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
const DIFF={
 easy:{n:'쉬움',start:5e5,wage:15000,odds:1,tiers:[[0,0],[2,.1],[4,.2],[6,.35],[8,.5]]},
 normal:{n:'보통',start:1e5,wage:10320,odds:.85,tiers:[[0,0],[2,.05],[4,.1],[6,.2],[8,.3]]},
 hard:{n:'어려움',start:5e4,wage:7000,odds:.7,tiers:[[0,0],[3,.02],[5,.05],[8,.1],[10,.15]]}};
