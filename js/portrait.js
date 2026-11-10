/* ══════════════════════════════════════════════════════════════
   KAHRAMAN PORTRETLƏRİ
   Sıra:  1) yerli şəkil (HERO_LOCAL)  →  2) orijinal "img" linki  →  3) avtomatik HUD portreti
   Şəkil yüklənməsə (link ölübsə) istifadəçi heç vaxt boş/qırıq şəkil görmür.
   ══════════════════════════════════════════════════════════════ */
let _pfId=0;
function shade(hex,amt){
  const n=parseInt(hex.replace('#',''),16);
  const r=clamp(((n>>16)&255)+amt,0,255),g=clamp(((n>>8)&255)+amt,0,255),b=clamp((n&255)+amt,0,255);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
function heroSrc(h){return HERO_LOCAL[slug(h.name)]||h.img||'';}
function tierColor(h){return (TIER_META[h.tier]||TIER_META.C).color;}

/* Orijinal, ümumi HUD portreti: rəngli işıq, şüalar, silueti, baş hərflər, tier ulduzları */
function fallbackSVG(h){
  const id='pf'+(++_pfId),c=h.color||'#4A5878',c2=shade(c,-70),c3=shade(c,60),tc=tierColor(h);
  const stars=(TIER_META[h.tier]||TIER_META.C).stars;
  let rays='';for(let i=0;i<18;i++){const a=i*20*Math.PI/180,a2=(i*20+7)*Math.PI/180;rays+=`<path d="M100,95 L${100+260*Math.cos(a)},${95+260*Math.sin(a)} L${100+260*Math.cos(a2)},${95+260*Math.sin(a2)}Z"/>`;}
  let st='';for(let i=0;i<stars;i++)st+=`<path transform="translate(${100-(stars-1)*8+i*16},208) scale(.55)" d="M0-10 3-3 10-3 4 2 6 9 0 5-6 9-4 2-10-3-3-3Z"/>`;
  return `<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#0B0E14"/></linearGradient>
<radialGradient id="${id}b" cx="50%" cy="38%" r="55%"><stop offset="0" stop-color="${c3}" stop-opacity=".85"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="#05070b"/></linearGradient></defs>
<rect width="200" height="250" fill="url(#${id}a)"/>
<g fill="#fff" opacity=".07">${rays}</g>
<rect width="200" height="250" fill="url(#${id}b)"/>
<g opacity=".25" stroke="#fff" stroke-width=".6" fill="none"><path d="M0 40 L200 10"/><path d="M0 70 L200 40"/><path d="M0 200 L200 170"/></g>
<path d="M100 82c-17 0-30 14-30 31 0 14 7 25 17 31-30 8-52 28-56 66h138c-4-38-26-58-56-66 10-6 17-17 17-31 0-17-13-31-30-31z" fill="url(#${id}c)" stroke="${tc}" stroke-opacity=".55" stroke-width="1.5"/>
<text x="100" y="128" text-anchor="middle" font-family="Sora,Arial Black,sans-serif" font-weight="800" font-size="40" fill="#fff" stroke="${c2}" stroke-width="1.2" paint-order="stroke" letter-spacing="-1">${esc(h.init||h.name.slice(0,2).toUpperCase())}</text>
<g fill="${tc}">${st}</g>
<rect x=".75" y=".75" width="198.5" height="248.5" fill="none" stroke="${tc}" stroke-opacity=".35" stroke-width="1.5"/>
</svg>`;
}

/* Portret elementi (HTML string). Ölçünü parent CSS-i verir. */
function portrait(h,cls=''){
  const src=heroSrc(h);
  const img=src?`<img src="${esc(src)}" alt="${esc(h.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="this.classList.add('ok')" onerror="this.remove()">`:'';
  return `<div class="portrait ${cls}" style="--hc:${h.color};--tc:${tierColor(h)}"><div class="pf">${fallbackSVG(h)}</div>${img}</div>`;
}

/* Frame/aura ilə istifadəçi avatarı */
function avatarHTML(user,size=40){
  const eqF=SHOP_FRAMES.find(f=>f.id===(user?.equipped?.frame||'frame_none'));
  const eqE=SHOP_EFFECTS.find(f=>f.id===(user?.equipped?.effect||'effect_none'));
  const rb=eqF&&eqF.rainbow;
  const border=eqF&&eqF.style?eqF.style.replace('3px','3px'):'2px solid rgba(255,255,255,.2)';
  const glow=eqE&&eqE.glow?`box-shadow:${eqE.glow};`:'';
  return `<span class="av${rb?' rainbow':''}" style="width:${size}px;height:${size}px;font-size:${Math.round(size*.52)}px;border:${border};${glow}">${esc(user?.avatar||'👤')}</span>`;
}
