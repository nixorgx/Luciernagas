/* Luciérnagas · navegación y luciérnagas de profundidad múltiple */
(() => {
  'use strict';
  const shell = document.getElementById('site-top');
  const nav = document.getElementById('primary-nav');
  const menu = document.querySelector('.menu-toggle');
  const progress = document.getElementById('reading-progress');
  const links = [...(nav?.querySelectorAll('a[href^="#"]:not(.mobile-join-link)') || [])];
  const indicator = nav?.querySelector('.nav-ink');
  let framePending = false;
  let current = links[0] || null;
  const mobile = matchMedia('(max-width:850px)');

  function placeIndicator(link) {
    if (!link || !indicator || mobile.matches) return;
    const parent = nav.getBoundingClientRect(), box = link.getBoundingClientRect();
    indicator.style.left = (box.left - parent.left) + 'px';
    indicator.style.width = box.width + 'px';
    indicator.style.opacity = '1';
  }
  function activate(link) {
    if (!link || current === link && link.classList.contains('is-active')) return;
    current = link;
    links.forEach(a => {
      const active = a === link;
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current','location');
      else a.removeAttribute('aria-current');
    });
    placeIndicator(link);
  }
  function updateScroll() {
    framePending = false;
    shell?.classList.toggle('is-scrolled', window.scrollY > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1,Math.max(0,scrollY / max)) : 0) + ')';
    }
    const activeOffset = Math.min(220,innerHeight * .36);
    let candidate = links[0];
    for (const link of links) {
      const target = document.querySelector(link.getAttribute('href'));
      if (target && target.getBoundingClientRect().top <= activeOffset) candidate = link;
    }
    if (candidate) activate(candidate);
  }
  function onScroll() {
    if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
  }
  function onMenuChange() {
    const open = menu?.getAttribute('aria-expanded') === 'true';
    if (open && mobile.matches) {
      nav?.querySelector('a')?.focus({preventScroll:true});
    }
  }
  function onResize() { onScroll(); if (!mobile.matches) placeIndicator(current); }
  links.forEach(link => link.addEventListener('click', () => {
    activate(link);
    requestAnimationFrame(onScroll);
  }));
  nav?.addEventListener('pointerleave', () => placeIndicator(current));
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('focus', () => {
    if (!mobile.matches && links.includes(link)) placeIndicator(link);
  }));
  nav?.addEventListener('pointerover', event => {
    const link = event.target.closest('a');
    if (link && links.includes(link)) placeIndicator(link);
  });
  menu?.addEventListener('click', () => requestAnimationFrame(onMenuChange));
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onResize,{passive:true});
  window.addEventListener('pageshow',onScroll);
  if (document.fonts?.ready) document.fonts.ready.then(onResize);
  requestAnimationFrame(() => { updateScroll(); placeIndicator(current); });

  /* Atmósfera: inspiración en las capas de estrellas y destellos de Tunari.
     Se priorizan puntos naturales y trayectorias curvas frente a símbolos tipográficos. */
  const canvas=document.getElementById('firefly-canvas');
  const ctx=canvas?.getContext('2d',{alpha:true});
  const toggle=document.getElementById('ambient-motion-toggle');
  if (!ctx || !canvas) return;
  const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
  const key='luciernagas-motion-enabled';
  const TAU=Math.PI*2;
  let preference=true;
  try { preference=localStorage.getItem(key)!=='off'; } catch (_) {}
  const hardware=(navigator.hardwareConcurrency || 6);
  const lowPower=hardware <= 4;
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const colors=['236,170,74','180,119,52','101,155,119','235,194,103'];
  let w=0,h=0,ratio=1,last=0,raf=0,scroll=0,pmx=0,pmy=0,tx=0,ty=0,spawnClock=0,shootClock=0;
  let dust=[],flyers=[],sweeps=[];
  const sprites=new Map();

  function sprite(color) {
    if (!sprites.has(color)) {
      const c=document.createElement('canvas'); c.width=64; c.height=64;
      const g=c.getContext('2d');
      const grad=g.createRadialGradient(32,32,0,32,32,32);
      grad.addColorStop(0,'rgba('+color+',.9)');
      grad.addColorStop(.15,'rgba('+color+',.34)');
      grad.addColorStop(.48,'rgba('+color+',.07)');
      grad.addColorStop(1,'rgba('+color+',0)');
      g.fillStyle=grad;g.fillRect(0,0,64,64);sprites.set(color,c);
    }
    return sprites.get(color);
  }
  function newDust() {
    const z=Math.pow(Math.random(),1.35);
    return {x:rand(0,w),y:rand(0,h),z,r:.32+z*1.2,color:colors[Math.floor(rand(0,colors.length))],
      phase:rand(0,TAU),freq:rand(.2,.65),vx:rand(-3,4),vy:rand(1,8),a:rand(.12,.25)+z*.23};
  }
  function newFlyer(fromOutside=false) {
    const z=rand(.4,1);
    return {x:fromOutside?rand(-80,w+80):rand(0,w),y:rand(0,h),z,r:rand(.8,1.65)*z,
      vx:rand(-8,14),vy:rand(-10,3),age:rand(0,TAU),phase:rand(0,TAU),color:Math.random()<.78?colors[0]:colors[2],
      history:[],pulse:rand(1.2,2.6),alpha:rand(.28,.5)};
  }
  function measure() {
    w=Math.max(1,innerWidth);h=Math.max(1,innerHeight);
    ratio=Math.min(1.7,devicePixelRatio || 1);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const dots=Math.max(20,Math.min(lowPower?52:85,Math.floor(w*h/(lowPower?26000:21000))));
    dust=Array.from({length:dots},newDust);
    flyers=Array.from({length:Math.max(5,Math.min(lowPower?7:12,Math.floor(w*h/105000)))},()=>newFlyer());
    sweeps=[];
    scroll=window.scrollY;
    spawnClock=rand(6,13);
    shootClock=rand(11,20);
  }
  function running() { return preference && !motionQuery.matches && !document.hidden; }
  function render(time,dt) {
    ctx.clearRect(0,0,w,h);
    pmx+=(tx-pmx)*Math.min(1,dt*.65);
    pmy+=(ty-pmy)*Math.min(1,dt*.65);
    const scrollDelta=scroll*0.026;
    for (const p of dust) {
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.x<-10)p.x=w+10;
      if(p.x>w+10)p.x=-10;
      if(p.y>h+10)p.y=-10;
      const x=p.x+pmx*p.z*.023;
      const y=(p.y-scrollDelta*(.3+p.z)+pmy*p.z*.023+h*2)%(h+16)-8;
      const twinkle=.58+.42*Math.sin(time*p.freq+p.phase);
      const a=clamp(p.a*twinkle,0,.6);
      if(p.z>.52) {
        ctx.globalAlpha=a*.4;
        const size=15+p.z*14;
        ctx.drawImage(sprite(p.color),x-size/2,y-size/2,size,size);
      }
      ctx.globalAlpha=a;
      ctx.fillStyle='rgb('+p.color+')';
      ctx.beginPath();ctx.arc(x,y,p.r,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;

    for (const p of flyers) {
      p.age+=dt;
      p.x+=(p.vx+Math.cos(p.age*.75+p.phase)*11)*dt;
      p.y+=(p.vy+Math.sin(p.age*.95+p.phase)*10)*dt;
      if(p.x < -50 || p.x > w+50 || p.y < -50 || p.y > h+50) {
        Object.assign(p,newFlyer(true));
      }
      const x=p.x+pmx*p.z*.03, y=p.y-scrollDelta*.28+pmy*p.z*.03;
      p.history.push({x,y});
      if(p.history.length>10)p.history.shift();
      const shimmer=(.62+.38*Math.sin(p.age*p.pulse+p.phase));
      const alpha=p.alpha*shimmer;
      if(p.history.length>2) {
        for(let i=1;i<p.history.length;i++) {
          const a=p.history[i-1],b=p.history[i];
          ctx.globalAlpha=alpha*(i/p.history.length)*.2;
          ctx.strokeStyle='rgb('+p.color+')';
          ctx.lineWidth=.5+p.z*.65;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
      ctx.globalAlpha=alpha*.75;
      const s=20+p.z*28;ctx.drawImage(sprite(p.color),x-s/2,y-s/2,s,s);
      ctx.globalAlpha=alpha;
      ctx.fillStyle='rgb('+p.color+')';
      ctx.beginPath();ctx.arc(x,y,p.r,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;

    for (const f of sweeps) {
      f.age+=dt;
      const u=clamp(f.age/f.duration);
      const eased=u*u*(3-2*u);
      const x=f.x+(f.toX-f.x)*eased;
      const y=f.y+(f.toY-f.y)*eased+Math.sin(u*Math.PI)*f.bend;
      f.path.push({x,y});
      if(f.path.length>23)f.path.shift();
      const fade=Math.sin(u*Math.PI);
      if(f.path.length>2 && fade>0) {
        for (let k=1;k<f.path.length;k++) {
          const a=f.path[k-1],b=f.path[k];
          ctx.globalAlpha=fade*(k/f.path.length)*.24;
          ctx.strokeStyle='rgb('+f.color+')';
          ctx.lineWidth=(k/f.path.length)*1.1;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
        ctx.globalAlpha=fade*.65;
        ctx.drawImage(sprite(f.color),x-23,y-23,46,46);
        ctx.globalAlpha=fade*.75;
        ctx.fillStyle='rgb('+f.color+')';
        ctx.beginPath();ctx.arc(x,y,1.7,0,TAU);ctx.fill();
      }
    }
    sweeps=sweeps.filter(f=>f.age<f.duration);
    ctx.globalAlpha=1;
  }
  function tick(now) {
    raf=0;
    if(!running())return;
    const elapsed=last?now-last:33;
    if(elapsed<31){raf=requestAnimationFrame(tick);return;}
    last=now;
    const dt=Math.min(.058,elapsed/1000);
    spawnClock-=dt;
    if(spawnClock<=0 && flyers.length<(lowPower?8:14)) {
      flyers.push(newFlyer(true));
      spawnClock=rand(8,16);
    }
    shootClock-=dt;
    if(shootClock<=0) {
      sweeps.push({x:-20,y:rand(h*.12,h*.78),toX:rand(w*.45,w*.95),toY:rand(h*.12,h*.78),
        bend:rand(-65,65),color:Math.random()<.7?colors[0]:colors[2],age:0,duration:rand(3.2,5.5),path:[]});
      shootClock=rand(11,20);
    }
    render(now*.001,dt);
    raf=requestAnimationFrame(tick);
  }
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;ctx.clearRect(0,0,w,h);}
  function reconcile(){
    if(toggle){
      const paused=!preference;
      toggle.textContent=paused?'Reanudar luciérnagas':'Pausar luciérnagas';
      toggle.setAttribute('aria-pressed',String(paused));
      toggle.setAttribute('aria-label',paused?'Reanudar luciérnagas animadas':'Pausar luciérnagas animadas');
      toggle.hidden=motionQuery.matches;
    }
    if(running()){if(!raf){last=0;raf=requestAnimationFrame(tick);}}
    else stop();
  }
  toggle?.addEventListener('click',()=>{
    preference=!preference;
    try{localStorage.setItem(key,preference?'on':'off');}catch(_){}
    reconcile();
  });
  const onPointer=e=>{tx=e.clientX-w/2;ty=e.clientY-h/2;};
  const onScrollMotion=()=>{scroll=window.scrollY;};
  const onResizeMotion=()=>{measure();reconcile();};
  window.addEventListener('pointermove',onPointer,{passive:true});
  window.addEventListener('scroll',onScrollMotion,{passive:true});
  window.addEventListener('resize',onResizeMotion,{passive:true});
  document.addEventListener('visibilitychange',reconcile);
  motionQuery.addEventListener('change',reconcile);
  window.addEventListener('pagehide',stop);
  measure();reconcile();
})();
