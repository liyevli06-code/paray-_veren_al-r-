/* ══════════════════════════════════════════════════════════════
   ONLINE (PeerJS P2P) — otaq kodu, sürətli oyun (matchmaking), söhbət
   Qaydalar köhnə oyunla eynidir: host (Oyuncu 1) oyunu idarə edir, qonaq (Oyuncu 2) vəziyyəti alır.
   ══════════════════════════════════════════════════════════════ */
let onlineMode=false,isHost=false,peer=null,conn=null,guestConnected=false,vsBotMode=false;
let matchmakingActive=false,matchmakingPeer=null,mmWatchdog=null;
const MATCHMAKING_PREFIX='htb-mm-slot-',MATCHMAKING_SLOTS=25;

function hasPeer(){if(typeof Peer==='undefined'){toast(t('noNet'),'red');SFX.error();return false;}return true;}
function leaveOnline(){
  matchmakingActive=false;clearTimeout(mmWatchdog);mmWatchdog=null;
  try{conn&&conn.close();}catch(e){}
  try{matchmakingPeer&&matchmakingPeer.destroy();}catch(e){}
  try{peer&&peer.destroy();}catch(e){}
  peer=null;conn=null;matchmakingPeer=null;guestConnected=false;onlineMode=false;isHost=false;
  $('#chatToggle').style.display='none';$('#chatPanel').classList.remove('open');$('#onlinePill').classList.remove('show');
}

ACT.selectMode=mode=>{
  ['createPanel','joinPanel','matchmakingPanel'].forEach(id=>$('#'+id).classList.remove('show'));
  if(mode==='local'){onlineMode=false;vsBotMode=false;showConfigScreen();}
  else if(mode==='bot'){onlineMode=false;vsBotMode=true;showConfigScreen();}
  else if(mode==='create'){if(!hasPeer())return;$('#createPanel').classList.add('show');startHostPeer();}
  else if(mode==='join'){
    $('#joinPanel').classList.add('show');
    const pre=new URLSearchParams(location.search).get('room');
    if(pre)$('#joinCodeInput').value=pre.replace(/\D/g,'').slice(0,4);
    $('#joinStatusText').textContent=t('enterCode');$('#joinDot').classList.remove('on');
    setTimeout(()=>$('#joinCodeInput').focus(),50);
  }
  else if(mode==='matchmaking'){if(!hasPeer())return;$('#matchmakingPanel').classList.add('show');startMatchmaking();}
  if(mode!=='bot'&&mode!=='local'){const p=$('#'+({create:'createPanel',join:'joinPanel',matchmaking:'matchmakingPanel'})[mode]);p&&p.scrollIntoView({behavior:'smooth',block:'center'});}
};

