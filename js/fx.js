/* ══════════════════════════════════════════════════════════════
   VİZUAL EFEKTLƏR (canvas partikul mühərriki)
   Hər hücum üslubunun öz rəngi, proyektili və partikulları var.
   ══════════════════════════════════════════════════════════════ */
const STYLE_META={
  energy:   {c:['#00F0FF','#7DF4FF','#FFFFFF'],icon:'bolt',          ranged:true},
  lightning:{c:['#FFE45C','#FFFFFF','#8FD3FF'],icon:'flash_on',      ranged:true},
  fire:     {c:['#FF6A00','#FFB300','#FF2A55'],icon:'local_fire_department',ranged:true},
  ice:      {c:['#A5E8FF','#FFFFFF','#4FC3F7'],icon:'ac_unit',       ranged:true},
  water:    {c:['#2E9BFF','#7FDBFF','#FFFFFF'],icon:'water_drop',    ranged:true},
  magic:    {c:['#C74CFF','#FF4FD8','#FFFFFF'],icon:'auto_awesome',  ranged:true},
  shadow:   {c:['#8B3DFF','#4B1C99','#D2B0FF'],icon:'dark_mode',    ranged:false},
  tech:     {c:['#00F0FF','#FFFFFF','#FF2A55'],icon:'adjust',        ranged:true},
  slash:    {c:['#FFFFFF','#DCE6F2','#FF2A55'],icon:'content_cut',   ranged:false},
  impact:   {c:['#FFD700','#FF9F1C','#FFFFFF'],icon:'sports_mma',    ranged:false},
  arrow:    {c:['#C8FFB0','#FFFFFF','#6BFF8C'],icon:'arrow_forward', ranged:true}
};
function heroStyle(h){return FX_STYLE[h.name]||(h.fr==='Marvel'?'impact':h.fr==='DC'?'energy':'slash');}

