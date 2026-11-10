/* ══════════════════════════════════════════════════════════════
   OYUN MƏNTİQİ: Artırma · Çarx · Döyüş · Nəticə · Online sinxronizasiya
   Qaydalar (qiymət, büdcə, döyüş düsturu, mükafatlar) köhnə versiya ilə eynidir.
   Yeni olan: animasiyalar, səslər, portretlər, hərəkət sürəti, güclü bot.
   ══════════════════════════════════════════════════════════════ */
let state=null,battleState=null,wheelState=null;
let selectedInc=1,selectedMaxHeroes=5,selectedGameMode='auction';
let gameEpoch=0;                                   // oyun sıfırlananda köhnə taymerləri ləğv edir
const later=(fn,ms)=>{const ep=gameEpoch;return setTimeout(()=>{if(ep===gameEpoch)fn();},ms);};
const ui={lotIdx:-1,price:0,logLen:0,pair:'',lastFx:0,lastKo:0,histLen:-1,counted:false,rewarded:false,matchStart:0,timer:0};

/* ── köməkçilər ── */
function assignStats(h){return{...h,power:clamp(h.power+rand(-3,3),1,99),speed:clamp(h.speed+rand(-3,3),1,99),defense:clamp(h.defense+rand(-3,3),1,99),health:clamp(h.health+rand(-3,3),1,99)};}
function pname(p){return p===1?t('player1'):(quickBot?quickBotName:vsBotMode?'🤖 BOT':t('player2'));}
function myPlayer(){return onlineMode&&!isHost?2:1;}
function hideAllGameScreens(){$$('.screen').forEach(s=>s.classList.remove('active'));}
function tm(h){return TIER_META[h.tier]||TIER_META.C;}
function elapsed(){return state&&state.t0?Math.floor((Date.now()-state.t0)/1000):0;}

/* ── konfiqurasiya UI ── */
(function initConfig(){
  const br=$('#budgetRange');br.addEventListener('input',()=>{$('#budgetVal').textContent='$'+br.value;});
  const inc=$('#incRow');for(let i=1;i<=10;i++)inc.insertAdjacentHTML('beforeend',`<button class="chip-btn${i===1?' active':''}" data-act="pickInc" data-arg="${i}">$${i}</button>`);
  const mh=$('#maxHeroesRow');for(let i=3;i<=10;i++)mh.insertAdjacentHTML('beforeend',`<button class="chip-btn${i===5?' active':''}" data-act="pickMax" data-arg="${i}">${i}</button>`);
  $('#hbHeroes').textContent=HEROES.length;
})();
ACT.pickInc=(v,el)=>{$$('#incRow .chip-btn').forEach(e=>e.classList.remove('active'));el.classList.add('active');selectedInc=+v;};
ACT.pickMax=(v,el)=>{$$('#maxHeroesRow .chip-btn').forEach(e=>e.classList.remove('active'));el.classList.add('active');selectedMaxHeroes=+v;$('#maxHeroesVal').textContent=v;};
ACT.gameMode=mode=>{selectedGameMode=mode;['Auction','Wheel','Blind'].forEach(k=>$('#gm'+k).classList.toggle('active',mode===k.toLowerCase()));$('#budgetField').style.display=mode==='wheel'?'none':'';$('#incField').style.display=mode==='auction'?'':'none';};
ACT.botLevel=(lvl,el)=>{BOT.level=lvl;$$('#botLevelRow .opt').forEach(e=>e.classList.remove('active'));el.classList.add('active');};

ACT.startGame=()=>{
  if(onlineMode&&isHost&&!guestConnected){toast(t('p2NotJoined'),'red');SFX.error();return;}
  gameEpoch++;ui.lotIdx=-1;ui.rewarded=false;
  if(selectedGameMode==='wheel'){startWheelGame(selectedMaxHeroes);return;}
  const budget=parseInt($('#budgetRange').value,10),lotCount=Math.min(HEROES.length,selectedMaxHeroes*2);
  const lots=shuffle(HEROES).slice(0,lotCount).map(assignStats);
  const blind=selectedGameMode==='blind';
  blindSecret={1:null,2:null};
  state={mode:'auction',blind,locked:{1:false,2:false},budget,inc:blind?1:selectedInc,maxHeroes:selectedMaxHeroes,lots,lotIdx:0,price:0,leader:null,p1Passed:false,p2Passed:false,resolving:false,
    t0:Date.now(),bidLog:[],players:{1:{budget,heroes:[]},2:{budget,heroes:[]}}};
  battleState=null;wheelState=null;
  SFX.whoosh();
  if(currentUser){currentUser.games=(currentUser.games||0)+1;saveUser();}
  showScreen('draftScreen');$('#lotTotal').textContent=lots.length;
  renderAuction();
};

/* ── komanda paneli (draft + çarx) ── */
function renderTeams(boxId,mode){
  const turn=mode==='wheel'&&wheelState?wheelState.turn:(mode==='auction'?state.leader:0);
  $(boxId).innerHTML=[1,2].map(p=>{
    const pl=state.players[p],you=onlineMode&&((isHost&&p===1)||(!isHost&&p===2));
    const slots=Array.from({length:state.maxHeroes},(_,i)=>{const h=pl.heroes[i];return h?`<span class="slot full" style="--tc:${tm(h).color}" title="${esc(h.name)}">${portrait(h,'fill')}</span>`:'<span class="slot"></span>';}).join('');
    const budget=mode==='auction'?`<div class="tm-budget"><span>${t('budget')}</span><b class="num">$${pl.budget}</b></div>`:'';
    return `<div class="team-mini p${p}${turn===p?' turn':''}"><div class="tm-name">${esc(pname(p))}${you?' · '+t('you'):''}</div>
      <div class="tm-count">${pl.heroes.length}/${state.maxHeroes} ${t('drafted')}</div>${budget}<div class="slots">${slots}</div></div>${p===1?'<div class="vs-chip"><span>VS</span></div>':''}`;
  }).join('');
}

/* ═══════════════════════════ AUKSİON ═══════════════════════════ */
function statGauges(h){
  const rows=[['PWR',h.power,'var(--crimson)'],['SPD',h.speed,'var(--gold)'],['DEF',h.defense,'var(--cyan)'],['HP',h.health,'var(--green)']];
  return rows.map(([l,v,c])=>`<div class="g4"><small><span>${l}</span><b class="num">${v}</b></small><div class="gauge thin" style="--v:${v}%;--gc:${c}"><i></i></div></div>`).join('');
}
function bioOf(h){const b=BIOS[h.name]||{};return b[currentLang]||b.az||'';}
function bidIcon(k){return {bid:'gavel',pass:'block',sold:'check_circle',unsold:'cancel'}[k]||'circle';}

