/* ===== mini games (virtual game money only, fully separated from assets) ===== */
const gm=n=>Math.round(n).toLocaleString('ko-KR')+' G';
const gseg=(items,cur,v)=>`<div class="seg" style="margin-top:0">${items.map(([k,l])=>`<button class="${cur===k?'on':''}" onclick="${v}=${typeof k==='number'?k:`'${k}'`};render()">${l}</button>`).join('')}</div>`;
function gameView(){const g=(t,d,body,k)=>`<div class="card" style="margin-top:12px"><b>${t}</b><div class="sub" style="margin-bottom:12px">${d}</div>${body}<button class="btn w" style="margin-top:4px" onclick="playG('${k}')" ${S.gm<=0?'disabled':''}>플레이</button></div>`;
 return`<div class="sub" style="cursor:pointer;margin-bottom:14px" onclick="tab='more';render()">‹ 더보기</div><h1 style="margin-bottom:8px">게임</h1><div class="sub" style="margin-bottom:14px;line-height:1.6">게임머니는 실제 자산과 완전히 분리되어 있으며 현금이나 투자자산으로 전환할 수 없습니다. 재미를 위한 가상 기능입니다.</div>
 <div class="card"><div class="sub">게임머니</div><div class="big" style="font-size:30px">${gm(S.gm)}</div><div class="sub" style="min-height:22px;margin-top:6px">${gres}</div>${S.gm<=0?'<button class="btn s w" style="margin-top:10px" onclick="S.gm=100000;gres=\'\';save();render()">게임머니 충전 (100,000 G)</button>':''}</div>
 <div class="lab">베팅 금액</div><input type="number" inputmode="numeric" value="${gbet}" oninput="gbet=+this.value">
 ${g('코인 플립','맞히면 베팅액만큼 획득',gseg([['h','앞면'],['t','뒷면']],gcoin,'gcoin'),'coin')}
 ${g('주사위','숫자를 맞히면 베팅액의 4배 획득',gseg([1,2,3,4,5,6].map(n=>[n,n]),gdice,'gdice'),'dice')}
 ${g('룰렛','색을 맞히면 베팅액만큼 획득 · 0은 초록(패배)',gseg([['r','빨강'],['b','검정']],grl,'grl'),'rl')}`}
function playG(k){const b=Math.floor(gbet);if(!(b>0))return toast('베팅 금액을 입력하세요');if(b>S.gm)return toast('게임머니가 부족합니다');let win=false,m,mult=1;
 if(k==='coin'){const r=Math.random()<.5?'h':'t';win=r===gcoin;m=r==='h'?'앞면':'뒷면'}
 if(k==='dice'){const r=1+Math.floor(Math.random()*6);win=r===gdice;m='주사위 '+r;mult=4}
 if(k==='rl'){const r=Math.floor(Math.random()*37),red=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(r);win=r>0&&(red?'r':'b')===grl;m='룰렛 '+r+(r===0?' (초록)':red?' (빨강)':' (검정)')}
 S.gm+=win?b*mult:-b;gres=m+' · '+(win?'승리 +'+gm(b*mult):'패배 -'+gm(b));save();render()}
