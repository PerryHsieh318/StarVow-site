import {TAU, dart, envelope, flowTexture, wave} from "./paint.js";

export function captain(ctx,{t,image,small,near,height}) {
  const heat=wave(t*1.8);
  // The portal sits behind the sprite. Its asymmetric rim breaks into rising cinders.
  ctx.save();ctx.translate(48,height*.49);ctx.rotate(-.19+.035*Math.sin(t*.7));
  flowTexture(ctx,image,-61,-height*.55,122,height*1.10,t,3.5,small?14:22);
  ctx.restore();
  for(let i=0;i<(small?8:16);i++) {
    const age=(t*(.12+(i%4)*.02)+i*.618)%1;
    const angle=i*2.4;
    const x=48+(53+age*5)*Math.cos(angle)+3*Math.sin(t+i);
    const y=height*.49+height*.47*Math.sin(angle)-age*13;
    ctx.globalAlpha=envelope(age)*.8;
    dart(ctx,x,y,2.6+i%3,.7,-1.32,"#ec7221","#ffe897");
  }
  ctx.globalAlpha=1;
  // Point the muzzle flash along the visible barrel, down and to the left.
  ctx.translate(12,height*.82);ctx.rotate(2.40);
  const reach=small?38:53;
  const flash=9+6*heat;
  const flare=ctx.createLinearGradient(0,0,flash,0);
  flare.addColorStop(0,"#fffcce");flare.addColorStop(.42,"#ffd556");flare.addColorStop(1,"#ef6a17");
  ctx.fillStyle=flare;ctx.beginPath();ctx.moveTo(-1,-1.25);
  ctx.lineTo(flash*.48,-3.5);ctx.lineTo(flash*.36,-1.05);ctx.lineTo(flash,0);
  ctx.lineTo(flash*.4,1.25);ctx.lineTo(flash*.53,2.7);ctx.lineTo(-1,1);ctx.fill();
  for(let i=0;i<2;i++) {
    const age=(t*.55+i*.5)%1, x=4+reach*age;
    ctx.globalAlpha=envelope(age)*(.79+near*.12);
    dart(ctx,x,0,12+age*7,1.8,0,"#ff931b","#fffbc9");
    ctx.save();ctx.translate(x*.56,0);ctx.rotate(.18);
    ctx.strokeStyle="#ffc34f";ctx.lineWidth=.55;
    ctx.beginPath();ctx.ellipse(0,0,1+age,2+age*4,0,0,TAU);ctx.stroke();ctx.restore();
  }
  for(let i=0;i<(small?5:10);i++) {
    const age=(t*.38+i*.618)%1;
    const angle=(i%2?1:-1)*(.14+.07*(i%4));
    const x=age*(reach*.75), y=Math.sin(angle)*x;
    ctx.globalAlpha=envelope(age)*.85;
    dart(ctx,x,y,3+i%5,.55,angle,"#ec6b14","#ffe695");
  }
}