function renderAuction(){
  if(!state)return;
  if(state.lotIdx>=state.lots.length){finishAuction();return;}
  const h=state.lots[state.lotIdx],newLot=ui.lotIdx!==state.lotIdx;
  $('#lotIndex').textContent=state.lotIdx+1;
  if(newLot){
    ui.lotIdx=state.lotIdx;ui.price=0;ui.logLen=state.bidLog.length;
    $('#lotArt').innerHTML=`${portrait(h)}<div class="la-tags"><span class="rarity" style="--tc:${tm(h).color}">${t('tier_'+tm(h).key).toUpperCase()} ${'★'.repeat(tm(h).stars)}</span><span class="fr-chip">${esc(h.fr)}</span></div>`;
    $('#lotName').textContent=h.name;
    const tc=$('#lotTier');tc.textContent=t('tierWord')+' '+h.tier;tc.style.setProperty('--tc',tm(h).color);
    $('#lotStats').innerHTML=statGauges(h);$('#lotBio').textContent=bioOf(h);
    const art=$('#lotArt .portrait');art&&art.animate([{transform:'scale(1.15)',opacity:0},{transform:'scale(1)',opacity:1}],{duration:500,easing:'cubic-bezier(.2,.9,.3,1)'});
    if(state.lotIdx>0)SFX.whoosh();
  }
  /* yeni təklif/pas səsləri (host və qonaq eyni yolla eşidir) */
  for(let i=ui.logLen;i<state.bidLog.length;i++){
    const e=state.bidLog[i];
    if(e.k==='bid')SFX.bid(clamp(e.price/Math.max(1,state.budget),0,1));
    else if(e.k==='pass')SFX.pass();
  }
  ui.logLen=state.bidLog.length;
  $('#curPrice').textContent='$'+state.price;
  if(state.price!==ui.price&&state.price>0){const el=$('#curPrice');el.animate([{transform:'scale(1.35)',color:'#fff'},{transform:'scale(1)'}],{duration:260});}
  ui.price=state.price;
  const ln=$('#leaderNote');ln.textContent=state.leader?t('leadBy',{n:pname(state.leader)}):t('startAuctionMsg');
  $('#bidWho1').textContent=pname(1);$('#bidWho2').textContent=pname(2);
  renderTeams('#draftTeams','auction');
  const next=state.price+state.inc;
  const can=p=>{const pl=state.players[p];return !state[`p${p}Passed`]&&pl.heroes.length<state.maxHeroes&&pl.budget>=next&&!state.resolving;};
  $('#p1BidBtn').innerHTML=`<span class="ms">gavel</span> ${t('bidBtn')} <span class="num">$${next}</span>`;
  $('#p2BidBtn').innerHTML=$('#p1BidBtn').innerHTML;
  $('#p1BidBtn').disabled=!can(1);$('#p1PassBtn').disabled=state.p1Passed||state.resolving;
  $('#p2BidBtn').disabled=!can(2);$('#p2PassBtn').disabled=state.p2Passed||state.resolving;
  renderBlind(newLot);
  if(onlineMode){
    if(isHost){$('#p2BidBtn').disabled=true;$('#p2PassBtn').disabled=true;}
    else{$('#p1BidBtn').disabled=true;$('#p1PassBtn').disabled=true;}
  }
  const bot=vsBotMode;
  $('#p2BidBtn').style.display=bot?'none':'';$('#p2PassBtn').style.display=bot?'none':'';
  $('#botThink').style.display=bot&&!quickBot?'':'none';
  /* bid log */
  const feed=$('#bidFeed');
  feed.innerHTML=state.bidLog.length?state.bidLog.slice().reverse().slice(0,14).map(e=>{
    const who=e.p?`<b class="p${e.p}">${esc(pname(e.p))}</b>`:'';
    const txt=e.k==='bid'?`${who} ${t('logBid')} <b class="g">$${e.price}</b>`:e.k==='pass'?`${who} ${t('logPass')}`:
      e.k==='sold'?`<b class="g">${esc(e.hero)}</b> ${t('logSold')} ${who} — <b class="g">$${e.price}</b>`:`<b class="g">${esc(e.hero)}</b> ${t('logUnsold')}`;
    return `<div class="feed-row"><span class="t num">[${fmtTime(e.s)}]</span><span class="ms" style="color:${e.k==='sold'?'var(--gold)':e.p===2?'var(--crimson)':'var(--cyan)'}">${bidIcon(e.k)}</span><span>${txt}</span></div>`;
  }).join(''):`<div class="feed-row empty">${t('noBidsYet')}</div>`;
  if(onlineMode&&isHost)syncGuest();
}
function logBid(k,p,price,hero){state.bidLog.push({k,p,price,hero,s:elapsed()});}

function triggerBid(p){
  if(!onlineMode){makeBid(p);if(vsBotMode&&p===1)botMove();return;}
  if(isHost&&p===1)makeBid(1);else if(!isHost&&p===2)sendAction({action:'bid'});
}
function triggerPass(p){
  if(!onlineMode){makePass(p);if(vsBotMode&&p===1)botMove();return;}
  if(isHost&&p===1)makePass(1);else if(!isHost&&p===2)sendAction({action:'pass'});
}
$('#p1BidBtn').addEventListener('click',()=>triggerBid(1));
$('#p2BidBtn').addEventListener('click',()=>triggerBid(2));
$('#p1PassBtn').addEventListener('click',()=>triggerPass(1));
$('#p2PassBtn').addEventListener('click',()=>triggerPass(2));

function makeBid(p){
  if(!state||state.mode!=='auction'||state.resolving)return;
  state.price+=state.inc;state.leader=p;logBid('bid',p,state.price);renderAuction();
}
function makePass(p){
  if(!state||state.mode!=='auction'||state.resolving)return;
  if(p===1)state.p1Passed=true;else state.p2Passed=true;
  logBid('pass',p,state.price);
  if(state.p1Passed&&state.p2Passed)resolveLot();
  else if(state.leader&&((state.leader===1&&state.p2Passed)||(state.leader===2&&state.p1Passed)))resolveLot();
  else renderAuction();
}
function resolveLot(){
  if(!state||state.resolving)return;
  state.resolving=true;
  const h=state.lots[state.lotIdx],fl=$('#flash'),ft=$('#flashText');
  if(state.leader){
    const w=state.leader;state.players[w].budget-=state.price;state.players[w].heroes.push({...h,boughtPrice:state.price});
    logBid('sold',w,state.price,h.name);
    ft.innerHTML=`<div class="reveal" style="--tc:${tm(h).color}">${portrait(h,'fill')}</div>${esc(h.name)}<br><span class="stamp">${t('sold')}</span><span class="small" style="color:${w===1?'var(--cyan)':'var(--crimson)'}">${esc(pname(w))} — $${state.price}</span>`;
    SFX.sold();const c=centerOf($('#lotCard'));FX.coins(c.x,c.y,26);
  }else{
    logBid('unsold',0,0,h.name);
    ft.innerHTML=`<div class="reveal" style="--tc:#6B7D99;filter:grayscale(1)">${portrait(h,'fill')}</div>${esc(h.name)}<br><span class="stamp no">${t('unsold')}</span><span class="small dim">${t('noOneBid')}</span>`;
    SFX.unsold();
  }
  fl.classList.add('show');
  renderTeams('#draftTeams','auction');
  if(onlineMode&&isHost)syncGuest();
  later(()=>{
    fl.classList.remove('show');
    state.lotIdx++;state.price=0;state.leader=null;state.p1Passed=false;state.p2Passed=false;state.resolving=false;
    blindSecret={1:null,2:null};if(state.blind)state.locked={1:false,2:false};
    renderAuction();
  },state.blind?2600:1700);
}
function finishAuction(){
  if(onlineMode&&!isHost)return;
  if(state.players[1].heroes.length>0&&state.players[2].heroes.length>0)startBattle();else showFinalResults();
}


