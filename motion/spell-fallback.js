import { noise } from "./galaxy.js";

// A 2D energy filament follows the same weapon anchors as the WebGL version.
export function makeRibbon(canvas,weapon) {
  const ctx=canvas.getContext("2d");
  if(!ctx) return null;
  let width,height,time=0,particles=12;
  const color=weapon.tint.map(c=>Math.round(c*255)).join(",");
  function point(u,phase) {
    const fade=Math.sin(Math.PI*u);
    const warp=noise(u*5-time*.37,phase+time*.11);
    const fine=noise(u*13+warp*1.6,phase-time*.3);
    const bend=fade*(.012*Math.sin(11*u-time*1.2+phase)+.028*(.67*warp+.33*fine-.5));
    const [ax,ay]=weapon.origin,[bx,by]=weapon.tip;
    return [(ax+(bx-ax)*u+.14)*width/1.28+bend*height,(ay+(by-ay)*u+.14)*height/1.28+bend*width*.35];
  }
  return {
    resize(small) {
      const ratio=small?.7:1;
      width=canvas.clientWidth;height=canvas.clientHeight;
      canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
      ctx.setTransform(ratio,0,0,ratio,0,0);particles=small?7:15;
    },
    draw(dt,near) {
      time+=dt*(1+.24*near);
      ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation="lighter";ctx.lineCap="round";
      for(let strand=0;strand<3;strand++) {
        ctx.beginPath();
        for(let i=0;i<=28;i++) {
          const [x,y]=point(i/28,strand*.8);
          if(i===0) ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.lineWidth=Math.max(.8,height*(strand===0?.015:.0027));
        ctx.strokeStyle="rgba("+color+","+(strand===0?.1:.55+.13*near)+")";ctx.stroke();
      }
      for(let i=0;i<particles;i++) {
        const u=(time*.17+i*.618)%1,phase=i*1.2;
        const [x,y]=point(u,phase),[tx,ty]=point(Math.max(0,u-.026),phase);
        const drift=Math.sin(phase+u*12)*height*.011*Math.sin(Math.PI*u);
        ctx.beginPath();ctx.moveTo(tx+drift,ty);ctx.lineTo(x+drift,y);
        ctx.lineWidth=1.45;ctx.strokeStyle="rgba(238,247,255,"+Math.sin(Math.PI*u)*.85+")";ctx.stroke();
      }
    }
  };
}
