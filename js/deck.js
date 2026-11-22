/* ══════════════════════════════════════════════════════════════
   ÖZ DESTƏM — istifadəçi öz kartlarını yaradır (qalereyadan şəkil + ad + 4 göstərici)
   Yalnız otaq (kodla) oyununda istifadə olunur. Şəkillər serverə yüklənmir:
   cihazda saxlanır və otaq yaradanın destəsi qonağa birbaşa (P2P) göndərilir.
   ══════════════════════════════════════════════════════════════ */
const DECK_MAX=14,DECK_POINTS=300,STAT_MIN=30,STAT_MAX=99,CARD_COLORS=['#E53935','#1E88E5','#43A047','#FB8C00','#8E24AA','#00ACC1','#F4511E','#C0CA33','#D81B60','#5E35B1'];
let selectedDeck='std';                     // 'std' | 'custom'
let deckDraft={img:'',stats:{power:75,speed:75,defense:75,health:75}};

function deckKey(){return 'htb_deck_'+(currentUser?(currentUser.key||currentUser.username):'guest');}
function loadDeck(){try{const d=JSON.parse(storeGet(deckKey(),'[]'));return Array.isArray(d)?d:[];}catch(e){return[];}}
function saveDeck(d){try{localStorage.setItem(deckKey(),JSON.stringify(d));return true;}catch(e){toast(t('deckFull'),'red');return false;}}
function tierFromTotal(n){return n>=290?'S':n>=260?'A':n>=230?'B':'C';}
function cardHero(c){            // saxlanmış kart → oyunda istifadə olunan qəhrəman obyekti
  CUSTOM_IMG[c.id]=c.img;
  return{name:c.name,fr:c.group||'Öz',init:c.name.slice(0,2).toUpperCase(),color:c.color,tier:tierFromTotal(c.power+c.speed+c.defense+c.health),
    power:c.power,speed:c.speed,defense:c.defense,health:c.health,img:'custom:'+c.id,custom:true,bio:c.bio||''};
}
function deckHeroes(){return loadDeck().map(cardHero);}
function heroPool(){return selectedDeck==='custom'?deckHeroes():HEROES;}
const sumStats=s=>s.power+s.speed+s.defense+s.health;

/* şəkil → 4:5 kvadrata yaxın JPEG (baş yuxarıda qalsın deyə yuxarıdan kəsilir) */
function processImage(file){
  return new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onerror=()=>rej();
    fr.onload=()=>{const im=new Image();im.onerror=()=>rej();
      im.onload=()=>{
        const W=320,H=400,ar=W/H;let sw=im.naturalWidth,sh=im.naturalHeight,sx=0,sy=0;
        if(sw/sh>ar){const nw=sh*ar;sx=(sw-nw)/2;sw=nw;}else{sh=sw/ar;sy=0;}      // enli: ortadan, hündür: yuxarıdan
        const cv=document.createElement('canvas');cv.width=W;cv.height=H;
        const g=cv.getContext('2d');g.fillStyle='#0B0E14';g.fillRect(0,0,W,H);g.drawImage(im,sx,sy,sw,sh,0,0,W,H);
        res(cv.toDataURL('image/jpeg',.78));};
      im.src=fr.result;};
    fr.readAsDataURL(file);
  });
}
const IMG_OK=/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