/* ═══════════════════════ GİZLİ TƏKLİF (Blind Bid) ═══════════════════════
   Hər lot üçün hər oyunçu gizli bir qiymət yazır. Ən yüksək qiymət qalib olur və öz təklifini ödəyir.
   Bərabərlikdə qəhrəman satılmır. Qalan hər şey (komandalar, döyüş) əvvəlki kimidir. */
let blindSecret={1:null,2:null};            // gizli təkliflər yalnız hostda (və ya botla oyunda) saxlanılır
function blindMax(p){
  const pl=state.players[p],need=state.maxHeroes-pl.heroes.length;
  if(need<=0)return 0;
  return Math.max(0,pl.budget-(need-1));          // qalan hər yer üçün ən azı $1 ehtiyat
}
function blindNeed(p){return state.maxHeroes-state.players[p].heroes.length;}
function renderBlind(newLot){
  const on=!!(state&&state.blind);
  $('#blindBox').style.display=on?'block':'none';
  $('.bid-actions').style.display=on?'none':'';
  if(!on)return;
  const me=myPlayer(),lk=(state.locked&&state.locked[me])||false;
  $('#botThink').style.display='none';
  $('#curPrice').textContent='?';
  $('#leaderNote').textContent=lk?t('blindWaiting'):t('blindHint');
  const max=blindMax(me),need=blindNeed(me);
  if(newLot){ui.blindBid=need>0?clamp(Math.round(state.players[me].budget/need),1,Math.max(1,max)):0;ui.blindSent=-1;}
  ui.blindBid=clamp(ui.blindBid||0,0,max);
  drawBlind();
  if(state.resolving)return;
  /* ikisinin də yeri dolubsa → birbaşa döyüşə (yalnız host/tək oyunçu başladır) */
  if(need<=0&&blindNeed(me===1?2:1)<=0){later(finishAuction,300);return;}
  /* yeri dolu oyunçu üçün təklif yoxdur → avtomatik pas */
  if(need<=0&&!lk)later(ACT.blindLock,700);
}
function drawBlind(){
  const me=myPlayer(),lk=(state.locked&&state.locked[me])||ui.blindSent===state.lotIdx;
  $('#blindVal').textContent='$'+ui.blindBid;
  $$('#blindBox .blind-step,#blindBox .blind-chips .chip-btn').forEach(b=>b.disabled=!!(lk||state.resolving));
  $('#blindLockBtn').disabled=!!(lk||state.resolving);
}
const blindOK=()=>state&&state.blind&&!state.resolving&&state.mode==='auction';
ACT.blindStep=v=>{if(!blindOK())return;ui.blindBid=clamp((ui.blindBid||0)+(+v),0,blindMax(myPlayer()));drawBlind();SFX.click();};
ACT.blindSet=v=>{if(!blindOK())return;const m=blindMax(myPlayer());ui.blindBid=v==='max'?m:v==='half'?Math.round(m/2):0;drawBlind();SFX.click();};
function botBlindBid(){
  const me=state.players[2],need=blindNeed(2),max=blindMax(2);
  if(need<=0||max<=0)return 0;
  const lotsLeft=state.lots.length-state.lotIdx;
  state.price=0;state.leader=null;state.p1Passed=false;state.p2Passed=false;
  let base=botMaxPrice(state);                                  // açıq hərracda ödəyəcəyi yuxarı hədd
  const v=botHeroValue(state.lots[state.lotIdx]);
  /* qalib lənəti: biraz aşağı yaz, amma yaxşı qəhrəmana qarşı cəsarətli ol */
  const lo=BOT.level==='easy'?.5:.8,hi=BOT.level==='easy'?1.3:1.02;
  let b=base*(lo+Math.random()*(hi-lo))*(1+(v-.5)*.35);
  if(lotsLeft<=need)b=Math.max(b,max*.8);                       // qalan lotlar azdır → mütləq al
  b=Math.round(clamp(b,0,max));
  if(b<1&&lotsLeft<=need)b=1;
  return b;
}
/* hostda: oyunçu p gizli təklifini təsdiqlədi */
function blindLockFor(p,amount){
  if(!blindOK()||blindSecret[p]!==null)return;
  blindSecret[p]=clamp(amount||0,0,blindMax(p));
  if(!state.locked)state.locked={1:false,2:false};
  state.locked[p]=true;SFX.click();
  if(vsBotMode)blindSecret[2]=botBlindBid();
  if(blindSecret[1]!==null&&blindSecret[2]!==null)revealBlind();
  else{drawBlind();renderBlind(false);if(onlineMode&&isHost)syncGuest();}
}
ACT.blindLock=()=>{
  if(!blindOK())return;
  const me=myPlayer();
  if(onlineMode&&!isHost){
    if(ui.blindSent===state.lotIdx)return;
    ui.blindSent=state.lotIdx;sendAction({action:'blindbid',amount:clamp(ui.blindBid||0,0,blindMax(2))});drawBlind();SFX.click();
    $('#leaderNote').textContent=t('blindWaiting');return;
  }
  blindLockFor(1,clamp(ui.blindBid||0,0,blindMax(1)));
};
function revealBlind(){
  const b1=blindSecret[1],b2=blindSecret[2];
  SFX.bid(clamp(Math.max(b1,b2)/Math.max(1,state.budget),0,1));
  if(b1>0)logBid('bid',1,b1);else logBid('pass',1,0);
  if(b2>0)logBid('bid',2,b2);else logBid('pass',2,0);
  if(b1>b2){state.leader=1;state.price=b1;}else if(b2>b1){state.leader=2;state.price=b2;}else{state.leader=null;state.price=0;}
  resolveLot();
  $('#flashText').insertAdjacentHTML('beforeend',`<div class="blind-reveal"><span class="p1">${esc(pname(1))} <b class="num">$${b1}</b></span><i>VS</i><span class="p2">${esc(pname(2))} <b class="num">$${b2}</b></span></div>${b1&&b1===b2?`<div class="small dim">${t('blindTie')}</div>`:''}`);
  if(onlineMode&&isHost)syncGuest();
}

