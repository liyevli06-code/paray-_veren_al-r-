/* ══════════════════════════════════════════════════════════════
   BOT SİSTEMİ v2  (oyun qaydaları dəyişməyib, yalnız bot daha ağıllıdır)

   Köhnə bot yalnız "güc/sürət/müdafiə" cəminə baxıb büdcəni bölürdü.
   Yeni bot:
   1) Döyüş düsturunu özü bilir  → hər kahramanın REAL döyüş dəyərini (digərlərini yenmə ehtimalı) hesablayır
   2) "Kart sayma"               → hansı kahramanların artıq çıxdığını bilir, qalan lotların gözlənən keyfiyyətini qiymətləndirir
   3) Büdcə planlaşdırması       → hər lot üçün "ədalətli pay" + qalan boşluqları doldurmaq üçün ehtiyat
   4) Rəqibi oxuyur              → rəqibin büdcəsi/doluluğu, onun pas verib-vermədiyi, üstünlük olan zaman daha aqressiv
   5) Döyüş sırası optimallaşdırması → heyət bəlli olduqda, rəqibin sırasına qarşı ən yaxşı sıranı simulyasiya edir
   Səviyyələr: easy (səhv edir) / normal (planlı) / hard (hesablayır, rəqibi sıxışdırır)
   ══════════════════════════════════════════════════════════════ */
const BOT={
  level:'normal',
  cfg:{
    easy:  {noise:[.55,1.45],gamma:1.0,pool:false,oppAware:false,drain:0,passChance:.14,order:0,delay:[650,1300]},
    normal:{noise:[.88,1.14],gamma:1.6,pool:true, oppAware:true, drain:.06,passChance:0,  order:1,delay:[500,1000]},
    hard:  {noise:[.97,1.06],gamma:2.1,pool:true, oppAware:true, drain:.14,passChance:0,  order:2,delay:[450,900]}
  },
  get c(){return this.cfg[this.level]||this.cfg.normal;}
};

/* ── Döyüş modeli (battle simulyasiyası ilə eyni düstur, səs-küysüz) ── */
function botDmg(a,b,faster){return Math.max(10,Math.round((a.power*1.5-b.defense*0.8)*(faster?1.1:0.9)));}
function botExchange(a,b,hpA,hpB){
  const aFast=a.speed>=b.speed,bFast=b.speed>=a.speed;
  const dA=botDmg(a,b,aFast),dB=botDmg(b,a,bFast);          // a→b , b→a
  return {dA,dB,tA:Math.ceil(hpB/dA),tB:Math.ceil(hpA/dB)};  // a öldürmək üçün tA, b öldürmək üçün tB hərəkət
}
/* a-nın b-ni yenmə ehtimalı (hamar funksiya) */
function botWinProb(a,b){
  const x=botExchange(a,b,a.health*10,b.health*10);
  const r=(b.health*10/x.dA)/(a.health*10/x.dB);              // <1 → a daha tez öldürür
  return 1/(1+Math.pow(r,4.2));
}
const _valCache=new Map();
function botHeroValue(h){
  const k=h.name+'|'+h.power+'|'+h.speed+'|'+h.defense+'|'+h.health;
  if(_valCache.has(k))return _valCache.get(k);
  let s=0;for(const o of HEROES)if(o.name!==h.name)s+=botWinProb(h,o);
  const v=s/(HEROES.length-1);_valCache.set(k,v);return v;
}

/* ── Auksion qərarı ── */
function botSeenNames(st){return new Set(st.lots.slice(0,st.lotIdx+1).map(h=>h.name));}

