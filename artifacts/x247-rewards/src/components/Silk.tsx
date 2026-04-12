import { useRef, useEffect, useState } from "react";

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [33, 33, 33];
}

const grad3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
];

const perm = new Uint8Array(512);
const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
for (let i = 0; i < 256; i++) { perm[i] = p[i]; perm[i + 256] = p[i]; }

function dot3(g: number[], x: number, y: number, z: number) {
  return g[0]*x + g[1]*y + g[2]*z;
}

function noise3D(xin: number, yin: number, zin: number): number {
  const F3 = 1/3, G3 = 1/6;
  const s = (xin+yin+zin)*F3;
  const i = Math.floor(xin+s), j = Math.floor(yin+s), k = Math.floor(zin+s);
  const t = (i+j+k)*G3;
  const x0 = xin-(i-t), y0 = yin-(j-t), z0 = zin-(k-t);
  let i1,j1,k1,i2,j2,k2;
  if(x0>=y0){
    if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;}
    else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;}
    else{i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;}
  } else {
    if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;}
    else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;}
    else{i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;}
  }
  const x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3;
  const x2=x0-i2+2*G3, y2=y0-j2+2*G3, z2=z0-k2+2*G3;
  const x3=x0-1+3*G3, y3=y0-1+3*G3, z3=z0-1+3*G3;
  const ii=i&255, jj=j&255, kk=k&255;
  const gi0=perm[ii+perm[jj+perm[kk]]]%12;
  const gi1=perm[ii+i1+perm[jj+j1+perm[kk+k1]]]%12;
  const gi2=perm[ii+i2+perm[jj+j2+perm[kk+k2]]]%12;
  const gi3=perm[ii+1+perm[jj+1+perm[kk+1]]]%12;
  let t0=0.6-x0*x0-y0*y0-z0*z0;
  let n0=t0<0?0:(t0*=t0,t0*t0*dot3(grad3[gi0],x0,y0,z0));
  let t1=0.6-x1*x1-y1*y1-z1*z1;
  let n1=t1<0?0:(t1*=t1,t1*t1*dot3(grad3[gi1],x1,y1,z1));
  let t2=0.6-x2*x2-y2*y2-z2*z2;
  let n2=t2<0?0:(t2*=t2,t2*t2*dot3(grad3[gi2],x2,y2,z2));
  let t3=0.6-x3*x3-y3*y3-z3*z3;
  let n3=t3<0?0:(t3*=t3,t3*t3*dot3(grad3[gi3],x3,y3,z3));
  return 32*(n0+n1+n2+n3);
}

