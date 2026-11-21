import {dart, envelope, flowTexture, wave} from "./paint.js";
import {noise} from "../galaxy.js";

export function shadow(ctx, fx) {
  const {t, image, small, near, height} = fx;
  const surge = wave(t * 1.35 - .25);
  const reach = 74 + surge * 11 + near * 4;
  ctx.translate(69, height * .757);
  ctx.rotate(-.29);

  // Ink wisps split and curl back towards the palm below the character's face.
  for (let i = 0; i < 4; i++) {
    const side = i % 2 ? 1 : -1;
    const curl = 5 * Math.sin(t * .83 + i);
    ctx.strokeStyle = "rgba(21,6,38," + (.35 + .12 * surge) + ")";
    ctx.lineWidth = 1.25 - i * .16;
    ctx.beginPath(); ctx.moveTo(2,side*2);
    ctx.bezierCurveTo(17,side*(8+curl),32,side*(9-curl),28,side*(17+curl));
    ctx.bezierCurveTo(25,side*22,38,side*(14+curl),43,side*(12+curl));ctx.stroke();
  }
  flowTexture(ctx,image,-10,-reach*.33,reach,reach*.65,t,3.7,small?14:24);
  // Three independently moving streaks pass through the painted lance tips.
  for (let i=0;i<3;i++) {
    const u=(t*.30+i*.31)%1;
    ctx.globalAlpha=.8*envelope(u);
    const x=8+u*(reach-18);
    const y=(i-1)*(2+x*.070)+1.1*Math.sin(t*1.6+i+u*4);
    dart(ctx,x,y,13+u*7,1.15,0,"#ac45ff","#f9e7ff");
  }
  for(let i=0;i<(small?7:13);i++) {
    const u=(t*(.13+i*.004)+i*.618)%1;
    const side=i%2?1:-1;
    const x=u*(reach+5), y=side*(4+u*(10+i%5))+3*(noise(5*u,t*.3+i)-.5);
    ctx.globalAlpha=envelope(u)*(.7+.17*near);
    dart(ctx,x,y,2+i%4,.5,side*.2,"#341050","#cd83ff");
  }
}
