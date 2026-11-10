/* ══════════════════════════════════════════════════════════════
   İSTİFADƏÇİ, GİRİŞ, PROFİL, MAĞAZA, KOLLEKSİYA  (məntiq köhnə oyunla eynidir)
   ══════════════════════════════════════════════════════════════ */
let currentUser=null;
const AVATARS=['👤','⚔️','🦸','🧙','🐉','🔥','⚡','💎','🌙','🌟'];

const userKey=u=>u.key||u.username;
function loadUser(username){
  const raw=storeGet('htb_user_'+username,null);
  if(!raw)return null;
  try{return JSON.parse(raw);}catch(e){return null;}
}
function saveUser(){
  if(!currentUser)return;
  storeSet('htb_user_'+userKey(currentUser),JSON.stringify(currentUser));
  updateCoins();
}
function createUser(username,email,avatar){
  return{username,email,avatar:avatar||'👤',coins:200,wins:0,games:0,
    inventory:{frames:['frame_none'],titles:['title_none'],effects:['effect_none'],heroes:[]},
    equipped:{frame:'frame_none',title:'title_none',effect:'effect_none'},createdAt:Date.now()};
}
function updateCoins(){
  if(!currentUser)return;
  $('#navCoins').textContent=currentUser.coins;
  $('#shopCoins').textContent=currentUser.coins;
  const sc=$('#statCoins');if(sc)sc.textContent=currentUser.coins;
}
function updateNavAvatar(){
  if(!currentUser)return;
  const b=$('#navAvatar');
  b.innerHTML=esc(currentUser.avatar||'👤');
  const eqF=SHOP_FRAMES.find(f=>f.id===(currentUser.equipped?.frame||'frame_none'));
  const eqE=SHOP_EFFECTS.find(f=>f.id===(currentUser.equipped?.effect||'effect_none'));
  b.style.border=eqF&&eqF.style&&!eqF.rainbow?eqF.style:'2px solid var(--cyan)';
  b.style.boxShadow=eqE&&eqE.glow?eqE.glow:'';
}

/* ── Giriş / qeydiyyat ── */
let authMode='login';
ACT.authTab=mode=>{
  authMode=mode;
  $$('#authTabs .seg-btn').forEach((b,i)=>b.classList.toggle('active',(i===0)===(mode==='login')));
  $('#authEmailRow').style.display=mode==='register'?'block':'none';
  $('#authSubmit').textContent=(mode==='login'?t('authLogin'):t('authRegister')).toUpperCase();
  $('#authError').textContent='';
};
function handleAuth(){
  const username=$('#authUsername').value.trim(),password=$('#authPassword').value,err=$('#authError');
  err.textContent='';
  if(!username){err.textContent=t('errUserEmpty');SFX.error();return;}
  if(!password||password.length<4){err.textContent=t('errPwShort');SFX.error();return;}
  if(authMode==='register'){
    if(loadUser(username)){err.textContent=t('errUserExists');SFX.error();return;}
    currentUser=createUser(username,$('#authEmail').value.trim(),'👤');
    currentUser._pw=btoa(unescape(encodeURIComponent(password)));
    saveUser();doLogin(username);
  }else{
    const u=loadUser(username);
    if(!u){err.textContent=t('errUserNotFound');SFX.error();return;}
    const pw=btoa(unescape(encodeURIComponent(password)));
    if(u._pw&&u._pw!==pw&&u._pw!==safeBtoa(password)){err.textContent=t('errPwWrong');SFX.error();return;}
    currentUser=u;doLogin(username);
  }
}
function safeBtoa(s){try{return btoa(s);}catch(e){return '';}}   // köhnə hesablarla uyğunluq
$('#authForm').addEventListener('submit',e=>{e.preventDefault();handleAuth();});
ACT.socialAuth=async provider=>{
  if(!CLOUD.ready){                                   // Firebase qoşulmayıb → demo hesab
    const username=(provider==='apple'?'Apple_':'Google_')+rand(1000,9999);
    currentUser=loadUser(username)||createUser(username,provider+'@demo','🦸');
    saveUser();doLogin(username);toast(t('demoNote'),'cyan');return;
  }
  try{
    const r=await cloudSignIn(provider),key='fb_'+r.uid;
    currentUser=loadUser(key)||createUser(r.name,r.email,'🦸');
    currentUser.key=key;currentUser.uid=r.uid;if(!currentUser.username)currentUser.username=r.name;
    saveUser();cloudPush(currentUser);doLogin(key);
  }catch(e){
    $('#authError').textContent=(e&&e.code==='auth/popup-closed-by-user')?'':t('errPrefix')+(e.code||e.message);SFX.error();
  }
};
function doLogin(username){
  storeSet('htb_current',currentUser?userKey(currentUser):username);
  document.body.classList.remove('no-chrome');
  $('#topbar').classList.remove('hidden');$('#bottomnav').classList.remove('hidden');
  updateCoins();updateNavAvatar();
  showScreen('lobbyScreen');
  checkDailyBonus();
  toast(t('welcome',{n:currentUser.username}),'green');
}
ACT.logout=()=>{
  cloudSignOut();
  if(onlineMode||conn)leaveOnline();
  currentUser=null;storeDel('htb_current');
  state=null;battleState=null;wheelState=null;
  $('#topbar').classList.add('hidden');$('#bottomnav').classList.add('hidden');
  document.body.classList.add('no-chrome');
  $('#onlinePill').classList.remove('show');
  showScreen('authScreen');Music.set(null);
  toast(t('loggedOut'));
};
function checkDailyBonus(){
  if(!currentUser)return;
  const today=new Date().toDateString();
  if(currentUser.lastDaily===today)return;
  const y=new Date();y.setDate(y.getDate()-1);
  currentUser.loginStreak=(currentUser.lastDaily===y.toDateString())?(currentUser.loginStreak||0)+1:1;
  const bonus=20+Math.min(currentUser.loginStreak-1,6)*10;           // 20 → 80 (7-ci gün və sonra)
  currentUser.lastDaily=today;currentUser.coins+=bonus;saveUser();
  setTimeout(()=>{toast(t('dailyStreak',{n:currentUser.loginStreak,c:bonus}),'gold');SFX.coin();},1200);
}

