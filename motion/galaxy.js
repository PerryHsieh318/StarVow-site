// Precompute a low-resolution, domain-warped nebula; move two layers at different depths.
function hash(x,y) {
  const bits = Math.imul(x ^ 191, 374761393) + Math.imul(y ^ 29, 668265263);
  return (Math.imul(bits ^ (bits >>> 13), 1274126177) >>> 0) / 4294967296;
}
export function noise(x,y) {
  const i=Math.floor(x), j=Math.floor(y);
  let u=x-i, v=y-j;
  u=u*u*(3-2*u); v=v*v*(3-2*v);
  const top=hash(i,j)*(1-u)+hash(i+1,j)*u;
  const bottom=hash(i,j+1)*(1-u)+hash(i+1,j+1)*u;
  return top*(1-v)+bottom*v;
}
function nebula(small) {
  const layer=document.createElement("canvas");
  layer.width=small?144:280;
  layer.height=small?80:140;
  const ctx=layer.getContext("2d");
  const pixels=ctx.createImageData(layer.width,layer.height);
  for(let y=0;y<layer.height;y++) for(let x=0;x<layer.width;x++) {
    const u=x/layer.width,v=y/layer.height;
    const warp=noise(u*6,v*4);
    const field=.55*noise(u*8+warp*2,v*4)+.3*noise(u*21,v*12+warp)+.15*noise(u*44,v*32);
    const ridge=v-(.80-.73*u+.13*Math.sin(7*u)+.18*(warp-.5));
    const density=Math.max(0,field-.29)*Math.exp(-ridge*ridge*34);
    const p=(y*layer.width+x)*4;
    pixels.data[p]=95+warp*60;pixels.data[p+1]=130+field*85;
    pixels.data[p+2]=254;pixels.data[p+3]=Math.min(100,density*180);
  }
  ctx.putImageData(pixels,0,0);
  return layer;
}
export function makeGalaxy(canvas) {
  const ctx=canvas.getContext("2d",{alpha:true});
  if(!ctx) return null;
  let width,height,stars,texture;
  return {
    resize(w,h,small) {
      width=w; height=h;
      const scale=small?.65:Math.min(devicePixelRatio,1.15);
      canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);
      ctx.setTransform(scale,0,0,scale,0,0);
      texture=nebula(small);
      stars=Array.from({length:small?30:90},(_,i)=>({x:hash(i,1),y:hash(i,2),depth:.25+.75*hash(i,3),r:.45+hash(i,4)*1.05}));
    },
    draw(t,px,py,lightX,lightY) {
      ctx.clearRect(0,0,width,height);
      ctx.globalAlpha=.62;
      ctx.drawImage(texture,(-.09+.03*Math.sin(t*.048))*width+px*4,(-.10+.035*Math.cos(t*.062))*height,1.2*width,1.16*height);
      ctx.globalAlpha=.36;
      ctx.drawImage(texture,(-.05+.04*Math.cos(t*.036))*width,(-.26+.025*Math.sin(t*.042))*height,1.3*width,1.05*height);
      if(lightX>=0&&lightY>=0&&lightX<width&&lightY<height) {
        const halo=ctx.createRadialGradient(lightX,lightY,0,lightX,lightY,100);
        halo.addColorStop(0,"rgba(164,204,255,.13)");halo.addColorStop(1,"rgba(164,204,255,0)");
        ctx.globalAlpha=1;ctx.fillStyle=halo;ctx.fillRect(lightX-100,lightY-100,200,200);
      }
      for(const s of stars) {
        const x=((s.x*width+t*(2+s.depth*4)+px*7*s.depth+width+12)%(width+12))-6;
        const y=((s.y*height-t*(1+s.depth*2)+py*5*s.depth)%(height+12)+height+12)%(height+12)-6;
        ctx.globalAlpha=(.24+.5*s.depth)*(.86+.14*Math.sin(t*.5+s.x*72));
        ctx.fillStyle=s.x>.86?"#ffdc9d":"#d1e7ff";ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    }
  };
}