/* ── Bot hərəkəti (qərarı bot.js verir) ── */
function botMove(){
  if(!vsBotMode||!state||state.mode!=='auction'||state.p2Passed||state.leader===2||state.resolving)return;
  const lot=state.lotIdx;
  if(!quickBot)$('#botThink').classList.add('show');
  later(()=>{
    $('#botThink').classList.remove('show');
    if(!vsBotMode||!state||state.mode!=='auction'||state.lotIdx!==lot||state.resolving||state.p2Passed||state.leader===2)return;
    if(botDecide(state)==='bid'){makeBid(2);if(state.p1Passed)resolveLot();}
    else makePass(2);
  },botThinkDelay());
}

/* ═══════════════════════════ ÇARX ═══════════════════════════ */
function startWheelGame(maxHeroes){
  const lotCount=Math.min(HEROES.length,maxHeroes*3),lots=shuffle(HEROES).slice(0,lotCount).map(assignStats);
  wheelState={lots,remaining:lots.slice(),turn:1,maxHeroes,spinning:false,lastAssigned:''};
  state={mode:'wheel',maxHeroes,t0:Date.now(),bidLog:[],players:{1:{budget:0,heroes:[]},2:{budget:0,heroes:[]}}};
  battleState=null;
  showScreen('wheelScreen');$('#wheelLotTotal').textContent=lots.length;
  if(currentUser){currentUser.games=(currentUser.games||0)+1;saveUser();}
  SFX.whoosh();renderWheelScreen(true);
}
function buildWheelSVG(items){
  const sz=300,r=sz/2,cx=r,cy=r,n=items.length;if(!n)return'';
  const ap=360/n;let svg=`<svg viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="wg"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".55" stop-color="#000" stop-opacity="0"/></radialGradient></defs>`;
  items.forEach((h,i)=>{
    const s=i*ap,e=s+ap,mid=s+ap/2,fc=h.color||'#2A3350';
    if(n===1)svg+=`<circle cx="${cx}" cy="${cy}" r="${r-2}" fill="${fc}" stroke="#0B0E14" stroke-width="1.5"/>`;
    else{const la=ap>180?1:0,sx=cx+r*Math.cos(s*Math.PI/180),sy=cy+r*Math.sin(s*Math.PI/180),ex=cx+r*Math.cos(e*Math.PI/180),ey=cy+r*Math.sin(e*Math.PI/180);
      svg+=`<path d="M${cx},${cy} L${sx},${sy} A${r},${r} 0 ${la} 1 ${ex},${ey} Z" fill="${fc}" stroke="#0B0E14" stroke-width="1.5"/>`;}
    const lr=r*0.64,tx=cx+lr*Math.cos(mid*Math.PI/180),ty=cy+lr*Math.sin(mid*Math.PI/180);let la2=mid+90;if(mid>90&&mid<270)la2+=180;
    const fs=n>16?7:(n>10?9:11.5),lbl=h.name.length>12?h.name.slice(0,11)+'…':h.name;
    svg+=`<text x="${tx}" y="${ty}" fill="#fff" stroke="#000" stroke-opacity=".6" stroke-width="2.2" paint-order="stroke" font-size="${fs}" font-family="Sora,Inter,sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="middle" transform="rotate(${la2},${tx},${ty})">${esc(lbl.toUpperCase())}</text>`;
  });
  return svg+`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#wg)"/></svg>`;
}
function renderWheelScreen(rebuild){
  if(!wheelState||!state)return;
  const total=wheelState.lots.length,done=total-wheelState.remaining.length;
  $('#wheelLotIndex').textContent=Math.min(done+1,total);
  $('#wheelProgress').textContent=t('wheelProgress',{a:done,b:total});
  const te=$('#wheelTurnLabel');te.textContent=t('turnOf',{n:pname(wheelState.turn)});te.className='wheel-turn p'+wheelState.turn;
  renderTeams('#wheelTeams','wheel');
  if(rebuild){const sp=$('#wheelSpinner');sp.style.transition='none';sp.innerHTML=buildWheelSVG(wheelState.remaining);sp.style.transform='rotate(0deg)';void sp.offsetWidth;sp.style.transition='';}
  const sb=$('#wheelSpinBtn'),we=$('#wheelWatching');
  if(onlineMode){
    const my=(isHost&&wheelState.turn===1)||(!isHost&&wheelState.turn===2);
    sb.style.display=my?'inline-flex':'none';we.style.display=(!my&&!wheelState.spinning)?'block':'none';
    if(wheelState.spinning){sb.style.display='none';we.style.display='block';}
    if(my&&!wheelState.spinning){sb.disabled=!wheelState.remaining.length;we.style.display='none';}
  }else if(vsBotMode){
    if(wheelState.turn===2){sb.style.display='none';we.style.display='block';if(!wheelState.spinning)botWheelTick();}
    else{sb.style.display='inline-flex';we.style.display='none';sb.disabled=wheelState.spinning||!wheelState.remaining.length;}
  }else{sb.style.display='inline-flex';we.style.display='none';sb.disabled=wheelState.spinning||!wheelState.remaining.length;}
  $('#wheelResult').textContent=wheelState.lastAssigned||'';
  if(onlineMode&&isHost)syncGuest();
}
ACT.spinWheel=()=>{
  if(!wheelState||wheelState.spinning||!wheelState.remaining.length)return;
  if(onlineMode){if(isHost&&wheelState.turn===1)triggerWheelSpin();else if(!isHost&&wheelState.turn===2){sendAction({action:'spin'});$('#wheelSpinBtn').disabled=true;}}
  else if(vsBotMode){if(wheelState.turn===1)triggerWheelSpin();}
  else triggerWheelSpin();
};
function wheelTickSounds(){
  let tc=0;(function st(){if(tc>=28||!wheelState||!wheelState.spinning&&tc>2)return;const p=tc/28,d=40+Math.pow(p,2.2)*260;
    setTimeout(()=>{SFX.wheelTick();const pt=$('#wheelPointer');pt.classList.remove('tick');void pt.offsetWidth;pt.classList.add('tick');tc++;st();},d);})();
}
function triggerWheelSpin(){
  if(!wheelState||wheelState.spinning||!wheelState.remaining.length)return;
  wheelState.spinning=true;
  const rem=wheelState.remaining,n=rem.length,wi=rand(0,n-1),ap=360/n,mid=wi*ap+ap/2,target=5*360+(((270-mid)%360)+360)%360;
  const snap=rem.map(h=>({...h})),sp=$('#wheelSpinner');
  sp.style.transition='none';sp.innerHTML=buildWheelSVG(rem);sp.style.transform='rotate(0deg)';void sp.offsetWidth;
  sp.style.transition='transform 3.2s cubic-bezier(0.15,0.85,0.25,1)';sp.style.transform='rotate('+target+'deg)';
  if(onlineMode&&isHost)syncGuest({spinTarget:target,spinRemainingSnapshot:snap});
  $('#wheelSpinBtn').style.display='none';SFX.whoosh();wheelTickSounds();
  later(()=>assignWheelHero(wi),3300);
}
function botWheelTick(){
  if(!vsBotMode||!wheelState||wheelState.turn!==2||wheelState.spinning||!wheelState.remaining.length)return;
  later(()=>{if(vsBotMode&&wheelState&&wheelState.turn===2&&!wheelState.spinning)triggerWheelSpin();},700+Math.random()*700);
}
function computeNextWheelTurn(p){
  const other=p===1?2:1,om=state.players[other].heroes.length>=wheelState.maxHeroes,sm=state.players[p].heroes.length>=wheelState.maxHeroes;
  if(om&&sm)return null;if(om)return p;return other;
}
function wheelReveal(h,p){
  return `<div class="reveal" style="--tc:${tm(h).color}">${portrait(h,'fill')}</div>${esc(h.name)}<br><span class="small" style="color:${p===1?'var(--cyan)':'var(--crimson)'}">${esc(pname(p))}</span>`;
}
function assignWheelHero(wi){
  if(!wheelState)return;
  const h=wheelState.remaining[wi];wheelState.remaining.splice(wi,1);
  const p=wheelState.turn;state.players[p].heroes.push({...h});
  const wfl=$('#wheelFlash');$('#wheelFlashText').innerHTML=wheelReveal(h,p);wfl.classList.add('show');
  SFX.wheelLand();const c=centerOf($('.wheel-stage'));FX.burst(c.x,c.y,'energy',1.2);
  wheelState.lastAssigned=`${h.name} → ${pname(p)}`;wheelState.spinning=false;
  const nt=computeNextWheelTurn(p);if(nt)wheelState.turn=nt;
  if(onlineMode&&isHost)syncGuest();
  later(()=>{wfl.classList.remove('show');if(!nt||!wheelState.remaining.length)finishWheelDraft();else renderWheelScreen(true);},1500);
}
function finishWheelDraft(){
  if(state.players[1].heroes.length>0&&state.players[2].heroes.length>0)startBattle();else showFinalResults();
}

