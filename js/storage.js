/* ===== storage ===== */
const KEY='study-invest-v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function demo(k){k=DIFF[k]?k:'normal';const Q=DIFF[k],d=Date.now(),D=864e5,a=Q.start;
 return{onb:0,cash:a,wage:Q.wage,fee:FEE,tiers:Q.tiers.map(x=>x.slice()),diff:k,hold:{},tx:[{t:d,ty:'etc',m:'초기 자금 지급',a}],study:[],hist:[{t:d-D,v:a},{t:d,v:a}],start:a,realized:0,theme:'',bank:[],notes:[],al:{},gm:0,bills:[],loans:[],plan:[20,40,15,10,5,3,5,2]}}
function applyDiff(){S.diff=DIFF[S.diff]?S.diff:'normal';const Q=DIFF[S.diff];S.wage=Q.wage;S.tiers=Q.tiers.map(x=>x.slice());S.fee=FEE}
let S=load()||demo(),tab='home',run=null,detail=null,period=30;S.bank=S.bank||[];S.notes=S.notes||[];S.al=S.al||{};S.gm=S.gm??0;S.bills=S.bills||[];S.loans=S.loans||[];S.plan=S.plan||[20,40,15,10,5,3,5,2];applyDiff();