/* ── Liqalar (yalnız Tez Oyun qələbələri) ── */
const LEAGUES=[
  {id:'bronze',min:0,color:'#CD7F32',icon:'shield'},
  {id:'silver',min:5,color:'#C0C8D8',icon:'shield'},
  {id:'gold',min:15,color:'#FFD700',icon:'workspace_premium'},
  {id:'diamond',min:40,color:'#00F0FF',icon:'diamond'},
  {id:'legend',min:100,color:'#FF2A55',icon:'military_tech'}
];
function leagueOf(wins){let l=LEAGUES[0];for(const x of LEAGUES)if((wins||0)>=x.min)l=x;return l;}
function leagueChip(wins){const l=leagueOf(wins);return `<span class="league-chip" style="--lc:${l.color}"><span class="ms">${l.icon}</span>${t('league_'+l.id)}</span>`;}

/* Tez Oyun nəticəsi: qələbə sayı, oyun sayı, seriya */
function recordQuickResult(won){
  if(!currentUser)return;
  currentUser.qpGames=(currentUser.qpGames||0)+1;
  if(won){currentUser.qpWins=(currentUser.qpWins||0)+1;currentUser.winStreak=(currentUser.winStreak||0)+1;
    currentUser.bestStreak=Math.max(currentUser.bestStreak||0,currentUser.winStreak);
    const before=leagueOf(currentUser.qpWins-1).id,after=leagueOf(currentUser.qpWins);
    if(before!==after.id)setTimeout(()=>{toast(t('leagueUp',{n:t('league_'+after.id)}),'gold');FX.confetti(120);SFX.victory();},2600);
    /* seriya bonusu: 3+ ardıcıl qələbədə əlavə coin */
    if(currentUser.winStreak>=3){const b=Math.min(currentUser.winStreak,8)*5;currentUser.coins+=b;setTimeout(()=>toast(t('streakBonus',{n:currentUser.winStreak,c:b}),'gold'),2000);}
  }else currentUser.winStreak=0;
  saveUser();cloudPush(currentUser);
}

