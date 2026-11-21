import {shadow} from "./shadow.js";
import {frost} from "./frost.js";
import {captain} from "./captain.js";

// Paint bounds use a 100-unit actor width. They include the outgoing trails
// without allocating a full-screen buffer per skill.
export const mapleSkills = {
  "kain-dragon": {origin:[.72,.68], bounds:[0,0,100,100], paint(ctx,state) {
    // Sparks follow the dragon arrow from the crossbow toward the viewer.
    ctx.globalCompositeOperation="lighter";
    for(let i=0;i<18;i++) {
      const t=(state.t*(.48+i%3*.08)+i*.37)%1;
      const x=57+t*41, y=state.height*(.53+t*.34)+Math.sin(i*4+t*3)*t*11;
      ctx.globalAlpha=Math.sin(Math.PI*t)*.9;
      ctx.strokeStyle=i%3?"#ff6737":"#ffdaa5";ctx.lineWidth=.32+t*.35;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+t*2.2,y+t*1.5);ctx.stroke();
    }
  }},
  "maple-neo": {origin:[.69,.757], bounds:[48,60,124,85], art:"shadow-lances", paint:shadow},
  "maple-frost": {origin:[.223,.765], bounds:[-11,-4,122,105], art:"ice-crystal", paint:frost},
  "maple-captain": {origin:[.12,.82], bounds:[-38,-19,161,193], art:"powder-rift", paint:captain}
};

export function makeMapleSkill(canvas, skill) {
  const ctx=canvas.getContext("2d",{alpha:true});
  if(!ctx) return null;
  const actor=canvas.parentElement;
  const [left,top,width,height]=skill.bounds;
  const state={t:1.6,image:new Image(),small:false,near:0,height:100};
  let scale=0;
  function paint() {
    if(!scale) return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.setTransform(scale,0,0,scale,-left*scale,-top*scale);
    skill.paint(ctx,state);ctx.restore();
  }
  state.image.onload=paint;
  return {
    resize(small) {
      state.small=small;
      const unit=actor.clientWidth/100;
      if(!unit) return;
      state.height=actor.clientHeight/unit;
      const style=canvas.style;
      style.left=left*unit+"px";style.top=top*unit+"px";
      style.width=width*unit+"px";style.height=height*unit+"px";
      scale=unit*Math.min(window.devicePixelRatio||1,small?1.2:1.65);
      canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);
      if(!skill.art){paint();return;}
      const src=new URL("../../assets/skills/"+skill.art+(small?"-small":"")+".webp",import.meta.url).href;
      if(state.image.getAttribute("src")!==src) state.image.src=src;
      paint();
    },
    draw(dt,near) {
      state.t+=dt*(1+.2*near);state.near=near;paint();
    }
  };
}
