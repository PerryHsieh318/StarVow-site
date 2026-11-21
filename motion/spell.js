// Anchors are fractions of the unpadded, full-body illustration, measured from its top left.
export const weapons = {
  knight: { origin:[.25,.50], tip:[.047,.873], tint:[.22,.73,1] },
  mage: { origin:[.929,.122], tip:[1.035,-.004], tint:[.89,.68,1] }
};
const vertex = 'attribute vec2 position; varying vec2 uv; void main(){uv=vec2(position.x*.5+.5,.5-position.y*.5); gl_Position=vec4(position,0.,1.);}';
function fragment(small) {
  return `precision mediump float;
varying vec2 uv;
uniform vec2 origin,tip;
uniform vec3 tint;
uniform float t,nearby,aspect;
float hash(vec2 p){p=mod(p,251.);return fract(sin(dot(p,vec2(12.97,37.13)))*4375.1);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);
}
float fbm(vec2 p){
  float f=.58*noise(p)+.28*noise(p*2.02+5.);
  ${small?'':'f+=.14*noise(p*4.12-3.);'}
  return f;
}
void main(){
  vec2 scale=vec2(aspect,1.);
  vec2 p=(uv*1.28-.14-origin)*scale;
  vec2 axis=(tip-origin)*scale;
  float len=length(axis);
  vec2 d=axis/len, n=vec2(-d.y,d.x);
  float u=dot(p,d)/len,v=dot(p,n);
  if(u<-.16||u>1.18||abs(v)>.067){gl_FragColor=vec4(0.);return;}
  float env=smoothstep(-.07,.08,u)*(1.-smoothstep(.89,1.13,u));
  float w=fbm(vec2(u*4.-t*.42,v*65.+t*.17))-.44;
  float warp=(.011*sin(u*13.-t*1.4)+w*.039)*env;
  float dist=abs(v-warp);
  float core=exp(-dist*900.)*env;
  float ribbon=exp(-dist*235.)*env*(.55+.65*fbm(vec2(u*8.-t*.9,v*110.)));
  float strand=exp(-abs(v+warp*.6-.009*sin(u*17.+t))*570.)*.55*env;
  float glow=exp(-dist*100.)*env*.29;
  float dust=0.;
  for(int i=0;i<${small?7:15};i++){
    float seed=float(i)+1.;
    float a=fract(t*(.09+.035*fract(seed*.63))+fract(seed*.618));
    float side=sin(a*8.+seed*6.1)*(.005+.017*a);
    vec2 delta=vec2((u-a)*len,v-side-warp);
    float tail=max(0.,-delta.x);
    float streak=length(vec2(delta.x/(1.+3.*step(delta.x,0.)),delta.y));
    dust+=exp(-streak*(680.+150.*fract(seed*.31)))*exp(-tail*60.)*smoothstep(0.,.12,a)*(1.-smoothstep(.83,1.,a));
  }
  float power=(ribbon+strand+glow+dust*.9+core*.75)*(1.+nearby*.22);
  vec3 color=mix(tint,vec3(.98,.99,1.),clamp(core+.45*dust,0.,1.));
  gl_FragColor=vec4(color,clamp(power,0.,.94));
}`;
}
function compile(gl,type,source) {
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);gl.compileShader(shader);
  if(gl.getShaderParameter(shader,gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);return null;
}
export function makeSpell(canvas,weapon,small) {
  const gl=canvas.getContext("webgl",{alpha:true,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:"low-power"});
  if(!gl) return null;
  const vs=compile(gl,gl.VERTEX_SHADER,vertex),fs=compile(gl,gl.FRAGMENT_SHADER,fragment(small));
  if(!vs||!fs) return null;
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,"position");
  gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const uniform=name=>gl.getUniformLocation(program,name);
  const time=uniform("t"),strength=uniform("nearby"),aspect=uniform("aspect");
  gl.uniform2fv(uniform("origin"),weapon.origin);gl.uniform2fv(uniform("tip"),weapon.tip);gl.uniform3fv(uniform("tint"),weapon.tint);
  let clock=0;
  return {
    resize(isSmall) {
      const scale=isSmall?.70:Math.min(devicePixelRatio,1.25);
      canvas.width=Math.max(1,Math.round(canvas.clientWidth*scale));canvas.height=Math.max(1,Math.round(canvas.clientHeight*scale));
      gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(aspect,canvas.width/canvas.height);
    },
    draw(dt,near) {
      clock+=dt*(1+.24*near);
      gl.uniform1f(time,clock);gl.uniform1f(strength,near);gl.drawArrays(gl.TRIANGLES,0,3);
    }
  };
}
