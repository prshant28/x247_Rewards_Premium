import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const vertexShader = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uNoiseIntensity;
  uniform float uRotation;
  uniform vec2 uResolution;

  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  vec2 rotate(vec2 uv, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c) * uv;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    uv = rotate(uv, uRotation);

    uv *= uScale;

    float t = uTime * uSpeed;

    float noise = snoise(vec3(uv * 1.0, t * 0.5));
    noise += snoise(vec3(uv * 2.0 + 4.0, t * 0.4)) * 0.5;
    noise += snoise(vec3(uv * 4.0 + 8.0, t * 0.3)) * 0.25;

    vec2 warpedUv = uv + noise * uNoiseIntensity * 0.15;

    float silk = snoise(vec3(warpedUv * 3.0, t * 0.6));
    silk += snoise(vec3(warpedUv * 6.0, t * 0.5)) * 0.5;
    silk += snoise(vec3(warpedUv * 12.0, t * 0.4)) * 0.25;

    silk = silk * 0.5 + 0.5;

    float vignette = 1.0 - smoothstep(0.3, 0.9, length(vUv - 0.5));

    vec3 color = uColor * (0.6 + 0.4 * silk) * vignette;

    float highlight = pow(silk, 4.0) * 0.4;
    color += vec3(highlight);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

function parseColor(hex: string): number[] {
  const c = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return [0.13, 0.13, 0.13];
  return [
    parseInt(c.substring(0, 2), 16) / 255,
    parseInt(c.substring(2, 4), 16) / 255,
    parseInt(c.substring(4, 6), 16) / 255,
  ];
}

export default function Silk({
  speed = 5,
  scale = 1,
  color = "#212121",
  noiseIntensity = 1.5,
  rotation = 0,
}: SilkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: InstanceType<typeof Renderer>;
    let gl: any;
    let geometry: InstanceType<typeof Triangle>;
    let program: InstanceType<typeof Program>;
    let mesh: InstanceType<typeof Mesh>;
    let animId: number;

    try {
      renderer = new Renderer({ alpha: true });
      gl = renderer.gl as any;
      gl.clearColor(0, 0, 0, 0);
      container.appendChild(gl.canvas);

      gl.canvas.style.position = "absolute";
      gl.canvas.style.top = "0";
      gl.canvas.style.left = "0";
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";

      geometry = new Triangle(gl);

      const [r, g, b] = parseColor(color);

      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: [r, g, b] },
          uSpeed: { value: speed },
          uScale: { value: scale },
          uNoiseIntensity: { value: noiseIntensity },
          uRotation: { value: rotation },
          uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        },
      });

      mesh = new Mesh(gl, { geometry, program });
    } catch {
      setWebglFailed(true);
      return;
    }

    function resize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    }

    resize();
    window.addEventListener("resize", resize);

    const onContextLost = () => {
      cancelAnimationFrame(animId);
      setWebglFailed(true);
    };
    gl.canvas.addEventListener("webglcontextlost", onContextLost);

    const startTime = performance.now();

    function animate() {
      program.uniforms.uTime.value = (performance.now() - startTime) * 0.001;
      renderer.render({ scene: mesh });
      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      gl.canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.remove();
      program.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {webglFailed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at center, ${color} 0%, #000000 70%)`,
            animation: "silkPulse 8s ease-in-out infinite alternate",
          }}
        />
      )}
      <style>{`@keyframes silkPulse { 0% { opacity: 0.6; transform: scale(1); } 100% { opacity: 1; transform: scale(1.05); } }`}</style>
    </div>
  );
}