/* ── Sürətli oyun ── */
function startMatchmaking(){
  if(matchmakingActive)return;
  matchmakingActive=true;onlineMode=true;
  $('#matchmakingText').textContent=t('matchmakingText');$('#matchmakingSub').textContent=t('matchmakingSub');
  attemptSlots(Array.from({length:MATCHMAKING_SLOTS},(_,i)=>i),0);
}
function attemptSlots(slots,idx){
  if(!matchmakingActive)return;
  if(idx>=slots.length){setTimeout(()=>{if(matchmakingActive)attemptSlots(slots,0);},1200+Math.random()*800);return;}
  const slotId=MATCHMAKING_PREFIX+slots[idx],p=new Peer(slotId);let settled=false;
  const timeout=setTimeout(()=>{if(settled)return;settled=true;try{p.destroy();}catch(e){}attemptSlots(slots,idx+1);},2500);
  p.on('open',()=>{
    if(settled)return;settled=true;clearTimeout(timeout);
    matchmakingPeer=p;peer=p;isHost=true;
    p.on('connection',c=>{
      if(!matchmakingActive)return;
      conn=c;guestConnected=true;setupConn();matchmakingActive=false;
      $('#matchmakingPanel').classList.remove('show');showConfigScreen();
      showOnlinePill(t('modeMatchTitle')+' — '+t('player1'));toast('🎲 '+t('oppFound'),'gold');SFX.ready();
    });
  });
  p.on('error',err=>{
    if(settled)return;settled=true;clearTimeout(timeout);try{p.destroy();}catch(e){}
    if(err&&err.type==='unavailable-id')joinMatchmakingSlot(slotId,slots,idx);else attemptSlots(slots,idx+1);
  });
}
function joinMatchmakingSlot(slotId,slots,idx){
  if(!matchmakingActive)return;
  const p=new Peer();let settled=false;
  const next=()=>{if(settled)return;settled=true;try{p.destroy();}catch(e){}attemptSlots(slots,idx+1);};
  const timeout=setTimeout(next,2500);
  p.on('open',()=>{
    const c=p.connect(slotId,{reliable:true});
    c.on('open',()=>{
      if(settled)return;settled=true;clearTimeout(timeout);
      if(!matchmakingActive){try{p.destroy();}catch(e){}return;}
      peer=p;conn=c;isHost=false;setupConn();matchmakingActive=false;
      $('#matchmakingPanel').classList.remove('show');
      showOnlinePill(t('modeMatchTitle')+' — '+t('player2'));toast('🎲 '+t('oppFound'),'gold');SFX.ready();
      showScreen('waitScreen');
      /* 3 nəfərlik toqquşma olarsa: oyun vəziyyəti gəlməsə yenidən axtar */
      clearTimeout(mmWatchdog);
      mmWatchdog=setTimeout(()=>{
        if($('#waitScreen').classList.contains('active')&&!state){
          try{c.close();}catch(e){}try{p.destroy();}catch(e){}
          peer=null;conn=null;onlineMode=true;matchmakingActive=true;
          showScreen('lobbyScreen');$('#matchmakingPanel').classList.add('show');
          attemptSlots(slots,0);
        }
      },7000);
    });
    c.on('error',next);
  });
  p.on('error',next);
}
ACT.cancelMatchmaking=()=>{
  matchmakingActive=false;clearTimeout(mmWatchdog);mmWatchdog=null;
  try{matchmakingPeer&&matchmakingPeer.destroy();}catch(e){}
  try{peer&&peer.destroy();}catch(e){}
  matchmakingPeer=null;peer=null;conn=null;guestConnected=false;onlineMode=false;isHost=false;
  $('#matchmakingPanel').classList.remove('show');
};

function showConfigScreen(){
  $('#lobbySelect').style.display='none';$('#gameConfig').style.display='block';
  $('#botLevelField').style.display=vsBotMode?'block':'none';
  const host=onlineMode&&isHost;
  $('#hostStatusArea').style.display=host?'block':'none';
  if(host){$('#hostLinkInput').value=$('#roomLinkInput').value||'';$('#hostStatusText').textContent=t('p2Joined');}
  showScreen('lobbyScreen');
}
ACT.backToLobby=()=>{
  ['createPanel','joinPanel','matchmakingPanel'].forEach(id=>$('#'+id).classList.remove('show'));
  try{peer&&peer.destroy();}catch(e){}
  peer=null;conn=null;onlineMode=false;isHost=false;guestConnected=false;
};

