/* ===== 구글 드라이브 자동 백업 (Google Identity Services + Drive appDataFolder) =====
   - 앱 전용 숨김 폴더(appDataFolder)만 사용하므로 내 드라이브의 다른 파일에는 접근하지 않습니다.
   - 연결 상태·토큰은 S와 분리해 localStorage('si-gd')에 저장합니다 (백업 파일에 포함되지 않음). */
const GD_CID='516093946835-qkq6q5tloe2f5p9dmucmafq07nrdbadp.apps.googleusercontent.com',
 GD_SCOPE='https://www.googleapis.com/auth/drive.appdata',GD_FILE='study-invest-backup.json',GD_KEY='si-gd',GD_EVERY=5*60*1000;
let gdSt=(()=>{try{return JSON.parse(localStorage.getItem(GD_KEY))||{}}catch(e){return{}}})(),
 gdTc=null,gdRes=null,gdBusy=false,gdMsg='',gdDirty=true,gdFrozen=false,gdArmed=false;
const gdPut=()=>{try{localStorage.setItem(GD_KEY,JSON.stringify(gdSt))}catch(e){}},
 gdOk=()=>!!gdSt.tok&&gdSt.exp>Date.now()+6e4,
 gdTime=t=>t?new Date(t).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'없음';

/* save()에 변경 표시를 추가 */
const _gdSave=save;
save=function(){if(gdFrozen)return;_gdSave();gdDirty=true};

/* ---- 인증 ---- */
function gdAuth(){return new Promise((ok,no)=>{
 if(!(window.google&&google.accounts&&google.accounts.oauth2))return no(new Error('구글 로그인 스크립트를 불러오지 못했습니다 (인터넷 연결 확인)'));
 if(!gdTc)gdTc=google.accounts.oauth2.initTokenClient({client_id:GD_CID,scope:GD_SCOPE,
  callback:r=>{const w=gdRes;gdRes=null;if(!w)return;
   if(r.error)return w.no(new Error(r.error_description||r.error));
   if(!google.accounts.oauth2.hasGrantedAllScopes(r,GD_SCOPE))return w.no(new Error('드라이브 접근 권한이 허용되지 않았습니다'));
   gdSt.tok=r.access_token;gdSt.exp=Date.now()+(+r.expires_in||3600)*1000;gdPut();w.ok(r.access_token)},
  error_callback:e=>{const w=gdRes;gdRes=null;if(w)w.no(new Error(e&&e.type==='popup_closed'?'로그인 창이 닫혔습니다':e&&e.type==='popup_failed_to_open'?'팝업이 차단되었습니다':'로그인 실패'))}});
 gdRes={ok,no};gdTc.requestAccessToken({prompt:''})})}

/* ---- Drive REST ---- */
async function gdApi(url,opt){if(!gdOk()){const e=new Error('연결이 만료되었습니다');e.need=1;throw e}
 const r=await fetch(url,{...(opt||{}),headers:{...((opt&&opt.headers)||{}),Authorization:'Bearer '+gdSt.tok}});
 if(r.status===401){gdSt.tok='';gdPut();const e=new Error('연결이 만료되었습니다');e.need=1;throw e}
 if(!r.ok){let m='';try{m=(await r.json()).error.message}catch(e){}const e=new Error('Drive 오류 '+r.status+(m?' · '+m:''));e.code=r.status;throw e}
 return r}
async function gdFind(){const r=await gdApi('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=1&fields='+encodeURIComponent('files(id,modifiedTime)')+'&q='+encodeURIComponent(`name='${GD_FILE}' and trashed=false`));
 const j=await r.json();return j.files&&j.files[0]||null}
async function gdUpload(data){let id=gdSt.fid;if(!id){const f=await gdFind();id=f&&f.id}
 if(id){try{await gdApi('https://www.googleapis.com/upload/drive/v3/files/'+id+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'application/json'},body:data});gdSt.fid=id;return}catch(e){if(e.code!==404)throw e}}
 const b='si'+Date.now(),body=`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:GD_FILE,parents:['appDataFolder']})}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${data}\r\n--${b}--`;
 const r=await gdApi('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body});
 gdSt.fid=(await r.json()).id}

/* ---- 백업 ---- */
async function gdBackup(manual){if(gdBusy||!gdSt.on)return;
 if(!gdOk()){gdArm();if(manual){gdMsg='연결이 만료되었습니다. 아래 버튼으로 다시 연결해 주세요';render()}return}
 gdBusy=true;gdMsg='백업 중…';if(tab==='more'&&!document.getElementById('m').innerHTML)render();
 try{gdDirty=false;await gdUpload(JSON.stringify({app:'study-invest',v:1,t:Date.now(),S}));gdSt.last=Date.now();gdSt.err='';gdMsg='';gdPut();if(manual)toast('드라이브에 백업했습니다')}
 catch(e){gdDirty=true;gdMsg=e.need?'연결이 만료되었습니다. 다시 연결해 주세요':'백업 실패 · '+e.message;gdSt.err=gdMsg;gdPut();if(e.need)gdArm();if(manual)toast(gdMsg)}
 gdBusy=false;if(tab==='more'&&!document.getElementById('m').innerHTML)render()}