/* ── Reytinq səhifəsi ── */
async function renderLeaderboard(){
  const list=$('#lbList'),note=$('#lbNote');
  list.innerHTML='<div class="spinner"></div>';
  let rows=[];
  if(CLOUD.ready){
    note.textContent='';
    try{rows=await cloudTop(50);}catch(e){note.textContent=t('lbError');}
  }else{
    note.textContent=t('lbLocalNote');
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);
      if(k&&k.startsWith('htb_user_')){try{const u=JSON.parse(localStorage.getItem(k));if(u.qpGames)rows.push({id:k,name:u.username,avatar:u.avatar,qpWins:u.qpWins||0,qpGames:u.qpGames||0,bestStreak:u.bestStreak||0,me:currentUser&&userKey(u)===userKey(currentUser)});}catch(e){}}}
  }
  rows.sort((a,b)=>(b.qpWins-a.qpWins)||((b.qpWins/(b.qpGames||1))-(a.qpWins/(a.qpGames||1))));
  const myId=currentUser&&currentUser.uid;
  list.innerHTML=rows.length?rows.map((r,i)=>{
    const wr=r.qpGames?Math.round(r.qpWins/r.qpGames*100):0,me=r.me||(myId&&r.id===myId);
    return `<div class="lb-row${me?' me':''}${i<3?' top'+(i+1):''}"><span class="rk num">${i<3?'<span class="ms">emoji_events</span>':''}${i+1}</span>
      <span class="pl"><span class="lb-av">${esc(r.avatar||'👤')}</span><span class="pn"><b>${esc(r.name||'?')}</b>${leagueChip(r.qpWins)}</span></span>
      <span class="num w">${r.qpWins}</span><span class="num">${r.qpGames}</span><span class="num">${wr}%</span></div>`;}).join(''):`<div class="dim" style="padding:18px;text-align:center">${t('lbEmpty')}</div>`;
  const u=currentUser;if(u){
    const l=leagueOf(u.qpWins),nx=LEAGUES.find(x=>x.min>(u.qpWins||0));
    $('#lbMe').innerHTML=`<div class="lbme-top">${leagueChip(u.qpWins)}<span class="num">${u.qpWins||0} ${t('lbWins')} · ${u.qpGames||0} ${t('lbGames')} · 🔥${u.winStreak||0}</span></div>`+
      (nx?`<div class="gauge thin" style="--v:${Math.min(100,((u.qpWins||0)-l.min)/(nx.min-l.min)*100)}%;--gc:${l.color}"><i></i></div><small class="dim">${t('lbNext',{n:nx.min-(u.qpWins||0),l:t('league_'+nx.id)})}</small>`:`<small class="dim">${t('lbMax')}</small>`);
  }
  $('#leagueInfo').innerHTML=LEAGUES.map(l=>`<div>${leagueChip(l.min)}<small class="num dim">${l.min}+</small></div>`).join('');
}
/* ── Profil ── */
function renderProfile(){
  if(!currentUser)return;
  const u=currentUser;
  $('#profileUsername').textContent=u.username;
  $('#profileAvatar').innerHTML=avatarHTML(u,96);
  $('#statWins').textContent=u.wins||0;$('#statGames').textContent=u.games||0;
  $('#statCoins').textContent=u.coins||0;$('#statHeroes').textContent=u.inventory?.heroes?.length||0;
  $('#statWR').textContent=u.games?Math.round((u.wins||0)/u.games*100)+'% WR':'';
  const eqT=SHOP_TITLES.find(x=>x.id===(u.equipped?.title||'title_none'));
  $('#profileTitleBadge').innerHTML=eqT?`<span class="badge ${eqT.badge}">${esc(eqT.text)}</span>`:'';
  $('#profileLeague').innerHTML=leagueChip(u.qpWins)+` <span class="dim num">🔥${u.winStreak||0} · ${t('loginStreak')} ${u.loginStreak||1}</span>`;
  $('#editUsername').value=u.username;
  $('#avatarOptions').innerHTML=AVATARS.map(a=>`<button class="avatar-opt${a===u.avatar?' selected':''}" data-act="pickAvatar" data-arg="${a}">${a}</button>`).join('');
  renderInventory();
  $('#sfxRange').value=Math.round(SFX.settings.sfxVol*100);$('#sfxVal').textContent=$('#sfxRange').value+'%';
  $('#musicRange').value=Math.round(SFX.settings.musicVol*100);$('#musicVal').textContent=$('#musicRange').value+'%';
}
ACT.profileTab=tab=>{
  const names=['edit','inventory','settings'];
  $$('#profileTabs .tab').forEach((b,i)=>b.classList.toggle('active',names[i]===tab));
  $$('.profile-panel').forEach(p=>p.classList.remove('active'));
  $('#pp'+tab.charAt(0).toUpperCase()+tab.slice(1)).classList.add('active');
};
ACT.pickAvatar=(a,el)=>{$$('.avatar-opt').forEach(o=>o.classList.remove('selected'));el.classList.add('selected');};
ACT.saveProfile=()=>{
  if(!currentUser)return;
  const name=$('#editUsername').value.trim();
  if(!name){toast(t('errUserEmpty'),'red');return;}
  const sel=$('.avatar-opt.selected');
  if(name!==currentUser.username&&!currentUser.key){                         // ad dəyişərsə hesabı köçür
    if(loadUser(name)){toast(t('errUserExists'),'red');return;}
    storeDel('htb_user_'+currentUser.username);currentUser.username=name;storeSet('htb_current',name);
  }
  currentUser.avatar=sel?sel.dataset.arg:'👤';
  if(currentUser.key)currentUser.username=name;
  saveUser();cloudPush(currentUser);updateNavAvatar();renderProfile();toast(t('saved'),'green');
};
$('#sfxRange').addEventListener('input',e=>{SFX.setSfxVol(e.target.value/100);$('#sfxVal').textContent=e.target.value+'%';});
$('#sfxRange').addEventListener('change',()=>SFX.click());
$('#musicRange').addEventListener('input',e=>{SFX.setMusicVol(e.target.value/100);$('#musicVal').textContent=e.target.value+'%';});