/* ── Otaq yarat / qoşul ── */
function startHostPeer(){onlineMode=true;isHost=true;$('#createStatusText').textContent=t('roomCreating');$('#createDot').classList.remove('on');$('#roomLinkInput').value='';attemptHostRoomCode(8);}
function attemptHostRoomCode(left){
  const code=String(rand(1000,9999)),p=new Peer('htb-room-'+code);let settled=false;
  p.on('open',()=>{
    if(settled)return;settled=true;peer=p;
    $('#roomLinkInput').value=code;$('#hostLinkInput').value=code;
    $('#createStatusText').textContent=t('roomReady',{c:code});$('#createDot').classList.add('on');
  });
  p.on('connection',c=>{
    conn=c;guestConnected=true;setupConn();
    $('#createStatusText').textContent=t('p2Joined');SFX.ready();
    setTimeout(()=>{showConfigScreen();showOnlinePill(t('youAreP1'));},400);
  });
  p.on('error',err=>{
    if(settled)return;
    if(err&&err.type==='unavailable-id'&&left>0){try{p.destroy();}catch(e){}attemptHostRoomCode(left-1);return;}
    settled=true;$('#createStatusText').textContent=t('errPrefix')+(err?.type||'');
  });
}
ACT.doJoin=()=>{
  if(!hasPeer())return;
  const digits=$('#joinCodeInput').value.replace(/\D/g,'').slice(0,4),st=$('#joinStatusText');
  if(digits.length<4){st.textContent=t('enter4');SFX.error();return;}
  onlineMode=true;isHost=false;st.textContent=t('joining');
  peer=new Peer();
  peer.on('open',()=>{
    conn=peer.connect('htb-room-'+digits,{reliable:true});
    conn.on('open',()=>{
      setupConn();$('#joinDot').classList.add('on');st.textContent=t('joined');
      showOnlinePill(t('youAreP2'));SFX.ready();
      setTimeout(()=>showScreen('waitScreen'),400);
    });
    conn.on('error',()=>{st.textContent=t('joinFail');});
  });
  peer.on('error',()=>{st.textContent=t('roomNotFound');});
};
$('#joinCodeInput').addEventListener('keydown',e=>{if(e.key==='Enter')ACT.doJoin();});
function showOnlinePill(text){$('#onlinePillText').textContent=text;$('#onlinePill').classList.add('show');}
ACT.copyCode=id=>{
  const v=$('#'+id).value;try{navigator.clipboard&&navigator.clipboard.writeText(v);}catch(e){}
  toast(t('copied'),'gold');
};

function setupConn(){
  $('#chatToggle').style.display='grid';
  conn.on('data',data=>{
    if(!data||!data.type)return;
    if(data.type==='chat'){appendChat(data.text,false);return;}
    if(isHost&&data.type==='action')handleGuestAction(data);
    else if(!isHost&&data.type==='sync'){clearTimeout(mmWatchdog);mmWatchdog=null;applySync(data);}
    else if(!isHost&&data.type==='reset'){hideAllGameScreens();showScreen('waitScreen');$('#waitText').textContent=t('hostPreparing');}
  });
  conn.on('close',()=>{
    guestConnected=false;toast(t('connLost'),'red');SFX.error();
    leaveOnline();state=null;battleState=null;wheelState=null;showScreen('lobbyScreen');
    $('#gameConfig').style.display='none';$('#lobbySelect').style.display='block';
  });
}
function sendAction(p){if(conn&&conn.open)conn.send(Object.assign({type:'action'},p));}
function handleGuestAction(d){
  if(d.action==='bid')makeBid(2);else if(d.action==='pass')makePass(2);else if(d.action==='spin')triggerWheelSpin();
}

/* ── Söhbət ── */
ACT.chatToggle=()=>{$('#chatPanel').classList.toggle('open');$('#chatToggle').classList.remove('unread');if($('#chatPanel').classList.contains('open'))$('#chatInput').focus();};
$('#chatForm').addEventListener('submit',e=>{
  e.preventDefault();const inp=$('#chatInput'),text=inp.value.trim();if(!text)return;
  appendChat(text,true);if(conn&&conn.open)conn.send({type:'chat',text});inp.value='';SFX.click();
});
function appendChat(text,mine){
  const w=$('#chatMessages'),el=document.createElement('div');
  el.className='chat-msg '+(mine?'mine':'theirs');el.textContent=text;w.appendChild(el);w.scrollTop=w.scrollHeight;
  if(!mine){SFX.play('hover');if(!$('#chatPanel').classList.contains('open'))$('#chatToggle').classList.add('unread');}
}