/* 토큰이 만료되면 다음 터치 때 조용히 재연결 시도 (팝업은 사용자 동작 안에서만 열 수 있음). 실패하면 10분 뒤 재시도 */
function gdArm(){if(gdArmed||!gdSt.on||Date.now()<(gdSt.retry||0))return;gdArmed=true;
 const h=async()=>{gdArmed=false;removeEventListener('pointerdown',h,true);
  try{await gdAuth();gdSt.retry=0;gdPut();gdBackup()}catch(e){gdSt.retry=Date.now()+10*60*1000;gdPut();gdMsg='자동 재연결 실패 · '+e.message;if(tab==='more')render()}};
 addEventListener('pointerdown',h,true)}
function gdTick(){if(!gdSt.on||!gdDirty||gdBusy)return;if(Date.now()-(gdSt.last||0)<GD_EVERY)return;gdBackup()}
setInterval(gdTick,60000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&gdSt.on&&gdDirty&&!gdBusy&&Date.now()-(gdSt.last||0)>3e4)gdBackup()});
if(gdSt.on)setTimeout(()=>{gdOk()?gdBackup():gdArm()},3000);

/* ---- 연결 / 해제 / 복원 ---- */
async function gdConnect(){try{await gdAuth();gdSt.on=1;gdSt.retry=0;gdPut();gdMsg='';toast('구글 드라이브 연결됨');await gdBackup(true)}catch(e){gdMsg='연결 실패 · '+e.message;toast(gdMsg)}render()}
function gdDisconnect(){if(!confirm('자동 백업을 끌까요? 드라이브에 저장된 백업 파일은 그대로 남습니다.'))return;
 try{if(gdSt.tok&&window.google&&google.accounts&&google.accounts.oauth2)google.accounts.oauth2.revoke(gdSt.tok,()=>{})}catch(e){}
 gdSt={};gdPut();gdMsg='';render();toast('자동 백업이 해제되었습니다')}
async function gdRestore(){try{if(!gdOk())await gdAuth();const f=await gdFind();if(!f)return toast('드라이브에 백업이 없습니다');
 const j=await(await gdApi('https://www.googleapis.com/drive/v3/files/'+f.id+'?alt=media')).json(),s=j&&j.S;
 if(!s||typeof s!=='object'||s.cash==null||!s.hold)throw new Error('백업 파일 형식이 올바르지 않습니다');
 if(!confirm('백업 시각 '+new Date(j.t||f.modifiedTime).toLocaleString('ko-KR')+'\n\n이 백업으로 복원할까요? 이 기기의 현재 데이터는 덮어써집니다.'))return;
 gdFrozen=true;gdSt.fid=f.id;gdSt.last=Date.now();gdPut();localStorage.setItem(KEY,JSON.stringify(s));location.reload()}
 catch(e){gdFrozen=false;toast('복원 실패 · '+e.message);gdMsg='복원 실패 · '+e.message;render()}}

/* ---- 더보기 카드 ---- */
function gdView(){const on=!!gdSt.on,st=gdMsg||gdSt.err;
 return`<div class="lab">구글 드라이브 백업</div><div class="card"><div class="sub" style="line-height:1.6">${on?`자동 백업 켜짐 · 마지막 백업 ${gdTime(gdSt.last)}`:'내 구글 드라이브의 앱 전용 폴더에 진행 상황을 자동으로 백업합니다. 다른 파일에는 접근하지 않습니다.'}</div>${st?`<div class="sub ${/실패|만료|차단|닫혔/.test(st)?'rise':''}" style="margin-top:6px;line-height:1.5">${st}</div>`:''}
 ${on?`<div class="grid g2" style="gap:8px;margin-top:12px"><button class="btn s w" onclick="gdBackup(true)" ${gdBusy?'disabled':''}>지금 백업</button><button class="btn s w" onclick="gdRestore()" ${gdBusy?'disabled':''}>백업에서 복원</button></div>${gdOk()?'':'<button class="btn w" style="margin-top:8px" onclick="gdConnect()">다시 연결</button>'}<button class="btn s w" style="margin-top:8px" onclick="gdDisconnect()">연결 해제</button>`
 :`<button class="btn w" style="margin-top:12px" onclick="gdConnect()">구글 드라이브 연결</button><button class="btn s w" style="margin-top:8px" onclick="gdRestore()">기존 백업에서 복원</button>`}</div>`}
const _gdMore=V.more;V.more=()=>_gdMore().replace('<div class="lab">화면</div>',gdView()+'<div class="lab">화면</div>');
