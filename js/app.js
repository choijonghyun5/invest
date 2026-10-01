/* ===== shell ===== */
const TABS=[['home','홈'],['study','공부'],['market','시장'],['portfolio','자산'],['tx','거래'],['more','더보기']];
function theme(){S.theme?document.documentElement.dataset.theme=S.theme:delete document.documentElement.dataset.theme}
if('scrollRestoration' in history)history.scrollRestoration='manual';let lastTab=null;
function render(){const chg=tab!==lastTab;lastTab=tab;theme();document.getElementById('app').innerHTML=V[tab]();if(tab==='market')list();if(chg)scrollTo(0,0);
 document.getElementById('nav').innerHTML=TABS.map(([k,l])=>`<button class="${tab===k||(tab==='detail'&&k==='market')||(tab==='game'&&k==='more')?'on':''}" onclick="tab='${k}';render();scrollTo(0,0)">${l}</button>`).join('')}
setInterval(()=>{const t=document.getElementById('tm');if(t)t.textContent=clock(elapsed())},250);
setInterval(()=>{fetchPrices();alerts();if(!document.getElementById('m').innerHTML&&!['market','detail','game'].includes(tab)&&!document.activeElement.matches('input'))render();if(tab==='market')list();if(tab==='detail'){const e=document.getElementById('dh');if(e)e.innerHTML=dhead(A(dsel))}},4000);
setInterval(()=>{processBank();snap()},30000);processBank();render();addEventListener('load',()=>scrollTo(0,0));
/* 확대·좌우 이동 차단 */
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault()));
document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false});
/* 처음 실행하면 난이도 · 목표 배분 설정 */
if(S.onb===0)newSim(true);