/* ── Redaktor ekranı ── */
function renderDeck(){
  const d=loadDeck();
  $('#deckCount').textContent=d.length+' / '+DECK_MAX;
  $('#deckGroup').value=$('#deckGroup').value||(d[0]&&d[0].group)||'';
  $('#deckList').innerHTML=d.length?d.map(c=>{const tr=tierFromTotal(c.power+c.speed+c.defense+c.health);
    return `<div class="deck-row" style="--tc:${TIER_META[tr].color}"><img src="${esc(c.img)}" alt=""><div class="dr-info"><b>${esc(c.name)}</b>
      <small class="num">PWR ${c.power} · SPD ${c.speed} · DEF ${c.defense} · HP ${c.health}</small></div><span class="tag">${tr}</span>
      <button class="btn btn-ghost btn-sm" data-act="deckDel" data-arg="${esc(c.id)}"><span class="ms">delete</span></button></div>`;}).join('')
    :`<div class="dim" style="padding:14px;text-align:center">${t('deckEmpty')}</div>`;
  $('#deckAddCard').style.display=d.length>=DECK_MAX?'none':'';
  renderDraft();
}
function renderDraft(){
  const s=deckDraft.stats,used=sumStats(s),left=DECK_POINTS-used;
  ['power','speed','defense','health'].forEach(k=>{$('#ds_'+k).value=s[k];$('#dv_'+k).textContent=s[k];});
  const el=$('#deckPointsLeft');el.textContent=left;el.classList.toggle('neg',left<0);
  $('#deckPrev').innerHTML=deckDraft.img?`<img src="${deckDraft.img}" alt="">`:`<span class="ms">add_a_photo</span>`;
  $('#deckSaveBtn').disabled=left<0||!deckDraft.img;
}
ACT.openDeck=()=>{showScreen('deckScreen');renderDeck();};
ACT.deckBack=()=>{showScreen('lobbyScreen');ACT.deckMode(selectedDeck);};
ACT.deckPick=()=>$('#deckFile').click();
ACT.deckDel=id=>{saveDeck(loadDeck().filter(c=>c.id!==id));renderDeck();SFX.click();};
$('#deckFile').addEventListener('change',async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
  try{deckDraft.img=await processImage(f);renderDraft();}catch(err){toast(t('deckImgErr'),'red');SFX.error();}
});
$('#deckForm').addEventListener('input',e=>{
  const k=e.target.id&&e.target.id.startsWith('ds_')?e.target.id.slice(3):null;if(!k)return;
  deckDraft.stats[k]=clamp(+e.target.value,STAT_MIN,STAT_MAX);renderDraft();
});
ACT.deckSave=()=>{
  const name=$('#deckName').value.trim().slice(0,16),group=$('#deckGroup').value.trim().slice(0,16),d=loadDeck();
  if(!name){toast(t('deckNameNeed'),'red');SFX.error();return;}
  if(d.some(c=>c.name.toLowerCase()===name.toLowerCase())){toast(t('deckNameDup'),'red');SFX.error();return;}
  if(!deckDraft.img||sumStats(deckDraft.stats)>DECK_POINTS)return;
  const s=deckDraft.stats;
  d.push({id:'c'+Date.now().toString(36)+rand(100,999),name,group,img:deckDraft.img,color:CARD_COLORS[rand(0,CARD_COLORS.length-1)],power:s.power,speed:s.speed,defense:s.defense,health:s.health});
  if(!saveDeck(d))return;
  d.forEach(c=>{if(c.group!==group)c.group=group;});saveDeck(d);        // qrup adı bütün kartlarda eyni
  deckDraft={img:'',stats:{power:75,speed:75,defense:75,health:75}};$('#deckName').value='';
  SFX.sold();toast(t('deckAdded'),'green');renderDeck();
};
ACT.deckMode=mode=>{
  selectedDeck=mode;$('#dkStd').classList.toggle('active',mode==='std');$('#dkCustom').classList.toggle('active',mode==='custom');
  $('#deckEditBtn').style.display=mode==='custom'?'':'none';
  if(mode==='custom'){const n=loadDeck().length;$('#deckHint').textContent=t('deckHint',{n:selectedMaxHeroes*2,c:n});}
  else $('#deckHint').textContent='';
};
/* oyun başlayanda: destəni yoxla, şəkilləri qonağa göndər */
function prepareCustomDeck(){
  if(selectedDeck!=='custom')return true;
  const d=loadDeck(),need=selectedMaxHeroes*2;
  if(d.length<need){toast(t('deckTooFew',{n:need,c:d.length}),'red');SFX.error();return false;}
  d.forEach(c=>{CUSTOM_IMG[c.id]=c.img;});
  if(onlineMode&&isHost&&conn&&conn.open){const imgs={};d.forEach(c=>imgs[c.id]=c.img);try{conn.send({type:'deck',imgs});}catch(e){}}
  return true;
}
function receiveDeckImages(imgs){
  if(!imgs||typeof imgs!=='object')return;
  Object.keys(imgs).slice(0,DECK_MAX*2).forEach(id=>{const v=imgs[id];if(/^c[a-z0-9]{3,24}$/.test(id)&&typeof v==='string'&&v.length<220000&&IMG_OK.test(v))CUSTOM_IMG[id]=v;});
}

