// Cloudflare Worker v3 — 시세 프록시 (API 키 불필요, CORS 허용)
//  /q?s=SYM,..        Yahoo 시세 (미국주식·ETF·금·은·환율·지수)
//  /kr?c=005930,..    네이버 증권 실시간 체결가 (한국 종목, 지연 없음)
//  /krinfo?c=005930   네이버 증권 PER·PBR·EPS·시가총액·배당 등
//  /chart?s=SYM&d=N   Yahoo 과거 시세 (N일)
//  /news?q=검색어      Google News RSS (한국어)
//  /search?q=삼성|AAPL        종목 검색 (네이버 + Yahoo)
//  /fin?c=005930|s=AAPL&p=y|q  재무제표 (네이버 / Yahoo)
//  /fred?id=DFEDTARGETU       FRED 경제지표(키 불필요)
//  /div?s=SYM                 최근 12개월 배당 이력(Yahoo)
//  /ecos                      한국 기준금리·국고채 3년·10년 (Worker 환경변수 ECOS_KEY 필요)
const H={'access-control-allow-origin':'*','content-type':'application/json; charset=utf-8'};
const J=(o,t=0)=>new Response(JSON.stringify(o),{headers:{...H,'cache-control':'public, max-age='+t}});
const UA={'user-agent':'Mozilla/5.0','referer':'https://finance.naver.com/'};
const num=x=>{const n=parseFloat(String(x??'').replace(/[^\d.\-]/g,''));return isNaN(n)?null:n};
// 네이버·Yahoo 검색이 모두 실패했을 때만 쓰는 대표 종목 목록 [코드, 이름, 시장(S=코스피,Q=코스닥), 영문/별칭, e=ETF]
const KRFALL=[['005930','삼성전자','S','samsung'],['000660','SK하이닉스','S','hynix 하이닉스'],['373220','LG에너지솔루션','S','lges'],['207940','삼성바이오로직스','S','samsung biologics'],['005380','현대차','S','hyundai 현대자동차'],['000270','기아','S','kia'],['068270','셀트리온','S','celltrion'],['035420','NAVER','S','네이버 naver'],['035720','카카오','S','kakao'],['005490','POSCO홀딩스','S','포스코 posco'],['051910','LG화학','S','lg chem'],['006400','삼성SDI','S','samsung sdi'],['105560','KB금융','S','kb'],['055550','신한지주','S','신한 shinhan'],['086790','하나금융지주','S','하나 hana'],['316140','우리금융지주','S','우리 woori'],['012330','현대모비스','S','mobis'],['028260','삼성물산','S',''],['066570','LG전자','S','lg electronics'],['003550','LG','S',''],['034730','SK','S',''],['017670','SK텔레콤','S','skt'],['030200','KT','S',''],['032830','삼성생명','S',''],['015760','한국전력','S','한전 kepco'],['009150','삼성전기','S',''],['010130','고려아연','S',''],['011200','HMM','S','현대상선'],['003670','포스코퓨처엠','S',''],['247540','에코프로비엠','Q','ecopro bm'],['086520','에코프로','Q','ecopro'],['196170','알테오젠','Q','alteogen'],['028300','HLB','Q',''],['263750','펄어비스','Q','pearl abyss'],['293490','카카오게임즈','Q','kakao games'],['323410','카카오뱅크','S','kakaobank'],['377300','카카오페이','S','kakaopay'],['259960','크래프톤','S','krafton'],['036570','엔씨소프트','S','ncsoft nc'],['251270','넷마블','S','netmarble'],['352820','하이브','S','hybe'],['041510','에스엠','Q','sm entertainment'],['035900','JYP Ent.','Q','jyp'],['122870','와이지엔터테인먼트','Q','yg'],['042700','한미반도체','S',''],['000810','삼성화재','S',''],['018260','삼성에스디에스','S','samsung sds'],['011070','LG이노텍','S',''],['097950','CJ제일제당','S',''],['090430','아모레퍼시픽','S',''],['033780','KT&G','S','kt&g'],['096770','SK이노베이션','S',''],['012450','한화에어로스페이스','S','hanwha aerospace'],['042660','한화오션','S',''],['329180','HD현대중공업','S',''],['009540','HD한국조선해양','S',''],['034020','두산에너빌리티','S','doosan'],['064350','현대로템','S',''],['003490','대한항공','S','korean air'],['402340','SK스퀘어','S',''],['069500','KODEX 200','S','코덱스','e'],['122630','KODEX 레버리지','S','','e'],['360750','TIGER 미국S&P500','S','타이거','e'],['133690','TIGER 미국나스닥100','S','타이거','e'],['102110','TIGER 200','S','타이거','e']];
export default{async fetch(req,env){
 const u=new URL(req.url),p=u.pathname,g=k=>u.searchParams.get(k)||'';
 try{
 if(p==='/q'){const out={};await Promise.all(g('s').split(',').filter(Boolean).slice(0,40).map(async s=>{try{
  const m=(await(await fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(s)+'?interval=1m&range=1d',{headers:UA,cf:{cacheTtl:3,cacheEverything:true}})).json()).chart.result[0].meta;
  out[s]={price:m.regularMarketPrice,prev:m.chartPreviousClose,time:m.regularMarketTime}}catch(e){}}));return J(out)}
 if(p==='/kr'){const c=g('c').split(',').filter(x=>/^\d{6}$/.test(x)).slice(0,40).join(',');
  const d=await(await fetch('https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:'+c,{headers:UA,cf:{cacheTtl:1,cacheEverything:true}})).json(),out={};
  for(const a of d.result?.areas||[])for(const x of a.datas||[])out[x.cd]={price:x.nv,prev:x.sv,open:x.ov,high:x.hv,low:x.lv,vol:x.aq,amt:x.aa,state:d.result?.name||''};
  return J(out)}
 if(p==='/krinfo'){const c=g('c');if(!/^\d{6}$/.test(c))return J({});
  const d=await(await fetch('https://m.stock.naver.com/api/stock/'+c+'/integration',{headers:UA,cf:{cacheTtl:600,cacheEverything:true}})).json(),t={};
  for(const i of d.totalInfos||[])t[i.code]=i.value;
  return J({cap:t.marketValue,per:num(t.per),pbr:num(t.pbr),eps:num(t.eps),bps:num(t.bps),div:num(t.dividendYieldRatio),hi52:num(t.highPriceOf52Weeks),lo52:num(t.lowPriceOf52Weeks)},600)}
 if(p==='/chart'){const d=Math.min(+g('d')||30,3650),r=d<=1?['1d','5m']:d<=7?['5d','30m']:d<=30?['1mo','1d']:d<=90?['3mo','1d']:d<=180?['6mo','1d']:d<=365?['1y','1d']:['5y','1wk'];
  const x=(await(await fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(g('s'))+'?range='+r[0]+'&interval='+r[1],{headers:UA,cf:{cacheTtl:60,cacheEverything:true}})).json()).chart.result[0],c=x.indicators.quote[0];
  return J({t:x.timestamp,c:c.close,o:c.open,h:c.high,l:c.low,v:c.volume},60)}
 if(p==='/fred'){const t=(await(await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id='+encodeURIComponent(g('id')),{headers:UA,cf:{cacheTtl:3600,cacheEverything:true}})).text()).trim().split('\n').slice(1).map(l=>l.split(',')).filter(r=>r[1]&&r[1]!=='.').slice(-14);
  return J(t.map(r=>({d:r[0],v:+r[1]})),3600)}
 if(p==='/fin'){const q=g('p')==='q',c=g('c'),s=g('s'),mp=(a,f)=>a&&a.map(x=>x==null?null:f(x));let L=[],R={};
  const YT={rev:'TotalRevenue',op:'OperatingIncome',ni:'NetIncome',eps:'BasicEPS',ta:'TotalAssets',td:'TotalLiabilitiesNetMinorityInterest',eq:'StockholdersEquity',cash:'CashAndCashEquivalents',ca:'CurrentAssets',opcf:'OperatingCashFlow',inv:'InvestingCashFlow',fin:'FinancingCashFlow',fcf:'FreeCashFlow'},pre=q?'quarterly':'annual';
  const yfin=async sym=>{const res=(await(await fetch('https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/'+encodeURIComponent(sym)+'?merge=false&padTimeSeries=true&period1=1400000000&period2='+Math.floor(Date.now()/1e3)+'&type='+Object.values(YT).map(v=>pre+v).join(','),{headers:UA,cf:{cacheTtl:3600,cacheEverything:true}})).json()).timeseries?.result||[],by={};
   res.forEach(r=>{const k=r.meta.type[0];by[k]=r[k]||[]});return{by,ds:[...new Set(Object.values(by).flatMap(a=>a.filter(Boolean).map(x=>x.asOfDate.slice(0,7))))].sort()}};
  const yv=(Y,k,d)=>{const n=((Y.by[pre+YT[k]]||[]).find(y=>y&&y.asOfDate.slice(0,7)===d)||{}).reportedValue;return n&&n.raw!=null?n.raw:null};
  if(/^\d{6}$/.test(c)){const f=(await(await fetch('https://m.stock.naver.com/api/stock/'+c+'/finance/'+(q?'quarter':'annual'),{headers:UA,cf:{cacheTtl:3600,cacheEverything:true}})).json()).financeInfo||{},ks=(f.trTitleList||[]).filter(t=>t.isConsensus!=='Y').slice(-4);
   L=ks.map(t=>t.title.replace(/\.$/,''));const row=n=>{const r=(f.rowList||[]).find(x=>x.title===n);return r?ks.map(t=>num(r.columns?.[t.key]?.value)):null};
   R={rev:mp(row('매출액'),x=>x/1e4),op:mp(row('영업이익'),x=>x/1e4),ni:mp(row('당기순이익'),x=>x/1e4),eps:row('EPS'),opm:mp(row('영업이익률'),x=>x/100),npm:mp(row('순이익률'),x=>x/100)};
   try{let Y=await yfin(c+'.KS');if(!Y.ds.length)Y=await yfin(c+'.KQ');for(const k of['ta','td','eq','cash','ca','opcf','inv','fin','fcf'])R[k]=L.map(l=>{const n=yv(Y,k,l.replace('.','-'));return n==null?null:n/1e12})}catch(e){}}
  else if(s){const Y=await yfin(s),ds=Y.ds.slice(-4);L=ds;for(const k of Object.keys(YT))R[k]=ds.map(d=>{const n=yv(Y,k,d);return n==null?null:k==='eps'?n:n/1e9})}
  return J({L,R},3600)}
 if(p==='/div'){const x=(await(await fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(g('s'))+'?range=2y&interval=1mo&events=div',{headers:UA,cf:{cacheTtl:3600,cacheEverything:true}})).json()).chart.result[0],D=Object.values((x.events&&x.events.dividends)||{}).filter(d=>d.date*1000>Date.now()-365*864e5);
  return J({sum:D.reduce((a,d)=>a+d.amount,0),n:D.length,last:D.length?Math.max(...D.map(d=>d.date))*1000:0},3600)}
 if(p==='/ecos'){const K=env&&env.ECOS_KEY;if(!K)return J({error:'ECOS_KEY not set'});const n=new Date(),f=d=>d.getFullYear()+String(d.getMonth()+1).padStart(2,'0'),f2=d=>f(d)+String(d.getDate()).padStart(2,'0'),B='https://ecos.bok.or.kr/api/StatisticSearch/'+K+'/json/kr/1/40/';
  const last=async u=>{const r=(await(await fetch(u)).json()).StatisticSearch;return(r&&r.row||[]).map(x=>+x.DATA_VALUE)};
  const [b,k,k10]=await Promise.allSettled([last(B+'722Y001/M/'+f(new Date(n-200*864e5))+'/'+f(n)+'/0101000'),last(B+'817Y002/D/'+f2(new Date(n-20*864e5))+'/'+f2(n)+'/010200000'),last(B+'817Y002/D/'+f2(new Date(n-20*864e5))+'/'+f2(n)+'/010210000')]);
  const bb=b.value||[],kk=k.value||[],k1=k10.value||[];return J({base:bb[bb.length-1]||null,ktb:kk[kk.length-1]||null,ktbPrev:kk[kk.length-2]||null,ktb10:k1[k1.length-1]||null,ktb10Prev:k1[k1.length-2]||null},600)}
 if(p==='/search'){const q=g('q').trim();if(!q)return J([]);
  const out=[],seen=new Set(),add=r=>{if(r.id&&!seen.has(r.id)){seen.add(r.id);out.push(r)}};
  const ETF=/KODEX|TIGER|ACE |SOL |RISE|KBSTAR|HANARO|ARIRANG|PLUS |KOSEF|TIMEFOLIO|ETF/i,K=/^\d{6}$/,KQ=/KOSDAQ|코스닥/i;
  const gj=async(u,h)=>{const r=await fetch(u,{headers:h||UA});if(!r.ok)throw new Error(r.status);return r.json()};
  const first=async us=>{for(const u of us){try{return await gj(u)}catch(e){}}return null};
  const nvAdd=i=>{if(!i)return;const code=String(i.code||i.itemCode||''),nm=i.name||i.stockName||code,ty=(i.typeCode||'')+(i.typeName||'')+(i.stockExchangeType&&i.stockExchangeType.name||'');
   if((i.nationCode==='KOR'||!i.nationCode)&&K.test(code))add({id:code,n:nm,k:(ETF.test(nm)||i.stockEndType==='etf')?'etf':'kr',y:code+(KQ.test(ty)?'.KQ':'.KS'),usd:0,x:i.typeName||'KRX'});
   else if(i.nationCode==='USA'){const t=String(i.reutersCode||code).split('.')[0];if(/^[A-Z0-9.\-]{1,10}$/.test(t))add({id:t,n:nm,k:'us',y:t,usd:1,x:i.typeName||'US'})}};
  const yhAdd=i=>{const s=i.symbol||'',n=i.shortname||i.longname||s,ty=i.quoteType;
   if(/^\d{6}\.(KS|KQ)$/.test(s))add({id:s.slice(0,6),n,k:ty==='ETF'?'etf':'kr',y:s,usd:0,x:i.exchDisp||'KRX'});
   else if((ty==='EQUITY'||ty==='ETF')&&/^[A-Z]{1,5}(-[A-Z])?$/.test(s))add({id:s,n,k:ty==='ETF'?'etf':'us',y:s,usd:1,x:i.exchDisp||''});
   else if(ty==='CRYPTOCURRENCY'&&/-USD$/.test(s))add({id:s,n,k:'coin',y:s,usd:1,x:'Crypto'})};
  const eq=encodeURIComponent(q);
  const [nv,yh,cd]=await Promise.allSettled([
   first(['https://ac.stock.naver.com/ac?target=stock&q='+eq,'https://m.stock.naver.com/front-api/search/autoComplete?query='+eq+'&target=stock']),
   first(['https://query2.finance.yahoo.com/v1/finance/search?quotesCount=10&newsCount=0&lang=en-US&q='+eq,'https://query1.finance.yahoo.com/v1/finance/search?quotesCount=10&newsCount=0&lang=en-US&q='+eq]),
   K.test(q)?gj('https://m.stock.naver.com/api/stock/'+q+'/basic'):Promise.resolve(null)]);
  const nd=nv.value||{},NL=nd.items||(nd.result&&nd.result.items)||[];
  if(cd.value&&cd.value.stockName)nvAdd({code:q,name:cd.value.stockName,nationCode:'KOR',typeName:cd.value.stockExchangeName||'',stockEndType:cd.value.stockEndType,typeCode:(cd.value.stockExchangeType&&cd.value.stockExchangeType.name)||''});
  for(const i of NL)nvAdd(i);
  for(const i of(yh.value&&yh.value.quotes)||[])yhAdd(i);
  if(!out.length){const ql=q.toLowerCase().replace(/\s+/g,'');for(const r of KRFALL){if(r[1].toLowerCase().replace(/\s+/g,'').includes(ql)||(r[3]||'').toLowerCase().includes(ql)||r[0]===q)add({id:r[0],n:r[1],k:r[4]==='e'?'etf':'kr',y:r[0]+(r[2]==='Q'?'.KQ':'.KS'),usd:0,x:r[2]==='Q'?'코스닥':'코스피'})}}
  return out.length?J(out.slice(0,15),60):J([],0)}
 if(p==='/news'){const x=await(await fetch('https://news.google.com/rss/search?hl=ko&gl=KR&ceid=KR:ko&q='+encodeURIComponent(g('q')+' when:2d'),{headers:UA,cf:{cacheTtl:300,cacheEverything:true}})).text(),items=[];
  const T=(s,k)=>((s.match(new RegExp('<'+k+'[^>]*>([\\s\\S]*?)</'+k+'>'))||[])[1]||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  for(const m of x.matchAll(/<item>([\s\S]*?)<\/item>/g)){items.push({title:T(m[1],'title'),link:T(m[1],'link'),src:T(m[1],'source'),t:Date.parse(T(m[1],'pubDate'))||0});if(items.length>=8)break}
  return J(items,300)}
 }catch(e){return J({error:String(e)})}
 return J({ok:true,v:3})}}
