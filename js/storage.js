/* ===== storage ===== */
const KEY='study-invest-v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function demo(){const d=Date.now(),D=864e5,H=[],T=[],St=[];let v=9.2e6;
 for(let i=60;i>=1;i--){v+=(Math.random()-.42)*9e4+9000;H.push({t:d-i*D,v})}
 for(let i=10;i>=1;i--){const sec=(2+Math.random()*3)*3600|0,b=sec/3600*10320,r=sec>14400?.1:sec>7200?.05:0;St.push({t:d-i*D,sec,base:b,bonus:b*r});}
 const hold={'005930':{q:12,c:78000},'AAPL':{q:5,c:210*FX},'069500':{q:39,c:37000},'GOLD':{q:1.5,c:180000},'BTC':{q:.002,c:90000000},'KTB':{q:100,c:10000}};
 return{cash:2e6,wage:10320,fee:.00015,tiers:[[0,0],[2,.05],[4,.1],[6,.2],[8,.3]],hold,tx:[{t:d-D,ty:'study',m:'공부 급여',a:30960}],study:St,hist:H,start:v,realized:0,theme:'',bank:[],notes:[],al:{},gm:100000,plan:[20,40,15,10,5,3,5,2]}}
let S=load()||demo(),tab='home',run=null,acc=false,detail=null,period=60;S.bank=S.bank||[];S.notes=S.notes||[];S.al=S.al||{};S.gm=S.gm??100000;S.plan=S.plan||[20,40,15,10,5,3,5,2];
