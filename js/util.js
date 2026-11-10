/* ═══ Kiçik köməkçi funksiyalar ═══ */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
const slug=n=>String(n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function fmtTime(sec){sec=Math.max(0,Math.floor(sec));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
function storeGet(k,def){try{const v=localStorage.getItem(k);return v===null?def:v;}catch(e){return def;}}
function storeSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function storeDel(k){try{localStorage.removeItem(k);}catch(e){}}

/* Düymələr üçün hadisə yönləndirmə: <button data-act="ad" data-arg="x"> → ACT.ad('x',el,event) */
const ACT={};
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');
  if(!a||a.disabled)return;
  const fn=ACT[a.dataset.act];
  if(fn)fn(a.dataset.arg,a,e);
});

function toast(msg,type=''){
  const el=$('#toast');
  el.textContent=msg;el.className='toast show '+(type||'');
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2600);
}
