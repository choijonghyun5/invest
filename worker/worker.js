// Cloudflare Worker v2 — 시세 프록시 (API 키 불필요, CORS 허용)
//  /q?s=SYM,..        Yahoo 시세 (미국주식·ETF·금·은·환율·지수)
//  /kr?c=005930,..    네이버 증권 실시간 체결가 (한국 종목, 지연 없음)
//  /krinfo?c=005930   네이버 증권 PER·PBR·EPS·시가총액·배당 등
//  /chart?s=SYM&d=N   Yahoo 과거 시세 (N일)
//  /news?q=검색어      Google News RSS (한국어)
//  /fin?c=005930|s=AAPL&p=y|q  재무제표 (네이버 / Yahoo)
//  /fred?id=DFEDTARGETU       FRED 경제지표(키 불필요)
const H={'access-control-allow-origin':'*','content-type':'application/json; charset=utf-8'};
const J=(o,t=0)=>new Response(JSON.stringify(o),{headers:{...H,'cache-control':'public, max-age='+t}});
const UA={'user-agent':'Mozilla/5.0','referer':'https://finance.naver.com/'};
const num=x=>{const n=parseFloat(String(x??'').replace(/[^\d.\-]/g,''));return isNaN(n)?null:n};
export default{async fetch(req){
 const u=new URL(req.url),p=u.pathname,g=k=>u.searchParams.get(k)||'';
 try{
 if(p==='/q'){const out={};await Promise.all(g('s').split(',').filter(Boolean).slice(0,30).map(async s=>{try{
  const m=(await(await fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(s)+'?interval=1m&range=1d',{headers:UA,cf:{cacheTtl:3,cacheEverything:true}})).json()).chart.result[0].meta;
  out[s]={price:m.regularMarketPrice,prev:m.chartPreviousClose,time:m.regularMarketTime}}catch(e){}}));return J(out)}
 if(p==='/kr'){const c=g('c').split(',').filter(x=>/^\d{6}$/.test(x)).slice(0,20).join(',');
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
  if(/^\d{6}$/.test(c)){const f=(await(await fetch('https://m.stock.naver.com/api/stock/'+c+'/finance/'+(q?'quarter':'annual'),{headers:UA,cf:{cacheTtl:3600,cacheEverything:true}})).json()).financeInfo||{},ks=(f.trTitleList||[]).filter(t=>t.isConsensus!=='Y').slice(-4);
   L=ks.map(t=>t.title.replace(/\.$/,''));const row=n=>{const r=(f.rowList||[]).find(x=>x.title===n);return r?ks.map(t=>num(r.columns?.[t.key]?.value)):null};
   R={rev:mp(row('매출액'),x=>x/1e4),op:mp(row('영업이익'),x=>x/1e4),ni:mp(row('당기순이익'),x=>x/1e4),eps:row('EPS'),opm:mp(row('영업이익률'),x=>x/100),npm:mp(row('순이익률'),x=>x/100)}}
  else if(s){const T={rev:'TotalRevenue',op:'OperatingIncome',ni:'NetIncome',eps:'BasicEPS',ta:'TotalAssets',td:'TotalLiabilitiesNetMinorityInterest',eq:'StockholdersEquity',cash:'CashAndCashEquivalents',ca:'CurrentAssets',opcf:'OperatingCashFlow',inv:'InvestingCashFlow',fin:'FinancingCashFlow',fcf:'FreeCashFlow'},pre=q?'quarterly':'annual';
   const res=(await(await fetch('https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/'+encodeURIComponent(s)+'?merge=false&padTimeSeries=true&period1=1400000000&period2='+Math.floor(Date.now()/1e3)+'&type='+Object.values(T).map(v=>pre+v).join(','),{headers:UA,cf:{cacheTtl:3600,cacheEverything:true}})).json()).timeseries?.result||[],by={};
   res.forEach(r=>{const k=r.meta.type[0];by[k]=r[k]||[]});
   const ds=[...new Set(Object.values(by).flatMap(a=>a.filter(Boolean).map(x=>x.asOfDate)))].sort().slice(-4);L=ds.map(x=>x.slice(0,7));
   for(const [k,v] of Object.entries(T))R[k]=ds.map(d=>{const n=((by[pre+v]||[]).find(y=>y&&y.asOfDate===d)||{}).reportedValue?.raw;return n==null?null:k==='eps'?n:n/1e9})}
  return J({L,R},3600)}
 if(p==='/news'){const x=await(await fetch('https://news.google.com/rss/search?hl=ko&gl=KR&ceid=KR:ko&q='+encodeURIComponent(g('q')+' when:2d'),{headers:UA,cf:{cacheTtl:300,cacheEverything:true}})).text(),items=[];
  const T=(s,k)=>((s.match(new RegExp('<'+k+'[^>]*>([\\s\\S]*?)</'+k+'>'))||[])[1]||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  for(const m of x.matchAll(/<item>([\s\S]*?)<\/item>/g)){items.push({title:T(m[1],'title'),link:T(m[1],'link'),src:T(m[1],'source'),t:Date.parse(T(m[1],'pubDate'))||0});if(items.length>=8)break}
  return J(items,300)}
 }catch(e){return J({error:String(e)})}
 return J({ok:true,v:2})}}