/* ── İnternetdən şəkil axtarışı (Vikipediya, açar tələb etmir) ── */
let lastWebQuery='',lastWebTitle='';
const WIKI_OK=/^https:\/\/upload\.wikimedia\.org\//;
const plain=x=>String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]+/g,' ').trim();
async function wikiJSON(host,params){
  const u=`https://${host}/w/api.php?${new URLSearchParams({format:'json',origin:'*',...params})}`;
  const r=await fetch(u);return r.json();
}
/* 1) yazı səhvini düzəldib ən uyğun məqalə adını tap  2) həmin şəxsin Vikipediya əsas şəkli  3) Commons-dan adında bu adı daşıyan şəkillər */
async function wikiSearch(q){
  let title='';
  for(const lang of ['en',currentLang==='tr'?'tr':'az']){
    try{const j=await wikiJSON(lang+'.wikipedia.org',{action:'query',list:'search',srsearch:q,srlimit:'1',srenablerewrites:'1'});
      const top=j.query&&j.query.search&&j.query.search[0];if(top){title=top.title;if(lang==='en')break;}}catch(e){}
    if(title)break;
  }
  if(!title)return{title:'',items:[]};
  const items=[];const add=(url,label)=>{if(WIKI_OK.test(url)&&!items.some(i=>i.url===url))items.push({url,title:label});};
  try{const j=await wikiJSON('en.wikipedia.org',{action:'query',titles:title,prop:'pageimages',piprop:'thumbnail',pithumbsize:'480',redirects:'1'});
    Object.values((j.query&&j.query.pages)||{}).forEach(pg=>{if(pg.thumbnail)add(pg.thumbnail.source,title);});}catch(e){}
  try{
    const j=await wikiJSON('commons.wikimedia.org',{action:'query',generator:'search',gsrnamespace:'6',gsrsearch:title,gsrlimit:'24',prop:'imageinfo',iiprop:'url|mime',iiurlwidth:'480'});
    const need=plain(title).split(' ').filter(w=>w.length>1);
    Object.values((j.query&&j.query.pages)||{}).sort((a,b)=>a.index-b.index).forEach(pg=>{
      const ii=pg.imageinfo&&pg.imageinfo[0];if(!ii||!/^image\/(jpeg|png|webp)$/.test(ii.mime||''))return;
      const name=plain(pg.title.replace(/^File:/,''));
      if(need.every(w=>name.includes(w)))add(ii.thumburl||ii.url,pg.title);});
  }catch(e){}
  return{title,items:items.slice(0,8)};
}
ACT.deckWeb=async()=>{
  const q=$('#deckName').value.trim();
  if(!q){toast(t('deckNameNeed'),'red');SFX.error();return;}
  const box=$('#deckWeb');box.style.display='block';box.innerHTML='<div class="spinner"></div>';
  const {title:found,items:res}=await wikiSearch(q);lastWebQuery=q;lastWebTitle=found;
  box.innerHTML=res.length?`<div class="web-found">${t('deckWebFound')}: <b>${esc(found)}</b></div>`+res.map(r=>`<button type="button" class="web-img" data-act="deckWebPick" data-arg="${esc(r.url)}" title="${esc(r.title)}"><img src="${esc(r.url)}" alt=""></button>`).join('')
    :`<div class="dim" style="padding:10px;text-align:center;grid-column:1/-1">${t('deckWebNone')}</div>`;
};
ACT.deckWebPick=async url=>{
  if(!/^https:\/\/upload\.wikimedia\.org\//.test(url))return;
  try{
    const r=await fetch(url);const b=await r.blob();
    deckDraft.img=await processImage(b);
    if(lastWebTitle&&$('#deckName').value.trim()===lastWebQuery)$('#deckName').value=lastWebTitle.slice(0,16);   // yazı səhvini düzəlt
    renderDraft();$('#deckWeb').style.display='none';SFX.click();
  }catch(e){toast(t('deckImgErr'),'red');SFX.error();}
};
