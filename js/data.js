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