function renderInventory(){
  const u=currentUser;
  const groups=[['frame',SHOP_FRAMES,'frames'],['title',SHOP_TITLES,'titles'],['effect',SHOP_EFFECTS,'effects']];
  $('#inventoryBox').innerHTML=groups.map(([type,cat,lbl])=>{
    const owned=u.inventory?.[type+'s']||[],eq=u.equipped?.[type]||'';
    return `<div class="inv-group"><div class="label">${t(lbl)}</div><div class="shop-grid">${
      owned.map(id=>{const it=cat.find(c=>c.id===id);if(!it)return'';return shopCard(type,it,{owned:true,equipped:eq===id});}).join('')
    }</div></div>`;
  }).join('');
}
ACT.equip=(arg)=>{
  const [type,id]=arg.split(':');
  currentUser.equipped=currentUser.equipped||{};currentUser.equipped[type]=id;
  saveUser();updateNavAvatar();
  if($('#profileScreen').classList.contains('active'))renderProfile();else renderShop();
  toast(t('equipped'),'gold');SFX.toggle();
};

/* ── Mağaza ── */
let shopTabName='frames';
function heroCoinPrice(h){
  if(h.tier==='S')return 800+Math.round((h.power+h.speed+h.defense+h.health-340)/4)*10;
  if(h.tier==='A')return 400+Math.round((h.power+h.speed+h.defense+h.health-280)/4)*8;
  if(h.tier==='B')return 200+Math.round((h.power+h.speed+h.defense+h.health-240)/4)*5;
  return 80;
}
function frBadge(fr){return fr==='DC'?'badge-azure':fr==='The Boys'?'badge-mint':fr==='Mythology'?'badge-violet':'badge-crimson';}