/* ═══════════════════════════ DÖYÜŞ ═══════════════════════════ */
function startBattle(){
  /* bot öz sırasını insanın sırasına qarşı optimallaşdırır (insan sırası alış sırasıdır) */
  if(vsBotMode&&state.players[2].heroes.length>1){
    state.players[2].heroes=botOptimizeOrder(state.players[2].heroes,state.players[1].heroes);
  }
  gameEpoch++;
  const prep=team=>team.map(h=>({...h,curHp:h.health*10,maxHp:h.health*10,eliminated:false,wins:0}));
  battleState={t1:prep(state.players[1].heroes),t2:prep(state.players[2].heroes),idx1:0,idx2:0,history:[],results:[],
    status:'',championDone:false,championText:'',championSub:'',championColor:'',speed:battleState&&battleState.speed||1,seq:0,fx:{id:0},ko:{id:0},round:1};
  ui.pair='';ui.lastFx=0;ui.lastKo=0;ui.histLen=-1;ui.rewarded=false;ui.recorded=false;ui.matchStart=Date.now();
  showScreen('arenaScreen');
  $('#championBanner').style.display='none';$('#toResultsBtn').style.display='none';$('#battleLog').innerHTML='';
  SFX.whoosh();
  setupPair();
}
function winPips(){return battleState.results;}
function renderStrips(){
  [[1,'#strip1',battleState.t1,battleState.idx1],[2,'#strip2',battleState.t2,battleState.idx2]].forEach(([p,sel,team,idx])=>{
    $(sel).innerHTML=team.map((h,i)=>`<span class="sp${h.eliminated?' dead':''}${i===idx&&!h.eliminated&&!battleState.championDone?' cur':''}" title="${esc(h.name)}">${portrait(h,'fill')}</span>`).join('');
  });
  const alive1=battleState.t1.filter(h=>!h.eliminated).length,alive2=battleState.t2.filter(h=>!h.eliminated).length;
  $('#roundNo').textContent=battleState.round;$('#roundTotal').textContent=alive1+' : '+alive2;
  const pips=battleState.results.map(r=>`<i class="rpip ${r}"></i>`);
  if(!battleState.championDone)pips.push('<i class="rpip cur"></i>');
  $('#roundPips').innerHTML=pips.join('');
}
function fighterHTML(side,h){
  const p=side==='left'?1:2,pct=Math.max(0,Math.round(h.curHp/h.maxHp*100));
  const tag=side==='left'?`<span class="tag tag-cyan">P1 ${t('ally')}</span>`:`<span class="tag tag-red">${quickBot?esc(quickBotName):vsBotMode?'BOT':'P2'} ${t('enemy')}</span>`;
  const st=(l,v,c)=>`<div class="fc-stat"><span>${l}</span><div class="gauge thin" style="--v:${v}%;--gc:${c}"><i></i></div><b class="num">${v}</b></div>`;
  return `<div class="fc-top">${tag}<span class="fc-lvl">${t('tierWord')} ${h.tier} · ${esc(h.fr)}</span></div>
    <div class="f-art" style="--tc:${tm(h).color}">${portrait(h)}<div class="f-hit"></div><div class="f-name">${esc(h.name)}</div></div>
    <div class="f-bio fc-bio">${esc(bioOf(h))}</div>
    <div class="fc-hp"><div class="row"><span>HP</span><b class="num hp-num">${Math.max(0,Math.round(h.curHp))}/${h.maxHp}</b></div>
      <div class="gauge hp${pct<30?' low':''}"><i class="ghost" style="--v:${pct}%"></i><i class="fill" style="--v:${pct}%"></i></div></div>
    <div class="fc-stats">${st('PWR',h.power,'var(--crimson)')}${st('SPD',h.speed,'var(--gold)')}${st('DEF',h.defense,'var(--cyan)')}</div>
    <div class="fc-wins">${'<span class="ms win-star">star</span>'.repeat(h.wins||0)}</div>`;
}
function renderFighter(side,h,enter){
  const el=$(side==='left'?'#fLeft':'#fRight');
  el.className='fcard '+side+' p'+(side==='left'?1:2);
  el.innerHTML=fighterHTML(side,h);
  if(enter){el.classList.add(side==='left'?'enter-l':'enter-r');}
}
function hpOf(side){return side==='left'?battleState.t1[battleState.idx1]:battleState.t2[battleState.idx2];}
function updateHp(side){
  const h=hpOf(side);if(!h)return;
  const el=$(side==='left'?'#fLeft':'#fRight'),pct=Math.max(0,Math.round(h.curHp/h.maxHp*100));
  const g=$('.gauge.hp',el);if(!g)return;
  $('.fill',g).style.setProperty('--v',pct+'%');$('.ghost',g).style.setProperty('--v',pct+'%');
  g.classList.toggle('low',pct<30&&pct>0);
  $('.hp-num',el).textContent=Math.max(0,Math.round(h.curHp))+'/'+h.maxHp;
}
function updateWins(){
  ['left','right'].forEach(side=>{const h=hpOf(side),el=$(side==='left'?'#fLeft':'#fRight'),w=$('.fc-wins',el);if(h&&w)w.innerHTML='<span class="ms win-star">star</span>'.repeat(h.wins||0);});
}

