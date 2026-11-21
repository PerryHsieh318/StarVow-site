import {TAU, envelope, flowTexture, glint, wave} from "./paint.js";

// Two cubic arcs join at the crystal already painted on the staff.
function stream(u,t) {
  const upper = u < .41;
  const v = upper ? u/.41 : (u-.41)/.59;
  const p=1-v, drift=Math.sin(t*.8+v*4);
  const coords=upper
    ? [[14,19],[1+2*drift,37],[-4,55+drift],[22,69]]
    : [[22,69],[49,93+drift],[114,83+2*drift],[89,54]];
  const [a,b,c,d]=coords;
  return [p*p*p*a[0]+3*p*p*v*b[0]+3*p*v*v*c[0]+v*v*v*d[0],
    p*p*p*a[1]+3*p*p*v*b[1]+3*p*v*v*c[1]+v*v*v*d[1]];
}

function ribbon(ctx,t,steps) {
  const left=[],right=[];
  for(let i=0;i<=steps;i++) {
    const u=i/steps, [x,y]=stream(u,t);
    const [ax,ay]=stream(Math.max(0,u-.004),t),[bx,by]=stream(Math.min(1,u+.004),t);
    const norm=Math.hypot(bx-ax,by-ay)||1;
    const width=Math.pow(Math.sin(Math.PI*u),.62)*(1.5+1.1*wave(u*12-t*1.35));
    const nx=-(by-ay)/norm*width,ny=(bx-ax)/norm*width;
    left.push([x+nx,y+ny]);right.push([x-nx,y-ny]);
  }
  const shade=ctx.createLinearGradient(0,25,90,85);
  shade.addColorStop(0,"#86c9ff");shade.addColorStop(.36,"#f4feff");
  shade.addColorStop(.66,"#8feaff");shade.addColorStop(1,"#6263e5");
  ctx.fillStyle=shade;ctx.shadowColor="#488dff";ctx.shadowBlur=5;
  ctx.beginPath();
  for(const [x,y] of left)ctx.lineTo(x,y);
  for(const [x,y] of right.reverse())ctx.lineTo(x,y);
  ctx.closePath();ctx.fill();ctx.shadowBlur=0;
  for(let k=0;k<2;k++) {
    const u=(t*.15+k*.5)%1;
    ctx.globalAlpha=.85*envelope(u);ctx.lineWidth=.72;ctx.strokeStyle="#fff";
    ctx.beginPath();
    for(let i=0;i<=10;i++) {
      const [x,y]=stream(Math.max(0,u-i*.011),t);
      if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha=1;
}

export function frost(ctx,{image,t,small,near}) {
  ribbon(ctx,t,small?38:58);
  ctx.save();ctx.translate(14,19);ctx.rotate(.12*Math.sin(t*.57));
  const size=34+1.4*wave(t*.85);
  flowTexture(ctx,image,-size/2,-size*.535,size,size*1.07,t,.65,small?9:15);
  ctx.restore();
  for(let i=0;i<(small?9:18);i++) {
    const u=(t*(.08+(i%3)*.018)+i*.618)%1;
    const [x,y]=stream(u,t);
    ctx.globalAlpha=envelope(u)*(.74+.15*near);
    const spread=Math.sin(u*TAU+i)*4;
    glint(ctx,x+spread,y+Math.cos(u*TAU+i)*4,.6+(i%4)*.36,"#dbffff");
  }
}