const FX=(function(){
  const cv=$('#fxLayer'),g=cv.getContext('2d');
  let W=0,H=0,raf=0;const parts=[],effs=[];
  function resize(){const d=Math.min(1.25,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0);}
  window.addEventListener('resize',resize);resize();
  const reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const R=(a,b)=>a+Math.random()*(b-a);

  function P(o){if(parts.length>220)parts.splice(0,40);parts.push(Object.assign({x:0,y:0,vx:0,vy:0,life:0,max:600,size:3,col:'#fff',g:0,drag:.98,shape:'dot',blend:'lighter',rot:0,vr:0},o));start();}
  function E(o){effs.push(Object.assign({t0:performance.now(),dur:400},o));start();}
  function start(){if(!raf)raf=requestAnimationFrame(loop);}
  let last=0;
  function loop(ts){
    const dt=Math.min(40,ts-(last||ts));last=ts;
    g.clearRect(0,0,W,H);
    const k=dt/16.67;
    for(let i=parts.length-1;i>=0;i--){
      const p=parts[i];p.life+=dt;
      if(p.life>=p.max){parts.splice(i,1);continue;}
      p.vx*=Math.pow(p.drag,k);p.vy=p.vy*Math.pow(p.drag,k)+p.g*k;p.x+=p.vx*k;p.y+=p.vy*k;p.rot+=p.vr*k;
      const a=1-p.life/p.max;
      g.globalCompositeOperation=p.blend;g.globalAlpha=Math.max(0,a);g.fillStyle=g.strokeStyle=p.col;
      if(p.shape==='dot'){const r=p.size*(.4+a*.6);g.globalAlpha=Math.max(0,a)*.28;g.beginPath();g.arc(p.x,p.y,r*2.2,0,6.283);g.fill();g.globalAlpha=Math.max(0,a);g.beginPath();g.arc(p.x,p.y,r,0,6.283);g.fill();}
      else if(p.shape==='line'){g.lineWidth=p.size;g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*3,p.y-p.vy*3);g.stroke();}
      else if(p.shape==='rect'){g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillRect(-p.size,-p.size*.5,p.size*2,p.size);g.restore();}
      else if(p.shape==='star'){g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.beginPath();for(let j=0;j<8;j++){const r=j%2?p.size*.4:p.size;g.lineTo(Math.cos(j*Math.PI/4)*r,Math.sin(j*Math.PI/4)*r);}g.closePath();g.fill();g.restore();}
    }
    const now=performance.now();
    for(let i=effs.length-1;i>=0;i--){
      const e=effs[i],p=(now-e.t0)/e.dur;
      if(p>=1){if(e.end)e.end();effs.splice(i,1);continue;}
      if(p<0)continue;
      g.globalCompositeOperation='lighter';g.globalAlpha=1;e.draw(g,p,e);
    }
    g.globalAlpha=1;g.globalCompositeOperation='source-over';
    raf=(parts.length||effs.length)?requestAnimationFrame(loop):0;
    if(!raf)last=0;
  }

  /* — primitivlər — */
  function ring(x,y,col,size=120,dur=500){E({dur,draw(c,p){c.globalAlpha=(1-p)*.9;c.strokeStyle=col;c.lineWidth=2+10*(1-p);c.shadowColor=col;c.shadowBlur=6;c.beginPath();c.arc(x,y,size*Math.sqrt(p),0,6.283);c.stroke();c.shadowBlur=0;}});}
  function flash(x,y,col,size=90,dur=220){E({dur,draw(c,p){const r=size*(.5+p);const gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'#fff');gr.addColorStop(.3,col);gr.addColorStop(1,'transparent');c.globalAlpha=1-p;c.fillStyle=gr;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();}});}
  function slash(x,y,col,n=3){
    for(let i=0;i<n;i++){const ang=-.9+i*.18+R(-.08,.08),len=R(90,140),off=(i-1)*14;
      E({dur:260,t0:performance.now()+i*55,draw(c,p){const q=Math.min(1,p*2.2);c.globalAlpha=1-p;c.strokeStyle=col;c.lineWidth=7*(1-p)+1;c.lineCap='round';c.shadowColor=col;c.shadowBlur=6;
        const dx=Math.cos(ang)*len,dy=Math.sin(ang)*len;c.beginPath();c.moveTo(x-dx/2+off,y-dy/2);c.lineTo(x-dx/2+off+dx*q,y-dy/2+dy*q);c.stroke();c.shadowBlur=0;}});}
  }
  function bolt(x1,y1,x2,y2,col,dur=260,width=3){
    E({dur,draw(c,p){
      if(Math.random()<.5&&p>0.05)return;
      c.globalAlpha=1-p*.7;c.strokeStyle=col;c.lineWidth=width*(1-p)+1;c.shadowColor=col;c.shadowBlur=6;c.beginPath();c.moveTo(x1,y1);
      const n=9,dx=(x2-x1)/n,dy=(y2-y1)/n,nx=-dy,ny=dx,len=Math.hypot(nx,ny)||1;
      for(let i=1;i<n;i++){const j=R(-1,1)*18;c.lineTo(x1+dx*i+nx/len*j,y1+dy*i+ny/len*j);}
      c.lineTo(x2,y2);c.stroke();c.shadowBlur=0;}});
  }
  function beam(x1,y1,x2,y2,col,dur=170){
    E({dur,draw(c,p){c.globalAlpha=1-p;c.strokeStyle=col;c.shadowColor=col;c.shadowBlur=7;c.lineCap='round';
      c.lineWidth=14*(1-p)+2;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.lineWidth=4*(1-p);c.strokeStyle='#fff';c.stroke();c.shadowBlur=0;}});
  }

  const api={
    resize,
    ring,flash,
    /* partikul partlayışı */
    burst(x,y,style='impact',power=1){
      if(reduced)power*=.4;
      const m=STYLE_META[style]||STYLE_META.impact,n=Math.round(16+22*power);
      flash(x,y,m.c[0],70+50*power);
      const spawn=(o)=>P(Object.assign({x,y,col:pick(m.c)},o));
      switch(style){
        case 'fire':for(let i=0;i<n;i++)spawn({vx:R(-4,4),vy:R(-7,-1),g:-.06,size:R(3,7),max:R(500,900),drag:.96});ring(x,y,'#FF6A00',110*power);break;
        case 'ice':for(let i=0;i<n;i++){const a=R(0,6.28),s=R(3,9);spawn({vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:.12,shape:'line',size:R(2,4),max:R(450,800)});}ring(x,y,'#A5E8FF',100*power);break;
        case 'water':for(let i=0;i<n;i++){const a=R(-3.1,0),s=R(3,9);spawn({vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:.3,size:R(2,5),max:R(500,850)});}ring(x,y,'#2E9BFF',100*power);break;
        case 'lightning':for(let i=0;i<n;i++){const a=R(0,6.28),s=R(5,12);spawn({vx:Math.cos(a)*s,vy:Math.sin(a)*s,shape:'line',size:R(1.5,3),max:R(250,500),drag:.93});}
          for(let i=0;i<3;i++){const a=R(0,6.28);bolt(x,y,x+Math.cos(a)*120,y+Math.sin(a)*120,'#FFE45C',230);}break;
        case 'magic':for(let i=0;i<n;i++){const a=R(0,6.28),s=R(2,7);spawn({vx:Math.cos(a)*s,vy:Math.sin(a)*s,shape:Math.random()<.4?'star':'dot',size:R(3,8),max:R(600,1000),vr:R(-.2,.2),drag:.95});}ring(x,y,'#C74CFF',120*power);ring(x,y,'#FF4FD8',70*power,380);break;
        case 'shadow':for(let i=0;i<n;i++){const a=R(0,6.28),s=R(1,5);spawn({vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,size:R(6,15),max:R(600,1100),drag:.95,blend:i%3?'source-over':'lighter',col:pick(['#4B1C99','#8B3DFF','#1a0933','#D2B0FF'])});}ring(x,y,'#8B3DFF',130*power);break;
        case 'tech':for(let i=0;i<n;i++){const a=R(0,6.28),s=R(4,11);spawn({vx:Math.cos(a)*s,vy:Math.sin(a)*s,shape:Math.random()<.5?'rect':'line',size:R(2,4),max:R(350,700),vr:R(-.4,.4)});}ring(x,y,'#00F0FF',90*power);break;
        case 'slash':slash(x,y,'#FFFFFF',3);for(let i=0;i<n;i++){const a=R(0,6.28),s=R(3,10);spawn({vx:Math.cos(a)*s,vy:Math.sin(a)*s,shape:'line',size:R(1.5,3),max:R(250,500),col:pick(['#fff','#FF2A55','#DCE6F2'])});}break;
        case 'arrow':for(let i=0;i<n;i++){const a=R(0,6.28),s=R(2,7);spawn({vx:Math.cos(a)*s,vy:Math.sin(a)*s,size:R(2,4),max:R(300,600)});}ring(x,y,'#6BFF8C',70*power,380);break;
        case 'energy':default:for(let i=0;i<n;i++){const a=R(0,6.28),s=R(3,10);spawn({vx:Math.cos(a)*s,vy:Math.sin(a)*s,size:R(2,6),max:R(400,800)});}ring(x,y,m.c[0],110*power);
      }
      if(style==='impact'){ring(x,y,'#FFD700',150*power,650);for(let i=0;i<n/2;i++)spawn({vx:R(-6,6),vy:R(-9,-2),g:.4,shape:'rect',size:R(2,5),max:R(600,1000),vr:R(-.3,.3)});}
    },
    /* uçan hücum (uzaq məsafəli üslublar) */
    projectile(style,x1,y1,x2,y2,dur=240,onHit){
      const m=STYLE_META[style]||STYLE_META.energy;
      if(!m.ranged){setTimeout(()=>onHit&&onHit(),dur);return;}
      if(style==='tech'){beam(x1,y1,x2,y2,m.c[0],dur+80);setTimeout(()=>onHit&&onHit(),dur*.5);return;}
      if(style==='lightning'){bolt(x1,y1,x2,y2,m.c[0],dur+120,4);setTimeout(()=>onHit&&onHit(),dur*.6);return;}
      let done=false;
      E({dur,draw(c,p){
        const x=x1+(x2-x1)*p,y=y1+(y2-y1)*p;
        if(style==='arrow'){const a=Math.atan2(y2-y1,x2-x1);c.strokeStyle='#fff';c.shadowColor=m.c[0];c.shadowBlur=6;c.lineWidth=3;c.beginPath();c.moveTo(x-34*Math.cos(a),y-34*Math.sin(a));c.lineTo(x,y);c.stroke();c.shadowBlur=0;}
        else{const r=style==='magic'?11:9;const gr=c.createRadialGradient(x,y,0,x,y,r*2.4);gr.addColorStop(0,'#fff');gr.addColorStop(.35,m.c[0]);gr.addColorStop(1,'transparent');c.fillStyle=gr;c.beginPath();c.arc(x,y,r*2.4,0,6.283);c.fill();}
        if(Math.random()<.9)P({x,y,vx:R(-1,1),vy:R(-1,1)+(style==='fire'?-.5:0),size:R(2,5),max:R(250,450),col:pick(m.c),g:style==='water'?.08:0});
      },end(){if(!done){done=true;onHit&&onHit();}}});
    },
    /* qələbə konfettisi */
    confetti(n=140){
      if(reduced)n=30;
      const cols=['#00F0FF','#FF2A55','#FFD700','#FFFFFF','#3B82F6'];
      for(let i=0;i<n;i++){
        const x=R(0,W);
        P({x,y:R(-80,-10),vx:R(-2,2),vy:R(2,6),g:.07,drag:.995,shape:'rect',size:R(3,6),max:R(2200,3600),vr:R(-.25,.25),col:pick(cols),blend:'source-over'});
      }
    },
    /* sikkə yağışı (qazanılan coin) */
    coins(x,y,n=22){for(let i=0;i<n;i++)P({x,y,vx:R(-5,5),vy:R(-11,-3),g:.35,drag:.99,shape:'star',size:R(4,8),max:R(900,1500),vr:R(-.3,.3),col:pick(['#FFD700','#FFE45C','#FFB300'])});},
    sparkAt(el,style,power){const r=el.getBoundingClientRect();api.burst(r.left+r.width/2,r.top+r.height/2,style,power);}
  };
  return api;
})();

/* Elementin ekrandakı mərkəzi */
function centerOf(el){const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};}