export default function Silk({ speed = 5, scale = 1, color = "#212121", noiseIntensity = 1.5, rotation = 0 }: SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (gl) {
      const vertSrc = `attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}`;
      const fragSrc = `precision highp float;
uniform float uTime,uSpeed,uScale,uNoiseIntensity,uRotation;
uniform vec3 uColor;uniform vec2 uResolution;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;
vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
i=mod289(i);
vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
void main(){
vec2 uv=gl_FragCoord.xy/uResolution;float aspect=uResolution.x/uResolution.y;uv.x*=aspect;
float cosR=cos(uRotation);float sinR=sin(uRotation);
vec2 center=vec2(aspect*0.5,0.5);uv-=center;uv=mat2(cosR,-sinR,sinR,cosR)*uv;uv+=center;
float time=uTime*uSpeed*0.1;
float n1=snoise(vec3(uv*uScale,time))*uNoiseIntensity;
float n2=snoise(vec3(uv*uScale*2.0,time*1.4))*uNoiseIntensity*0.5;
float n3=snoise(vec3(uv*uScale*4.0,time*1.8))*uNoiseIntensity*0.25;
float noise=n1+n2+n3;
vec3 col=uColor+noise*0.15;col=clamp(col,0.0,1.0);
vec2 rawUv=gl_FragCoord.xy/uResolution;
float vignette=1.0-length((rawUv-0.5)*1.4);vignette=smoothstep(0.0,0.7,vignette);
col*=vignette*0.9+0.1;
gl_FragColor=vec4(col,1.0);
}`;

      const vs = gl.createShader(gl.VERTEX_SHADER);
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      if (vs && fs) {
        gl.shaderSource(vs, vertSrc); gl.compileShader(vs);
        gl.shaderSource(fs, fragSrc); gl.compileShader(fs);
        const prog = gl.createProgram();
        if (prog && gl.getShaderParameter(vs, gl.COMPILE_STATUS) && gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
          gl.attachShader(prog, vs); gl.attachShader(prog, fs);
          gl.linkProgram(prog);
          if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            gl.useProgram(prog);
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
            const pos = gl.getAttribLocation(prog, "position");
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
            const uTime = gl.getUniformLocation(prog, "uTime");
            const uRes = gl.getUniformLocation(prog, "uResolution");
            const [r, g, b] = hexToRgb(color);
            gl.uniform1f(gl.getUniformLocation(prog, "uSpeed"), speed);
            gl.uniform1f(gl.getUniformLocation(prog, "uScale"), scale);
            gl.uniform1f(gl.getUniformLocation(prog, "uNoiseIntensity"), noiseIntensity);
            gl.uniform1f(gl.getUniformLocation(prog, "uRotation"), rotation);
            gl.uniform3f(gl.getUniformLocation(prog, "uColor"), r/255, g/255, b/255);
            let animId: number;
            const t0 = performance.now();
            function resize() {
              const dpr = Math.min(window.devicePixelRatio, 2);
              canvas!.width = canvas!.clientWidth * dpr;
              canvas!.height = canvas!.clientHeight * dpr;
              gl!.viewport(0, 0, canvas!.width, canvas!.height);
              gl!.uniform2f(uRes, canvas!.width, canvas!.height);
            }
            function loop() {
              gl!.uniform1f(uTime, (performance.now() - t0) * 0.001);
              gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
              animId = requestAnimationFrame(loop);
            }
            resize(); loop();
            const ro = new ResizeObserver(() => resize());
            ro.observe(canvas);
            return () => { cancelAnimationFrame(animId); ro.disconnect(); gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs); };
          }
        }
        gl.deleteShader(vs); gl.deleteShader(fs);
      }
    }

    setWebglFailed(true);
    return undefined;
  }, [speed, scale, color, noiseIntensity, rotation]);

  useEffect(() => {
    if (!webglFailed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [cr, cg, cb] = hexToRgb(color);
    let animId: number;
    const t0 = performance.now();
    const SAMPLE = 3;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas!.width = Math.floor(canvas!.clientWidth * dpr / SAMPLE);
      canvas!.height = Math.floor(canvas!.clientHeight * dpr / SAMPLE);
    }

    function draw() {
      const w = canvas!.width, h = canvas!.height;
      if (w === 0 || h === 0) { animId = requestAnimationFrame(draw); return; }
      const imageData = ctx!.createImageData(w, h);
      const data = imageData.data;
      const time = ((performance.now() - t0) * 0.001) * speed * 0.1;
      const aspect = w / h;
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const cx = aspect * 0.5, cy = 0.5;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let uvx = (x / w) * aspect;
          let uvy = y / h;
          const dx = uvx - cx, dy = uvy - cy;
          uvx = cosR * dx - sinR * dy + cx;
          uvy = sinR * dx + cosR * dy + cy;

          const n1 = noise3D(uvx * scale, uvy * scale, time) * noiseIntensity;
          const n2 = noise3D(uvx * scale * 2, uvy * scale * 2, time * 1.4) * noiseIntensity * 0.5;
          const n3 = noise3D(uvx * scale * 4, uvy * scale * 4, time * 1.8) * noiseIntensity * 0.25;
          const noise = (n1 + n2 + n3) * 0.15;

          const rawX = x / w, rawY = y / h;
          const vd = Math.sqrt((rawX - 0.5) * (rawX - 0.5) * 1.96 + (rawY - 0.5) * (rawY - 0.5) * 1.96);
          const vig = Math.max(0, Math.min(1, (0.7 - vd) / 0.7)) * 0.9 + 0.1;

          const idx = (y * w + x) * 4;
          data[idx]     = Math.max(0, Math.min(255, (cr / 255 + noise) * vig * 255));
          data[idx + 1] = Math.max(0, Math.min(255, (cg / 255 + noise) * vig * 255));
          data[idx + 2] = Math.max(0, Math.min(255, (cb / 255 + noise) * vig * 255));
          data[idx + 3] = 255;
        }
      }
      ctx!.putImageData(imageData, 0, 0);
      animId = requestAnimationFrame(draw);
    }

    resize(); draw();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, [webglFailed, speed, scale, color, noiseIntensity, rotation]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        imageRendering: webglFailed ? "auto" : undefined,
      }}
    />
  );
}