function setupPair(){
  ui.fighting=false;
  const h1=battleState.t1[battleState.idx1],h2=battleState.t2[battleState.idx2];
  if(!h1||!h2){endBattle();return;}
  renderPair(true);
  battleState.status=t('readyNext');$('#fightStatus').textContent=battleState.status;
  const b=$('#nextFightBtn');b.disabled=true;b.style.display='none';   // düymə yoxdur: döyüş avtomatik başlayır
  $('#clashText').textContent=t('clashIdle');
  if(onlineMode&&isHost)syncGuest();
  if(!onlineMode||isHost)later(()=>{if(battleState&&!battleState.championDone)ACT.runFight();},1500/(battleState.speed||1));
}
function renderPair(animate){
  const h1=battleState.t1[battleState.idx1],h2=battleState.t2[battleState.idx2];if(!h1||!h2)return;
  ui.pair=battleState.idx1+'-'+battleState.idx2;
  renderFighter('left',h1,animate);renderFighter('right',h2,animate);
  renderStrips();
  if(animate){
    const vs=$('#vsCore');vs.classList.remove('boom');void vs.offsetWidth;vs.classList.add('boom');
    SFX.vs();const c=centerOf(vs);FX.ring(c.x,c.y,'#00F0FF',140,600);FX.ring(c.x,c.y,'#FF2A55',100,700);
  }
}
function setBanner(html,ms=1300){
  const b=$('#stageBanner');b.innerHTML=html;b.classList.remove('show');void b.offsetWidth;b.classList.add('show');
  setTimeout(()=>b.classList.remove('show'),ms);
}
ACT.toggleSpeed=()=>{
  if(!battleState)return;battleState.speed=battleState.speed===1?2:1;
  $('#speedVal').textContent=battleState.speed+'X';SFX.toggle();if(onlineMode&&isHost)syncGuest();
};
ACT.toggleMusic=()=>{SFX.setMusic(!SFX.settings.music);$('#muteMusicBtn').classList.toggle('off',!SFX.settings.music);SFX.toggle();};

ACT.runFight=()=>{
  if(onlineMode&&!isHost)return;
  if(!battleState||battleState.championDone||ui.fighting)return;
  ui.fighting=true;
  const b=$('#nextFightBtn');b.disabled=true;
  battleState.status=t('fighting');$('#fightStatus').textContent=battleState.status;
  const k=1/(battleState.speed||1);
  setBanner(`${t('fightBang')}<small>${esc(battleState.t1[battleState.idx1].name)} VS ${esc(battleState.t2[battleState.idx2].name)}</small>`,900*k+400);
  SFX.ready();
  if(onlineMode&&isHost)syncGuest();
  later(simStep,800*k);
};

