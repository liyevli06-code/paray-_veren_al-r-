/* ══════════════════════════════════════════════════════════════
   SƏS MÜHƏRRİKİ — heç bir səs faylı lazım deyil, hamısı Web Audio ilə sintez olunur.
   SFX.play(ad, ...)   → effektlər (klik, təklif, satış, çarx, hücum, zərbə, KO, qələbə…)
   Music.set('lobby'|'battle'|null) → prosedural fon musiqisi
   ══════════════════════════════════════════════════════════════ */
const SFX=(function(){
  let ctx=null,master=null,sfxBus=null,musicBus=null;
  const S={sfx:true,music:true,sfxVol:.8,musicVol:.35,muted:false};
  try{
    const sv=JSON.parse(storeGet('htb_audio','null'));
    if(sv)Object.assign(S,sv);
  }catch(e){}
  const save=()=>storeSet('htb_audio',JSON.stringify(S));

  function ensure(){
    if(!ctx){
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
      ctx=new AC();
      master=ctx.createGain();master.connect(ctx.destination);
      const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=6;comp.connect(master);
      sfxBus=ctx.createGain();sfxBus.connect(comp);
      musicBus=ctx.createGain();musicBus.connect(comp);
      applyVol();
    }
    if(ctx.state==='suspended')ctx.resume();
    return ctx;
  }
  function applyVol(){
    if(!ctx)return;
    master.gain.value=S.muted?0:1;
    sfxBus.gain.value=S.sfx?S.sfxVol:0;
    musicBus.gain.value=S.music?S.musicVol*.6:0;
  }

  /* — sintez alətləri — */
  function tone(f,t0,dur,type='sine',pk=.25,fEnd=null,bus=null,att=.006){
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t0);
    if(fEnd)o.frequency.exponentialRampToValueAtTime(Math.max(1,fEnd),t0+dur);
    g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(pk,t0+att);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(g);g.connect(bus||sfxBus);o.start(t0);o.stop(t0+dur+.05);return o;
  }
  function noise(t0,dur,pk=.25,f=1200,ftype='bandpass',fEnd=null,bus=null,q=1){
    const n=Math.max(1,Math.floor(ctx.sampleRate*dur)),buf=ctx.createBuffer(1,n,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    const s=ctx.createBufferSource();s.buffer=buf;
    const fl=ctx.createBiquadFilter();fl.type=ftype;fl.Q.value=q;fl.frequency.setValueAtTime(f,t0);
    if(fEnd)fl.frequency.exponentialRampToValueAtTime(Math.max(20,fEnd),t0+dur);
    const g=ctx.createGain();g.gain.setValueAtTime(pk,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    s.connect(fl);fl.connect(g);g.connect(bus||sfxBus);s.start(t0);s.stop(t0+dur+.02);
  }
  const sub=(t0,dur=.4,pk=.5,f0=110,f1=38)=>tone(f0,t0,dur,'sine',pk,f1);
  const now=()=>ctx.currentTime;

  /* — effekt kitabxanası — */
  const FX={
    click(){const t=now();tone(760,t,.05,'square',.07);tone(1250,t+.012,.05,'sine',.06);},
    hover(){tone(1800,now(),.02,'sine',.025);},
    nav(){const t=now();tone(420,t,.08,'triangle',.12,640);tone(840,t+.05,.08,'sine',.06);},
    toggle(){const t=now();tone(600,t,.06,'square',.06);tone(900,t+.05,.07,'square',.06);},
    error(){const t=now();tone(180,t,.18,'sawtooth',.14,120);tone(150,t+.1,.2,'sawtooth',.12,90);},
    coin(){const t=now();tone(1318,t,.09,'square',.08);tone(1760,t+.07,.22,'square',.08);},
    /* auksion */
    bid(norm=.3){const t=now(),f=520+norm*520;tone(f*.5,t,.05,'square',.09);tone(f,t+.02,.1,'triangle',.18,f*1.4);noise(t,.05,.07,3500,'highpass');tone(f*2,t+.08,.12,'sine',.07);},
    pass(){const t=now();tone(340,t,.16,'sine',.14,170);noise(t,.08,.04,600,'lowpass');},
    sold(){const t=now();
      noise(t,.09,.4,420,'bandpass',200);tone(180,t,.1,'square',.3,70);          // taxta çəkic
      noise(t+.18,.09,.35,420,'bandpass',200);tone(170,t+.18,.1,'square',.25,70);
      [1046.5,1318.5,1568,2093].forEach((f,i)=>tone(f,t+.34+i*.07,.3,'triangle',.14));   // sikkə cingiltisi
      noise(t+.34,.5,.05,7000,'highpass');},
    unsold(){const t=now();[392,311.1,261.6].forEach((f,i)=>tone(f,t+i*.13,.28,'sawtooth',.1));},
    /* çarx */
    wheelTick(){tone(1500+Math.random()*200,now(),.022,'square',.07);},
    wheelLand(){const t=now();[659,880,1108,1318].forEach((f,i)=>tone(f,t+i*.06,.3,'triangle',.17));noise(t,.2,.06,4500,'highpass');sub(t,.3,.3);},
    whoosh(){const t=now();noise(t,.3,.12,500,'bandpass',3000);},
    /* döyüş girişi */
    vs(){const t=now();sub(t,.9,.7,90,30);noise(t,.5,.2,300,'lowpass',2400);
      tone(220,t,.5,'sawtooth',.1,880);[329.6,392,493.9].forEach((f,i)=>tone(f,t+.45+i*.01,.5,'sawtooth',.08));
      noise(t+.4,.3,.25,6000,'highpass');},
    ready(){const t=now();tone(880,t,.1,'square',.1);tone(1320,t+.1,.16,'square',.1);},
    /* hücum hərəkəti (swing / cast) */
    swing(style='slash'){const t=now();
      const m={slash:()=>{noise(t,.2,.22,1200,'bandpass',5200,null,2);tone(900,t,.12,'sawtooth',.04,2400);},
        impact:()=>{noise(t,.22,.2,300,'lowpass',1200);tone(140,t,.16,'sine',.2,260);},
        shadow:()=>{tone(220,t,.3,'sawtooth',.09,70);noise(t,.3,.1,500,'lowpass',200);},
        energy:()=>{tone(300,t,.28,'sawtooth',.07,1400);tone(600,t,.28,'sine',.12,2400);},
        lightning:()=>{for(let i=0;i<4;i++)noise(t+i*.035,.05,.2,3500+i*400,'highpass');tone(1800,t,.18,'square',.06,300);},
        fire:()=>{noise(t,.35,.2,700,'lowpass',1800);tone(160,t,.3,'sawtooth',.07,420);},
        ice:()=>{tone(2200,t,.14,'triangle',.09,3600);tone(3300,t+.03,.14,'sine',.06,4600);noise(t,.15,.07,7000,'highpass');},
        water:()=>{noise(t,.3,.17,500,'bandpass',2600,null,3);tone(260,t,.2,'sine',.1,640);},
        magic:()=>{tone(523,t,.35,'sine',.1,1046);tone(528,t,.35,'sine',.1,1054);tone(784,t+.05,.3,'triangle',.07,1568);},
        tech:()=>{tone(1900,t,.16,'square',.07,380);tone(950,t+.02,.16,'sawtooth',.05,190);},
        arrow:()=>{noise(t,.1,.18,3000,'highpass');tone(240,t,.08,'sine',.2,90);tone(1800,t+.04,.14,'triangle',.05,3200);}};
      (m[style]||m.slash)();},
    /* zərbə */
    hit(style='impact',crit=false){const t=now(),big=crit?1.45:1;
      const m={slash:()=>{noise(t,.14,.3*big,3800,'highpass');tone(2300,t,.18,'triangle',.1,900);sub(t,.12,.25*big,160,70);},
        impact:()=>{noise(t,.22,.35*big,600,'lowpass',160);sub(t,.3,.6*big,130,40);tone(95,t,.14,'square',.2,50);},
        shadow:()=>{sub(t,.5,.5*big,100,28);tone(160,t,.35,'sawtooth',.1,60);noise(t,.3,.14,400,'lowpass',120);},
        energy:()=>{noise(t,.22,.28*big,1600,'bandpass',300);tone(900,t,.16,'sine',.2,150);sub(t,.25,.45*big,150,50);},
        lightning:()=>{for(let i=0;i<5;i++)noise(t+i*.03,.07,.3*big,3000+i*300,'highpass');sub(t,.3,.5*big,140,45);tone(2400,t,.1,'square',.07,400);},
        fire:()=>{noise(t,.42,.38*big,800,'lowpass',180);sub(t,.4,.55*big,120,40);tone(220,t,.3,'sawtooth',.08,90);},
        ice:()=>{noise(t,.18,.26*big,6500,'highpass');[2637,3136,3951].forEach((f,i)=>tone(f,t+i*.025,.2,'triangle',.08));sub(t,.2,.3*big,170,70);},
        water:()=>{noise(t,.36,.3*big,900,'bandpass',200,null,.7);sub(t,.3,.45*big,120,45);tone(420,t,.2,'sine',.1,180);},
        magic:()=>{[523,659,784,1046].forEach((f,i)=>tone(f*(1+i*.004),t+i*.02,.4,'sine',.1));noise(t,.2,.14*big,4200,'highpass');sub(t,.3,.4*big,150,55);},
        tech:()=>{noise(t,.12,.24*big,2800,'highpass');tone(1500,t,.14,'square',.12,200);sub(t,.22,.42*big,140,50);tone(720,t+.03,.1,'sawtooth',.06,180);},
        arrow:()=>{noise(t,.08,.25*big,2500,'highpass');tone(300,t,.1,'square',.22,90);sub(t,.15,.3*big,150,60);}};
      (m[style]||m.impact)();
      if(crit){tone(1568,t+.02,.3,'triangle',.1);tone(2093,t+.07,.3,'triangle',.08);}},
    ko(){const t=now();noise(t,.55,.45,500,'lowpass',90);sub(t,.9,.75,150,25);tone(240,t,.6,'sawtooth',.15,35);noise(t+.05,.3,.2,5000,'highpass');},
    victory(){const t=now();
      [523.25,659.25,783.99,1046.5,783.99,1046.5,1318.5].forEach((f,i)=>{tone(f,t+i*.12,.35,'triangle',.2);tone(f/2,t+i*.12,.35,'square',.06);});
      [1046.5,1318.5,1568].forEach(f=>tone(f,t+.9,.9,'triangle',.14));sub(t+.9,.8,.4,100,50);noise(t+.9,.8,.07,7000,'highpass');},
    defeat(){const t=now();[392,349.2,311.1,261.6].forEach((f,i)=>tone(f,t+i*.2,.45,'sawtooth',.1,f*.97));sub(t+.5,.9,.4,90,30);},
    draw(){const t=now();[440,440,330].forEach((f,i)=>tone(f,t+i*.16,.3,'triangle',.14));}
  };

  function safe(name){
    return function(){
      if(!S.sfx||S.muted)return;
      try{if(!ensure())return;FX[name].apply(null,arguments);}catch(e){}
    };
  }
  const api={settings:S,
    unlock(){try{ensure();Music._kick();}catch(e){}},
    play(name,...a){safe(name)(...a);},
    setSfx(on){S.sfx=on;save();applyVol();},
    setMusic(on){S.music=on;save();applyVol();if(on)Music._kick();},
    setSfxVol(v){S.sfxVol=v;save();applyVol();},
    setMusicVol(v){S.musicVol=v;save();applyVol();},
    toggleMute(){S.muted=!S.muted;save();applyVol();if(!S.muted)Music._kick();return S.muted;},
    isMuted:()=>S.muted,
    _ctx:()=>ctx,_ensure:ensure,_bus:()=>musicBus,_tone:tone,_noise:noise};
  Object.keys(FX).forEach(k=>{api[k]=safe(k);});
  return api;
})();

/* ══════════════ FON MUSİQİSİ (prosedural sequencer) ══════════════ */
const Music=(function(){
  let mode=null,timer=null,step=0,nextT=0,running=false;
  const root=55;                       // A1
  const hz=n=>root*Math.pow(2,n/12);
  const scale=[0,3,5,7,10,12,15,17];   // A minor pentatonic-ish
  const bassPat=[0,0,0,0,  -2,-2,-2,-2, -4,-4,-4,-4, -2,-2,-5,-5];
  const arpPat =[0,2,4,2, 5,4,2,4, 3,2,4,2, 5,7,5,4];
  const bpm={lobby:84,battle:122};

  function sched(){
    const c=SFX._ctx();if(!c||!mode){running=false;return;}
    const bus=SFX._bus(),sp=60/bpm[mode]/4;
    while(nextT<c.currentTime+.25){
      const i=step%16,t=nextT,bar=Math.floor(step/16)%4;
      const bn=bassPat[i]+(bar>=2?3*(bar-1):0)*0;      // sabit bas
      if(mode==='lobby'){
        if(i%4===0)SFX._tone(hz(bn+12),t,sp*3.6,'triangle',.22,null,bus,.04);
        if(i%2===0)SFX._tone(hz(scale[arpPat[i]%8]+24),t,sp*1.6,'sine',.1,null,bus,.01);
        if(i===0)[0,3,7].forEach(n=>SFX._tone(hz(n+24),t,sp*15,'sine',.045,null,bus,.4));
      }else{
        if(i%4===0){SFX._tone(150,t,.16,'sine',.55,40,bus);}                   // kick
        if(i%4===2)SFX._noise(t,.07,.12,7500,'highpass',null,bus);             // hat
        if(i%2===1)SFX._noise(t,.03,.05,9000,'highpass',null,bus);
        if(i===4||i===12)SFX._noise(t,.14,.2,1900,'bandpass',900,bus,1.5);      // snare
        SFX._tone(hz(bn+12),t,sp*1.7,'sawtooth',.16,null,bus,.008);            // bas
        if(i%2===0||i%4===3)SFX._tone(hz(scale[arpPat[i]%8]+24),t,sp*1.2,'square',.05,null,bus,.005);
        if(i===0&&bar%2===0)[0,3,7].forEach(n=>SFX._tone(hz(n+24),t,sp*30,'sawtooth',.03,null,bus,.2));
      }
      nextT+=sp;step++;
    }
    timer=setTimeout(sched,60);
  }
  const api={
    set(m){
      if(m===mode)return;mode=m;step=0;
      clearTimeout(timer);running=false;
      if(m)api._kick();
    },
    _kick(){
      const c=SFX._ctx();
      if(!c||!mode||running||!SFX.settings.music||SFX.settings.muted)return;
      running=true;nextT=c.currentTime+.05;sched();
    },
    mode:()=>mode
  };
  return api;
})();
['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,()=>SFX.unlock(),{once:true,passive:true}));
