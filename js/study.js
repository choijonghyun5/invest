/* ===== study -> pay ===== */
function finishStudy(sec){
 if(sec<1)return;const today=S.study.filter(s=>sameDay(s.t,Date.now())).reduce((x,s)=>x+s.sec,0)+sec;
 const h=today/3600;let rate=0;S.tiers.forEach(([th,r])=>{if(h>=th)rate=r});
 const base=sec/3600*S.wage,bonus=base*rate;
 S.study.push({t:Date.now(),sec,base,bonus});S.cash+=base+bonus;
 addTx('study','공부 급여 ('+hm(sec)+')',base);if(bonus>0)addTx('study','공부 보너스 +'+rate*100+'%',bonus);
 snap();note('급여 '+sg(base+bonus)+' 지급');
}
function toggleTimer(){
 if(run){const el=(Date.now()-run)/1000;run=null;finishStudy(el)}else run=Date.now();render()}
const elapsed=()=>run?(Date.now()-run)/1000:0;
const clock=s=>[s/3600,s%3600/60,s%60].map(x=>String(Math.floor(x)).padStart(2,'0')).join(':');