function shopCard(type,it,{owned,equipped}){
  let prev='';
  if(type==='frame'){const fake={...currentUser,equipped:{frame:it.id,effect:'effect_none'}};prev=avatarHTML(fake,64);}
  else if(type==='effect'){const fake={...currentUser,equipped:{frame:'frame_none',effect:it.id}};prev=avatarHTML(fake,64);}
  else prev=`<span class="badge ${it.badge}" style="font-size:14px;padding:6px 14px">${esc(it.text)}</span>`;
  let act;
  if(equipped)act=`<span class="chip chip-cyan" style="justify-content:center">${t('equippedTag')}</span>`;
  else if(owned)act=`<button class="btn btn-sm btn-ghost" data-act="equip" data-arg="${type}:${it.id}">${t('equip')}</button>`;
  else act=`<button class="btn btn-sm btn-gold" data-act="buy" data-arg="${type}:${it.id}"><span class="ms">monetization_on</span>${it.price}</button>`;
  return `<div class="shop-card ${equipped?'equipped':owned?'owned':''}">
    <div class="sc-prev">${prev}</div>
    <div class="sc-cat">${t('cat_'+type)}</div><div class="sc-name">${esc(it.name)}</div>
    <div class="sc-desc">${esc(it.desc)}</div>
    <div class="sc-act">${act}</div></div>`;
}
function heroShopCard(h){
  const owned=(currentUser.inventory?.heroes||[]).includes(h.name),price=heroCoinPrice(h),tm=TIER_META[h.tier]||TIER_META.C;
  return `<div class="shop-card ${owned?'owned':''}" style="--tc:${tm.color}">
    <div class="sc-prev" style="height:140px">${portrait(h)}<span class="sc-flag tier-chip" style="--tc:${tm.color}">${h.tier}</span></div>
    <div class="sc-cat" style="color:${tm.color}">${t('tier_'+tm.key)} · ${esc(h.fr)}</div>
    <div class="sc-name">${esc(h.name)}</div>
    <div class="sc-stats"><span class="mini-stat" style="color:var(--crimson)">PWR ${h.power}</span><span class="mini-stat" style="color:var(--gold)">SPD ${h.speed}</span><span class="mini-stat" style="color:var(--cyan)">DEF ${h.defense}</span></div>
    <div class="sc-act">${owned?`<span class="chip chip-cyan" style="justify-content:center;width:100%">✓ ${t('owned')}</span>`:`<button class="btn btn-sm btn-gold" data-act="buyHero" data-arg="${esc(h.name)}"><span class="ms">monetization_on</span>${price}</button>`}</div></div>`;
}
function renderShop(){
  if(!currentUser)return;
  updateCoins();
  const cat={frames:[SHOP_FRAMES,'frame'],titles:[SHOP_TITLES,'title'],effects:[SHOP_EFFECTS,'effect']}[shopTabName];
  $('#shopNote').style.display=shopTabName==='heroes'?'block':'none';
  if(shopTabName==='heroes'){
    $('#shopGrid').innerHTML=HEROES.map(heroShopCard).join('');
  }else{
    const [list,type]=cat,owned=currentUser.inventory?.[type+'s']||[],eq=currentUser.equipped?.[type]||'';
    $('#shopGrid').innerHTML=list.map(it=>shopCard(type,it,{owned:owned.includes(it.id),equipped:eq===it.id})).join('');
  }
}
ACT.shopTab=tab=>{
  shopTabName=tab;
  const names=['frames','titles','effects','heroes'];
  $$('#shopTabs .tab').forEach((b,i)=>b.classList.toggle('active',names[i]===tab));
  renderShop();
};
ACT.buy=arg=>{
  if(!currentUser)return;
  const [type,id]=arg.split(':');
  const cat={frame:SHOP_FRAMES,title:SHOP_TITLES,effect:SHOP_EFFECTS}[type],it=cat.find(c=>c.id===id);
  if(!it)return;
  if(currentUser.coins<it.price){toast(t('notEnough'),'red');SFX.error();return;}
  currentUser.inventory[type+'s']=currentUser.inventory[type+'s']||[];
  currentUser.coins-=it.price;currentUser.inventory[type+'s'].push(id);currentUser.equipped[type]=id;
  saveUser();updateNavAvatar();renderShop();toast(t('bought',{n:it.name}),'gold');SFX.coin();
};
ACT.buyHero=name=>{
  if(!currentUser)return;
  const h=HEROES.find(x=>x.name===name);if(!h)return;
  const price=heroCoinPrice(h);
  if(currentUser.coins<price){toast(t('notEnough'),'red');SFX.error();return;}
  if(currentUser.inventory.heroes.includes(name)){toast(t('alreadyHave'));return;}
  currentUser.coins-=price;currentUser.inventory.heroes.push(name);saveUser();renderShop();
  toast(t('heroAdded',{n:name}),'gold');SFX.coin();
};

/* ── Kolleksiya ── */
function renderCollection(){
  if(!currentUser)return;
  const owned=currentUser.inventory?.heroes||[];
  $('#collectionCount').textContent=owned.length+' / '+HEROES.length;
  $('#collectionGrid').innerHTML=HEROES.map(h=>{
    const has=owned.includes(h.name),tm=TIER_META[h.tier]||TIER_META.C;
    return `<div class="coll-card ${has?'':'locked'}" style="--tc:${tm.color}">${portrait(h)}
      <span class="cc-tier tier-chip" style="--tc:${tm.color};font-size:11px;padding:2px 8px;min-width:0">${h.tier}</span>
      <div class="cc-info"><b>${has?esc(h.name):'???'}</b><span>${has?esc(h.fr):t('discover')}</span></div></div>`;
  }).join('');
}
