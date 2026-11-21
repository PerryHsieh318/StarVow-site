// Start from readable HTML. GSAP is optional when the animation CDN is unavailable.
export function enterPage() {
  const preference=matchMedia("(prefers-reduced-motion: reduce)");
  if(preference.matches) return;
  const items=[...document.querySelectorAll(".hero-copy > *, .inner-intro h1, .inner-intro p")];
  let played=false,timeline,animations=[];
  function reveal() {
    if(played || preference.matches) return;
    played=true;
    if(window.gsap) {
      timeline=window.gsap.timeline();
      timeline.fromTo(items,{y:9,opacity:.78},{y:0,opacity:1,duration:.56,stagger:.065,ease:"power2.out",clearProps:"transform,opacity"});
    } else {
      animations=items.map((item,i)=>item.animate([{transform:"translateY(9px)",opacity:.78},{transform:"none",opacity:1}],{duration:520,delay:i*65,easing:"ease-out"}));
    }
  }
  const script=document.createElement("script");
  script.src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js";script.async=true;script.crossOrigin="anonymous";
  script.onload=reveal;script.onerror=reveal;document.head.append(script);
  const fallback=setTimeout(reveal,650);
  const journal=document.querySelector(".journal");
  const observer=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting)) return;
    observer.disconnect();
    if(preference.matches) return;
    const rows=journal.querySelectorAll("li");
    if(window.gsap) {
      const revealRows=window.gsap.fromTo(rows,{y:8,opacity:.8},{y:0,opacity:1,duration:.42,stagger:.055,clearProps:"transform,opacity"});
      preference.addEventListener("change",()=>revealRows.progress(1).kill(),{once:true});
    } else {
      rows.forEach((row,i)=>animations.push(row.animate([{transform:"translateY(8px)",opacity:.8},{transform:"none",opacity:1}],{duration:420,delay:i*55})));
    }
  },{threshold:.12});
  if(journal) observer.observe(journal);
  preference.addEventListener("change",()=>{
    if(!preference.matches) return;
    clearTimeout(fallback);timeline?.progress(1).kill();
    for(const animation of animations) animation.cancel();
  });
}