/* — hücum animasiyası (həm host, həm qonaq oxuyur) — */
const artEl=side=>$((side==='left'?'#fLeft':'#fRight')+' .f-art');
function floatDmg(side,dmg,crit){
  const card=$(side==='left'?'#fLeft':'#fRight');if(!card)return;
  const d=document.createElement('div');d.className='dmg-float'+(crit?' crit':'');
  d.innerHTML=`−${dmg}${crit?`<small>${t('crit')}</small>`:''}`;
  d.style.left=(40+Math.random()*20)+'%';card.appendChild(d);setTimeout(()=>d.remove(),1200);
}
function impactFx(victim,style,dmg,crit,k){
  const el=artEl(victim);if(!el||!battleState)return;
  const c=centerOf(el);
  FX.burst(c.x,c.y,style,crit?1.6:clamp(dmg/90,.7,1.3));
  SFX.hit(style,crit);
  el.animate([{transform:'translateX(0) rotate(0)'},{transform:`translateX(${victim==='left'?-10:10}px) rotate(${victim==='left'?-2:2}deg)`},{transform:'translateX(-5px)'},{transform:'translateX(0)'}],{duration:340*k,composite:'add'});
  const hit=$('.f-hit',el);if(hit)hit.animate([{opacity:.95},{opacity:0}],{duration:380*k});
  floatDmg(victim,dmg,crit);updateHp(victim);
  if(crit||dmg>70){const st=$('#arenaStage');st.classList.remove('shake');void st.offsetWidth;st.classList.add('shake');setTimeout(()=>st.classList.remove('shake'),420);}
}
function playHit(fx){
  const k=1/(battleState.speed||1);
  [['left',fx.sL,fx.dL,fx.cL],['right',fx.sR,fx.dR,fx.cR]].forEach(([side,style,dmg,crit])=>{
    const from=artEl(side),victim=side==='left'?'right':'left',to=artEl(victim);if(!from||!to)return;
    const a=centerOf(from),b=centerOf(to),dir=side==='left'?1:-1,lunge=Math.min(64,Math.abs(b.x-a.x)*.3)*dir;
    from.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${-16*dir}px,2px) scale(.95)`,offset:.2},{transform:`translate(${lunge}px,-6px) scale(1.09)`,offset:.42},{transform:'translate(0,0) scale(1)'}],{duration:780*k,easing:'cubic-bezier(.3,.7,.3,1)'});
    later(()=>SFX.swing(style),60*k);
    later(()=>FX.projectile(style,a.x,a.y,b.x,b.y,240*k,()=>impactFx(victim,style,dmg,crit,k)),150*k);
  });
  /* "Ability clash" panelı: ən böyük zərbə */
  const big=fx.dL>=fx.dR?{att:fx.nL,vic:fx.nR,st:fx.sL,d:fx.dL,c:fx.cL}:{att:fx.nR,vic:fx.nL,st:fx.sR,d:fx.dR,c:fx.cR};
  const m=STYLE_META[big.st]||STYLE_META.energy;
  $('#clashIco').style.setProperty('--sc',m.c[0]);$('#clashIco').innerHTML=`<span class="ms">${m.icon}</span>`;
  $('#clashTag').textContent=big.c?t('critStrike'):t('exchange');
  $('#clashText').innerHTML=`<b>${esc(big.att)}</b> ${t('triggers')} <b style="color:${m.c[0]}">${t('fx_'+big.st)}</b> — <b style="color:var(--crimson)">−${big.d}</b> ${t('on')} ${esc(big.vic)}`;
}
function playKO(ko){
  const k=1/(battleState.speed||1);
  const sides=ko.loser==='both'?['left','right']:[ko.loser];
  later(()=>{
    sides.forEach(s=>{const el=$(s==='left'?'#fLeft':'#fRight');el&&el.classList.add('ko');});
    if(ko.loser!=='both'){const w=ko.loser==='left'?'right':'left';const el=$(w==='left'?'#fLeft':'#fRight');el&&el.classList.add('winpose');}
    SFX.ko();
    sides.forEach(s=>{const c=centerOf(artEl(s));FX.burst(c.x,c.y,'impact',1.8);FX.ring(c.x,c.y,'#FF2A55',180,800);});
    setBanner(ko.loser==='both'?`${t('draw')}<small>${t('bothDown')}</small>`:`K.O.<small>${esc(ko.winner)}</small>`,1400);
    updateWins();renderStrips();
  },350*k);
}

/* — simulyasiya (düstur dəyişməyib) — */
function simStep(){
  if(!battleState)return;
  const h1=battleState.t1[battleState.idx1],h2=battleState.t2[battleState.idx2];if(!h1||!h2)return;
  const k=1/(battleState.speed||1);
  const s1=h1.speed>=h2.speed?1.1:0.9,s2=h2.speed>=h1.speed?1.1:0.9;
  const n2=rand(-5,5),n1=rand(-5,5);
  const d2=Math.max(10,Math.round((h1.power*1.5-h2.defense*0.8)*s1+n2));
  const d1=Math.max(10,Math.round((h2.power*1.5-h1.defense*0.8)*s2+n1));
  h2.curHp-=d2;h1.curHp-=d1;
  const fx={id:++battleState.seq,nL:h1.name,nR:h2.name,sL:heroStyle(h1),sR:heroStyle(h2),dL:d2,dR:d1,cL:n2>=4,cR:n1>=4};
  battleState.fx=fx;ui.lastFx=fx.id;
  battleState.history.push({s:Math.floor((Date.now()-ui.matchStart)/1000),n1:h1.name,n2:h2.name,d1,d2,s1:fx.sR,s2:fx.sL,c1:fx.cR,c2:fx.cL});
  playHit(fx);renderBattleLog();
  if(onlineMode&&isHost)syncGuest();
  if(h1.curHp<=0||h2.curHp<=0)later(()=>resolveWinner(h1,h2),1000*k);
  else later(simStep,1150*k);
}
function resolveWinner(h1,h2){
  if(!battleState)return;
  let loser,winner='',res;
  if(h1.curHp<=0&&h2.curHp<=0){battleState.status=t('draw');h1.eliminated=true;h2.eliminated=true;battleState.idx1++;battleState.idx2++;loser='both';res='draw';}
  else if(h1.curHp<=0){battleState.status=t('winsFight',{n:h2.name});h1.eliminated=true;h2.wins++;battleState.idx1++;loser='left';winner=h2.name;res='p2';}
  else{battleState.status=t('winsFight',{n:h1.name});h2.eliminated=true;h1.wins++;battleState.idx2++;loser='right';winner=h1.name;res='p1';}
  battleState.results.push(res);battleState.round++;
  const ko={id:++battleState.seq,loser,winner};battleState.ko=ko;ui.lastKo=ko.id;
  $('#fightStatus').textContent=battleState.status;
  playKO(ko);
  if(onlineMode&&isHost)syncGuest();
  const k=1/(battleState.speed||1);
  later(()=>{
    if(battleState.idx1<battleState.t1.length&&battleState.idx2<battleState.t2.length)setupPair();else endBattle();
  },2000*k);
}
function renderBattleLog(){
  const h=battleState.history;if(ui.histLen===h.length)return;ui.histLen=h.length;
  $('#battleLog').innerHTML=h.slice().reverse().slice(0,20).map(e=>{
    const st1=STYLE_META[e.s1]||STYLE_META.energy,st2=STYLE_META[e.s2]||STYLE_META.energy;
    return `<div class="feed-row"><span class="t num">[${fmtTime(e.s)}]</span><span class="ms" style="color:${st2.c[0]}">${st2.icon}</span><span><b class="p1">${esc(e.n1)}</b> <b>−${e.d1}</b>${e.c1?' <b class="g">★</b>':''} &nbsp;·&nbsp; <b class="p2">${esc(e.n2)}</b> <b>−${e.d2}</b>${e.c2?' <b class="g">★</b>':''}</span></div>`;
  }).join('');
}
function renderBattleFromState(){
  /* qonaq tərəf: host-dan gələn vəziyyəti göstərir, yeni hadisələri oynayır */
  const bs=battleState;if(!bs)return;
  $('#fightStatus').textContent=bs.status||'';$('#speedVal').textContent=(bs.speed||1)+'X';
  $('#nextFightBtn').style.display='none';
  const pair=bs.idx1+'-'+bs.idx2;
  if(!bs.championDone){
    if(ui.pair!==pair&&bs.t1[bs.idx1]&&bs.t2[bs.idx2]){renderPair(true);}
    else if(!ui.pair)renderPair(false);
  }
  renderStrips();renderBattleLog();
  if(bs.fx&&bs.fx.id>ui.lastFx){ui.lastFx=bs.fx.id;playHit(bs.fx);}
  if(bs.ko&&bs.ko.id>ui.lastKo){ui.lastKo=bs.ko.id;playKO(bs.ko);}
  if(bs.championDone)showChampion(true);
}

function endBattle(){
  $('#nextFightBtn').style.display='none';
  const a1=battleState.t1.filter(h=>!h.eliminated).length,a2=battleState.t2.filter(h=>!h.eliminated).length;
  battleState.championDone=true;
  let reward=0;
  if(a1>a2){
    battleState.championText=t('p1Wins');battleState.championColor='var(--cyan)';battleState.championSub=t('p1WinsSub');
    if(currentUser&&!onlineMode||currentUser&&isHost){reward=a1===battleState.t1.length?80:50;currentUser.wins=(currentUser.wins||0)+1;currentUser.coins+=reward;saveUser();}
  }else if(a2>a1){
    battleState.championText=t('p2Wins');battleState.championColor='var(--crimson)';battleState.championSub=t('p2WinsSub');
  }else{battleState.championText=t('tie');battleState.championColor='var(--gold)';battleState.championSub=t('tieSub');}
  battleState.winner=a1>a2?1:a2>a1?2:0;
  ui.rewarded=true;
  if(quickMatch&&(onlineMode||quickBot)&&!ui.recorded){ui.recorded=true;recordQuickResult(battleState.winner===myPlayer());}
  showChampion(false,reward);
  if(onlineMode&&isHost)syncGuest();
}
function showChampion(fromSync,reward=0){
  const bs=battleState;
  $('#championBanner').style.display='block';
  const ct=$('#championText');ct.textContent=bs.championText;ct.style.color=bs.championColor||'';$('#championSub').textContent=bs.championSub;
  $('#toResultsBtn').style.display=(!onlineMode||isHost)?'flex':'none';
  $('#nextFightBtn').style.display='none';
  if(!fromSync||!ui.rewarded){
    ui.rewarded=true;
    const me=myPlayer();
    if(fromSync&&quickMatch&&onlineMode&&!ui.recorded){ui.recorded=true;recordQuickResult(bs.winner===me);}
    later(()=>{
      if(bs.winner===0)SFX.draw();else if(bs.winner===me)SFX.victory();else SFX.defeat();
      if(bs.winner){FX.confetti(bs.winner===me?160:50);}
      const el=$('#championBanner');el.scrollIntoView({behavior:'smooth',block:'center'});
    },900);
    /* qonaq P2 qalib gələrsə o da mükafat alsın (köhnə versiyada yalnız host alırdı) */
    if(fromSync&&onlineMode&&!isHost&&bs.winner===2&&currentUser){
      const r=bs.t2.filter(h=>!h.eliminated).length===bs.t2.length?80:50;currentUser.wins=(currentUser.wins||0)+1;currentUser.coins+=r;saveUser();reward=r;
    }
    if(reward>0)later(()=>{toast(t('rewardToast',{n:reward}),'gold');SFX.coin();FX.coins(innerWidth/2,innerHeight*.4,30);},1500);
  }
  renderStrips();
}
ACT.toResults=()=>showFinalResults();

/* ═══════════════════════════ NƏTİCƏ ═══════════════════════════ */
function showFinalResults(){
  showScreen('endScreen');
  $('#p1BudgetFinal').textContent=state.mode==='auction'?'$'+state.players[1].budget:'';
  $('#p2BudgetFinal').textContent=state.mode==='auction'?'$'+state.players[2].budget:'';
  $('#endP1Name').textContent=pname(1);$('#endP2Name').textContent=pname(2);
  const bs=battleState;
  const a1=bs?bs.t1.filter(h=>!h.eliminated).length:0,a2=bs?bs.t2.filter(h=>!h.eliminated).length:0;
  $('#endTitle').textContent=bs?(a1>a2?t('p1Wins'):a2>a1?t('p2Wins'):t('tie')):t('results');
  $('#endSummary').textContent=bs?t('survivors',{a:a1,b:a2}):'';
  const rb=$('#coinRewardBanner');
  if(bs&&a1>a2&&currentUser&&(!onlineMode||isHost)){rb.style.display='flex';$('#coinRewardText').textContent=t('rewardEnd',{n:a1===bs.t1.length?80:50});}
  else rb.style.display='none';
  renderFinalList(1,'#p1ListFinal');renderFinalList(2,'#p2ListFinal');
  $('#restartBtn').style.display=(!onlineMode||isHost)?'inline-flex':'none';
  if(onlineMode&&isHost)syncGuest();
}
function renderFinalList(p,sel){
  const heroes=state.players[p].heroes,box=$(sel);
  if(!heroes.length){box.innerHTML=`<div class="dim" style="padding:10px">${t('noHeroYet')}</div>`;return;}
  box.innerHTML=heroes.map(h=>{
    const bh=battleState?(p===1?battleState.t1:battleState.t2).find(b=>b.name===h.name):null;
    const rt=bh&&bh.wins>0?`🏆${bh.wins}`:(h.boughtPrice!==undefined?`$${h.boughtPrice}`:'🎡');
    return `<div class="r-row${bh&&bh.eliminated?' dead':''}" style="--tc:${tm(h).color}">${portrait(h)}<div><div class="nm">${esc(h.name)}</div><div class="fr">${esc(h.fr)}</div></div><span class="rt">${rt}</span></div>`;
  }).join('');
}
ACT.restart=()=>{
  if(onlineMode&&!isHost)return;
  if(quickMatch){                                   // Tez oyun: yenidən rəqib axtarışına qayıt
    gameEpoch++;state=null;battleState=null;wheelState=null;ui.lotIdx=-1;
    leaveOnline();quickBot=false;vsBotMode=false;quickMatch=false;
    $('#gameConfig').style.display='none';$('#lobbySelect').style.display='block';showScreen('lobbyScreen');return;
  }
  gameEpoch++;state=null;battleState=null;wheelState=null;ui.lotIdx=-1;
  $('#gameConfig').style.display='block';$('#lobbySelect').style.display='none';
  showScreen('lobbyScreen');showConfigScreen();
  if(onlineMode&&isHost&&conn&&conn.open)conn.send({type:'reset'});
};

/* ═══════════════════════════ SİNXRONİZASİYA ═══════════════════════════ */
function currentScreenName(){
  const a=$('.screen.active');if(!a)return'home';
  return {draftScreen:'game',wheelScreen:'wheel',arenaScreen:'battle',endScreen:'end'}[a.id]||'home';
}
function syncGuest(extra){
  if(!(onlineMode&&isHost&&conn&&conn.open))return;
  const fl=$('#flash'),wfl=$('#wheelFlash');
  const p={type:'sync',screen:currentScreenName(),state,battleState,wheelState,
    flashShow:fl.classList.contains('show'),flashText:$('#flashText').innerHTML,
    wheelFlashShow:wfl.classList.contains('show'),wheelFlashText:$('#wheelFlashText').innerHTML};
  if(extra)Object.assign(p,extra);
  try{conn.send(p);}catch(e){}
}
function countGuestGame(){if(!ui.counted&&currentUser){ui.counted=true;currentUser.games=(currentUser.games||0)+1;saveUser();}}
function applySync(pl){
  const prevScreen=currentScreenName();
  state=pl.state;battleState=pl.battleState;wheelState=pl.wheelState;
  if(!state){showScreen('waitScreen');return;}
  if(pl.screen==='game'){
    if(prevScreen!=='game'){ui.lotIdx=-1;ui.counted=false;ui.rewarded=false;}
    countGuestGame();
    showScreen('draftScreen');$('#lotTotal').textContent=state.lots.length;
    renderAuction();
    const fl=$('#flash');$('#flashText').innerHTML=pl.flashText||'';fl.classList.toggle('show',!!pl.flashShow);
  }else if(pl.screen==='wheel'){
    countGuestGame();
    showScreen('wheelScreen');$('#wheelLotTotal').textContent=wheelState.lots.length;
    const showFlash=()=>{const wfl=$('#wheelFlash');$('#wheelFlashText').innerHTML=pl.wheelFlashText||'';wfl.classList.toggle('show',!!pl.wheelFlashShow);};
    if(pl.spinTarget!==undefined){
      const sp=$('#wheelSpinner');sp.style.transition='none';sp.innerHTML=buildWheelSVG(pl.spinRemainingSnapshot||wheelState.remaining);sp.style.transform='rotate(0deg)';void sp.offsetWidth;
      sp.style.transition='transform 3.2s cubic-bezier(0.15,0.85,0.25,1)';sp.style.transform='rotate('+pl.spinTarget+'deg)';
      $('#wheelWatching').style.display='block';SFX.whoosh();wheelState.spinning=true;wheelTickSounds();
      setTimeout(()=>{$('#wheelWatching').style.display='none';renderWheelScreen(true);showFlash();},3400);
    }else{
      if(pl.wheelFlashShow&&prevScreen==='wheel'){SFX.wheelLand();}
      renderWheelScreen(!pl.skipRebuild&&!pl.wheelFlashShow);showFlash();
    }
  }else if(pl.screen==='battle'){
    if(prevScreen!=='battle'){ui.pair='';ui.lastFx=0;ui.lastKo=0;ui.histLen=-1;ui.rewarded=false;ui.recorded=false;ui.matchStart=Date.now();}
    showScreen('arenaScreen');renderBattleFromState();
  }else if(pl.screen==='end'){showFinalResults();}
}

/* arena taymeri */
setInterval(()=>{
  if(!$('#arenaScreen').classList.contains('active')||!battleState||battleState.championDone)return;
  $('#matchTimer').textContent=fmtTime((Date.now()-ui.matchStart)/1000);
},1000);
