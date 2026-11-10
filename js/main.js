/* ══════════════ Naviqasiya, başlanğıc ══════════════ */
const SCREEN_META={
  authScreen:{title:'title_lobby',nav:null,music:null},
  lobbyScreen:{title:'title_lobby',nav:'lobby',music:'lobby'},
  waitScreen:{title:'title_wait',nav:null,music:'lobby'},
  draftScreen:{title:'title_draft',nav:null,music:'lobby'},
  wheelScreen:{title:'title_wheel',nav:null,music:'lobby'},
  arenaScreen:{title:'title_arena',nav:null,music:'battle'},
  endScreen:{title:'title_end',nav:null,music:'lobby'},
  collectionScreen:{title:'title_collection',nav:'collection',music:'lobby'},
  storeScreen:{title:'title_store',nav:'store',music:'lobby'},
  leaderboardScreen:{title:'title_rank',nav:'leaderboard',music:'lobby'},
  profileScreen:{title:'title_profile',nav:'profile',music:'lobby'}
};
let activeScreenId='authScreen';
function refreshScreenTitle(){const m=SCREEN_META[activeScreenId];if(m)$('#screenTitle').textContent=t(m.title);}
function showScreen(id){
  const m=SCREEN_META[id];if(!m)return;
  $$('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
  activeScreenId=id;refreshScreenTitle();
  $$('#bottomnav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===m.nav));
  if(id==='lobbyScreen'&&!state){/* konfiq görünürsə qalır */}
  if(id==='profileScreen')renderProfile();
  if(id==='storeScreen')renderShop();
  if(id==='collectionScreen')renderCollection();
  if(id==='leaderboardScreen')renderLeaderboard();
  Music.set(m.music);
  window.scrollTo({top:0});
}
const GAME_SCREENS=['draftScreen','wheelScreen','arenaScreen','endScreen'];
ACT.nav=target=>{
  const map={leaderboard:'leaderboardScreen',lobby:'lobbyScreen',collection:'collectionScreen',store:'storeScreen',profile:'profileScreen'};
  const id=map[target];if(!id)return;
  if(GAME_SCREENS.includes(activeScreenId)&&activeScreenId!=='endScreen'&&state){
    if(!confirm(t('leaveConfirm')))return;
  }
  if(GAME_SCREENS.includes(activeScreenId)||activeScreenId==='waitScreen'){
    gameEpoch++;state=null;battleState=null;wheelState=null;ui.lotIdx=-1;
    if(onlineMode||conn)leaveOnline();
    $('#gameConfig').style.display='none';$('#lobbySelect').style.display='block';
    ['createPanel','joinPanel','matchmakingPanel'].forEach(i=>$('#'+i).classList.remove('show'));
  }
  if(target==='lobby'&&!state&&!onlineMode&&$('#gameConfig').style.display!=='none'&&activeScreenId==='lobbyScreen'){
    $('#gameConfig').style.display='none';$('#lobbySelect').style.display='block';vsBotMode=false;quickBot=false;
  }
  SFX.nav();showScreen(id);
};
ACT.toggleSound=()=>{
  const m=SFX.toggleMute();
  $('#soundBtn').innerHTML=`<span class="ms">${m?'volume_off':'volume_up'}</span>`;
  $('#soundBtn').classList.toggle('off',m);
  if(!m)SFX.toggle();
};
/* düymə klik səsi */
document.addEventListener('click',e=>{
  const el=e.target.closest('button,.chip-btn,.opt,.tab,.seg-btn');
  if(!el||el.disabled)return;
  const a=el.dataset&&el.dataset.act;
  if(['nav','toggleSound','toggleMusic','toggleSpeed','equip','spinWheel','pickInc','pickMax'].includes(a))return;
  if(el.id==='p1BidBtn'||el.id==='p2BidBtn'||el.id==='p1PassBtn'||el.id==='p2PassBtn')return;
  SFX.click();
},true);

window.addEventListener('DOMContentLoaded',()=>{
  applyLang(currentLang);
  $('#soundBtn').innerHTML=`<span class="ms">${SFX.isMuted()?'volume_off':'volume_up'}</span>`;
  $('#muteMusicBtn').classList.toggle('off',!SFX.settings.music);
  const saved=storeGet('htb_current',null);
  const u=saved&&loadUser(saved);
  if(u){currentUser=u;doLogin(saved);}
  else{document.body.classList.add('no-chrome');showScreen('authScreen');ACT.authTab('login');}
});
