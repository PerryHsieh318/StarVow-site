import { makeRibbon } from "./spell-fallback.js";
import { makeGalaxy } from "./galaxy.js";
import { makeSpell, weapons } from "./spell.js";

export function mountScene(hero,maple=null) {
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  const compact=matchMedia("(max-width:760px)");
  const fine=matchMedia("(hover:hover) and (pointer:fine)");
  const depths={scout:.3,mage:.62,knight:1};
  const actors=[...hero.querySelectorAll(".actor")].map(el=>({
    el, weapon:maple?.mapleSkills[el.dataset.costume] || weapons[el.dataset.actor],
    depth:depths[el.dataset.actor], spell:null
  }));
  const galaxy=makeGalaxy(hero.querySelector(".galaxy"));
  const toggle=document.createElement("button");
  toggle.className="motion-switch";toggle.type="button";
  hero.querySelector(".hero-foot").append(toggle);
  let paused=false,visible=true,raf=0,last=0,elapsed=0;
  let px=0,py=0,aimX=0,aimY=0,pointerX=-10000,pointerY=-10000,scroll=0;
  let bounds;
  function measure() {
    bounds=hero.getBoundingClientRect();
    if(!motion.matches) galaxy?.resize(bounds.width,bounds.height,compact.matches);
    for(const a of actors) {
      const box=a.el.getBoundingClientRect();
      a.centerX=box.left+window.scrollX+(box.width*(a.weapon?.origin[0]??.5))-(a.offsetX||0);
      a.centerY=box.top+window.scrollY+box.height*(a.weapon?.origin[1]??.5)-(a.offsetY||0);
      a.spell?.resize(compact.matches);
    }
  }
  function allowEffects() {
    if(motion.matches && !maple) return;
    for(const a of actors) {
      if(a.spell || a.attempted || !a.weapon) continue;
      a.attempted=true;
      const canvas=a.el.querySelector("canvas"), weapon=a.weapon;
      if(maple) {
        a.spell=maple.makeMapleSkill(canvas,weapon);
        continue;
      }
      a.spell=makeSpell(canvas,weapon,compact.matches);
      if(a.spell) {
        canvas.dataset.renderer="webgl";
      } else {
        const fallback=canvas.cloneNode(false);
        canvas.replaceWith(fallback);
        fallback.dataset.renderer="canvas";
        a.spell=makeRibbon(fallback,weapon);
      }
    }
  }
  function update(t) {
    raf=0;
    if(document.hidden||!visible||paused||motion.matches) return;
    const interval=compact.matches?1000/24:1000/45;
    if(!last||t-last>=interval-1) {
      const dt=last?Math.min(.08,(t-last)/1000):0;
      last=t;elapsed+=dt;px+=(aimX-px)*.13;py+=(aimY-py)*.13;
      const sx=fine.matches&&!compact.matches?px:0;
      const sy=fine.matches&&!compact.matches?py:0;
      const drift=Math.min(scroll/Math.max(bounds.height,1),1);
      hero.style.setProperty("--bg-x",(-sx*4)+"px");
      hero.style.setProperty("--bg-y",(drift*7-sy*3)+"px");
      galaxy?.draw(elapsed,sx,sy,pointerX-window.scrollX,pointerY-hero.offsetTop);
      for(const a of actors) {
        a.offsetX=sx*a.depth*10;
        a.offsetY=(sy*7-drift*(compact.matches?4:18))*a.depth;
        a.el.style.setProperty("--x",a.offsetX+"px");a.el.style.setProperty("--y",a.offsetY+"px");
        const dist=Math.hypot(pointerX-a.centerX-a.offsetX,pointerY-a.centerY-a.offsetY);
        const target=fine.matches?Math.max(0,1-dist/135):0;
        a.near=(a.near||0)+(target-(a.near||0))*.14;
        a.spell?.draw(dt,a.near);
      }
    }
    raf=requestAnimationFrame(update);
  }
  function schedule() {
    cancelAnimationFrame(raf);raf=0;last=0;
    toggle.hidden=motion.matches;
    toggle.textContent=paused?"▶":"Ⅱ";
    toggle.title=paused?"播放場景動畫":"暫停場景動畫";
    toggle.setAttribute("aria-label",toggle.title);
    if(motion.matches) {
      hero.style.removeProperty("--bg-x");hero.style.removeProperty("--bg-y");
      for(const a of actors){a.el.style.removeProperty("--x");a.el.style.removeProperty("--y");a.offsetX=0;a.offsetY=0;}
    } else if(!paused&&visible&&!document.hidden) raf=requestAnimationFrame(update);
  }
  function resetGraphics() {
    allowEffects();measure();schedule();
  }
  hero.addEventListener("pointermove",e=>{
    if(!fine.matches||compact.matches) return;
    pointerX=e.pageX;pointerY=e.pageY;
    aimX=(e.clientX/bounds.width-.5)*2;aimY=((e.pageY-hero.offsetTop)/bounds.height-.5)*2;
  },{passive:true});
  hero.addEventListener("pointerleave",()=>{aimX=0;aimY=0;pointerX=-10000;pointerY=-10000});
  addEventListener("scroll",()=>{scroll=Math.max(0,window.scrollY);pointerY=-10000},{passive:true});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule()}).observe(hero);
  new ResizeObserver(measure).observe(hero);
  toggle.addEventListener("click",()=>{paused=!paused;schedule()});
  document.addEventListener("visibilitychange",schedule);
  window.addEventListener("pageshow",schedule);
  motion.addEventListener("change",resetGraphics);
  compact.addEventListener("change",resetGraphics);
  resetGraphics();
}