function botMaxPrice(st){
  const c=BOT.c,me=st.players[2],opp=st.players[1];
  const lot=st.lots[st.lotIdx];
  const need=st.maxHeroes-me.heroes.length;
  if(need<=0)return 0;
  const lotsLeft=st.lots.length-st.lotIdx;                    // bu lot daxil
  const reserve=Math.max(0,(need-1)*st.inc);
  const spendable=me.budget-reserve;
  if(spendable<st.inc)return 0;

  /* qalan lotlar çatmırsa — hər lot vacibdir, rəqib dolmayıbsa belə */
  if(lotsLeft<=need)return spendable;

  const v=botHeroValue(lot);
  /* gələcək lotlardan gözlənən ən yaxşı (need-1) kahraman */
  let F=0;
  const futureCount=lotsLeft-1;
  if(need>1){
    let vals;
    if(c.pool){
      const seen=botSeenNames(st);
      vals=HEROES.filter(h=>!seen.has(h.name)).map(botHeroValue).sort((a,b)=>b-a);
    }else vals=HEROES.map(botHeroValue).sort((a,b)=>b-a);
    const m=vals.length||1;
    /* futureCount çəkilişdən i-ci ən yaxşının gözlənən yeri ≈ (i+.5)/futureCount kvantili */
    for(let i=0;i<Math.min(need-1,futureCount);i++){
      const idx=Math.min(m-1,Math.floor(((i+.5)/Math.max(1,futureCount))*m));
      F+=Math.pow(vals[idx]||.4,c.gamma);
    }
    /* rəqib də yaxşı kahramanları alacaq → gələcək payı bir az azalt */
    if(c.oppAware)F*=.88;
  }
  const own=Math.pow(v,c.gamma);
  let share=own/(own+F);
  if(need===1)share=Math.max(share,.6+v*.4);                   // son yer: ən yaxşısını götür
  let price=spendable*share;

  if(c.oppAware){
    /* büdcə üstünlüyü varsa daha cəsarətli, geridəyiksə ehtiyatlı */
    const ratio=clamp(me.budget/Math.max(1,opp.budget),.7,1.5);
    price*=Math.pow(ratio,.35);
    /* rəqibin yeri qalmayıbsa (doludur) → ucuz götür, artıq mübarizə yoxdur */
    if(opp.heroes.length>=st.maxHeroes||st.p1Passed)price=Math.min(price,Math.max(st.inc,st.price+st.inc));
    /* sıxışdırma: güclü kahramanı rəqibə ucuz buraxma (hard) */
    if(st.leader===1&&v>.62&&c.drain)price*=1+c.drain*(v-.5)*2;
  }
  const [lo,hi]=c.noise;
  price*=lo+Math.random()*(hi-lo);
  return Math.min(spendable,price);
}

/* 'bid' | 'pass' */
function botDecide(st){
  const c=BOT.c,me=st.players[2];
  const need=st.maxHeroes-me.heroes.length;
  if(need<=0)return 'pass';
  const next=st.price+st.inc;
  const canPay=me.budget>=next&&(need<=1||me.budget-next>=(need-1)*st.inc);
  if(!canPay)return 'pass';
  if(c.passChance&&Math.random()<c.passChance&&st.price>0)return 'pass';
  const lotsLeft=st.lots.length-st.lotIdx;
  const mustHave=lotsLeft<=need;
  const maxP=botMaxPrice(st);
  return (mustHave||next<=maxP)?'bid':'pass';
}
function botThinkDelay(){const [a,b]=BOT.c.delay;return a+Math.random()*(b-a);}

/* ── Döyüş sırası ── */
function botSimTeams(t1,t2){            // t1 = insan, t2 = bot; qaytarır: bot heyətinin üstünlüyü
  let i=0,j=0,hp1=t1.map(h=>h.health*10),hp2=t2.map(h=>h.health*10),guard=0;
  while(i<t1.length&&j<t2.length&&guard++<200){
    const x=botExchange(t1[i],t2[j],hp1[i],hp2[j]);
    const t=Math.min(x.tA,x.tB);
    hp2[j]-=x.dA*t;hp1[i]-=x.dB*t;
    const d1=hp1[i]<=0,d2=hp2[j]<=0;
    if(d1)i++;if(d2)j++;
  }
  const a1=t1.length-i,a2=t2.length-j;
  let rem=0;for(let k=j;k<t2.length;k++)rem+=Math.max(0,hp2[k])/(t2[k].health*10);
  return (a2-a1)+rem*.01;
}
function botPermutations(a){if(a.length<=1)return[a];const out=[];a.forEach((x,i)=>{botPermutations(a.slice(0,i).concat(a.slice(i+1))).forEach(p=>out.push([x].concat(p)));});return out;}
function botOptimizeOrder(botTeam,humanTeam){
  const lvl=BOT.c.order;
  if(!lvl||botTeam.length<2)return botTeam;
  let best=botTeam.slice(),bestS=botSimTeams(humanTeam,best);
  if(botTeam.length<=6&&lvl>=2){
    for(const p of botPermutations(botTeam)){const s=botSimTeams(humanTeam,p);if(s>bestS){bestS=s;best=p;}}
  }else{
    /* hill-climbing: təsadüfi yer dəyişmələri */
    const iters=lvl>=2?900:120;
    let cur=best.slice(),curS=bestS;
    for(let k=0;k<iters;k++){
      const n=cur.slice(),a=rand(0,n.length-1),b=rand(0,n.length-1);if(a===b)continue;
      [n[a],n[b]]=[n[b],n[a]];const s=botSimTeams(humanTeam,n);
      if(s>=curS){cur=n;curS=s;if(s>bestS){best=n.slice();bestS=s;}}
    }
  }
  return best;
}
