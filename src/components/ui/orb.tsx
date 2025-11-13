"use client"
import { useEffect, useMemo, useRef } from "react"
import { useTexture } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

export type AgentState = null | "thinking" | "listening" | "talking"

/**
 * PRESETS
 * Add any named presets here. 'ice' is the blue/pink preset sampled from the image.
 * 'og6' is the 6-color metallic/brush palette you requested.
 */
export const PRESETS: Record<string, string[] | [string, string]> = {
  ice: ["#A3E4FF", "#F6A9FF"], // main ice-blue + pink
  iceRich: ["#A3E4FF", "#F6A9FF", "#D1F4FF", "#FFFFFF"], // optional richer palette (first two used)
  og6: [
    "#e6c9bf",
    "#d2b5aa",
    "#cbaea3",
    "#d4b5ab",
    "#e5c3bd",
    "#d9bcb1",
  ],
}

type OrbProps = {
  colors?: [string, string] | string[]
  colorsRef?: React.RefObject<[string, string] | string[]>
  preset?: keyof typeof PRESETS | string
  resizeDebounce?: number
  seed?: number
  agentState?: AgentState
  volumeMode?: "auto" | "manual"
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: React.RefObject<number>
  outputVolumeRef?: React.RefObject<number>
  getInputVolume?: () => number
  getOutputVolume?: () => number
  className?: string
}

export function Orb({
  colors = ["#CADCFC", "#A0B9D1"],
  colorsRef,
  preset,
  resizeDebounce = 100,
  seed,
  agentState = null,
  volumeMode = "auto",
  manualInput,
  manualOutput,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
  className,
}: OrbProps) {
  // resolve colors priority:
  // 1. explicit colors prop
  // 2. colorsRef.current (if provided)
  // 3. preset (if provided and matches PRESETS)
  // 4. fallback default
  const resolvedColors = useMemo<string[]>(() => {
    // explicit colors prop (normalize to array)
    if (colors && Array.isArray(colors) && colors.length >= 2) {
      return colors as string[]
    }

    // colorsRef current
    if (
      colorsRef &&
      colorsRef.current &&
      Array.isArray(colorsRef.current) &&
      colorsRef.current.length >= 2
    ) {
      return colorsRef.current as string[]
    }

    // preset
    if (preset && typeof preset === "string") {
      const p = PRESETS[preset]
      if (p && Array.isArray(p) && p.length >= 2) {
        return p as string[]
      }
    }

    // fallback
    return ["#CADCFC", "#A0B9D1"]
  }, [colors, colorsRef?.current, preset])

  return (
    <div className={className ?? "relative h-full w-full"}>
      <Canvas
        resize={{ debounce: resizeDebounce }}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
        }}
      >
        <Scene
          colors={resolvedColors}
          colorsRef={colorsRef}
          seed={seed}
          agentState={agentState}
          volumeMode={volumeMode}
          manualInput={manualInput}
          manualOutput={manualOutput}
          inputVolumeRef={inputVolumeRef}
          outputVolumeRef={outputVolumeRef}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
        />
      </Canvas>
    </div>
  )
}

function Scene({
  colors,
  colorsRef,
  seed,
  agentState,
  volumeMode,
  manualInput,
  manualOutput,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
}: {
  colors: string[]
  colorsRef?: React.RefObject<[string, string] | string[]>
  seed?: number
  agentState: AgentState
  volumeMode: "auto" | "manual"
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: React.RefObject<number>
  outputVolumeRef?: React.RefObject<number>
  getInputVolume?: () => number
  getOutputVolume?: () => number
}) {
  const { gl } = useThree()
  const circleRef =
    useRef<THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial>>(null)

  // store initial colors array (will be used to initialize uniforms)
  const initialColorsRef = useRef<string[]>(colors)
  // create 6 target color THREE.Color refs to lerp towards (covers up to 6 stops)
  const targetColorRefs = useRef<THREE.Color[]>(
    Array.from({ length: 6 }, (_, i) => new THREE.Color(colors[i % colors.length]))
  )
  const animSpeedRef = useRef(0.1)

  const perlinNoiseTexture = useTexture(
    "https://storage.googleapis.com/eleven-public-cdn/images/perlin-noise.png"
  )

  const agentRef = useRef<AgentState>(agentState)
  const modeRef = useRef<"auto" | "manual">(volumeMode)
  const manualInRef = useRef<number>(manualInput ?? 0)
  const manualOutRef = useRef<number>(manualOutput ?? 0)
  const curInRef = useRef(0)
  const curOutRef = useRef(0)

  useEffect(() => {
    agentRef.current = agentState
  }, [agentState])

  useEffect(() => {
    modeRef.current = volumeMode
  }, [volumeMode])

  useEffect(() => {
    manualInRef.current = clamp01(
      manualInput ?? inputVolumeRef?.current ?? getInputVolume?.() ?? 0
    )
  }, [manualInput, inputVolumeRef, getInputVolume])

  useEffect(() => {
    manualOutRef.current = clamp01(
      manualOutput ?? outputVolumeRef?.current ?? getOutputVolume?.() ?? 0
    )
  }, [manualOutput, outputVolumeRef, getOutputVolume])

  const random = useMemo(
    () => splitmix32(seed ?? Math.floor(Math.random() * 2 ** 32)),
    [seed]
  )

  const offsets = useMemo(
    () =>
      new Float32Array(Array.from({ length: 7 }, () => random() * Math.PI * 2)),
    [random]
  )

  // whenever incoming colors array changes, update targetColorRefs
  useEffect(() => {
    initialColorsRef.current = colors.slice()
    for (let i = 0; i < 6; i++) {
      const c = colors[i % colors.length] || colors[0]
      targetColorRefs.current[i].set(c)
    }
  }, [colors])

  useEffect(() => {
    const apply = () => {
      if (!circleRef.current) return
      const isDark = document.documentElement.classList.contains("dark")
      circleRef.current.material.uniforms.uInverted.value = isDark ? 1 : 0
    }
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  useFrame((_, delta: number) => {
    const mat = circleRef.current?.material
    if (!mat) return

    const live = colorsRef?.current
    if (live && Array.isArray(live) && live.length > 0) {
      // if live colors update, push them into target colors
      for (let i = 0; i < 6; i++) {
        const c = live[i % live.length] || live[0]
        targetColorRefs.current[i].set(c)
      }
    }

    const u = mat.uniforms
    u.uTime.value += delta * 0.5

    if (u.uOpacity.value < 1) {
      u.uOpacity.value = Math.min(1, u.uOpacity.value + delta * 2)
    }

    let targetIn = 0
    let targetOut = 0.3

    if (modeRef.current === "manual") {
      targetIn = clamp01(
        manualInput ?? inputVolumeRef?.current ?? getInputVolume?.() ?? 0
      )
      targetOut = clamp01(
        manualOutput ?? outputVolumeRef?.current ?? getOutputVolume?.() ?? 0
      )
    } else {
      const t = u.uTime.value * 2
      if (agentRef.current === null) {
        targetIn = 0
        targetOut = 0.3
      } else if (agentRef.current === "listening") {
        targetIn = clamp01(0.55 + Math.sin(t * 3.2) * 0.35)
        targetOut = 0.45
      } else if (agentRef.current === "talking") {
        targetIn = clamp01(0.65 + Math.sin(t * 4.8) * 0.22)
        targetOut = clamp01(0.75 + Math.sin(t * 3.6) * 0.22)
      } else {
        const base = 0.38 + 0.07 * Math.sin(t * 0.7)
        const wander = 0.05 * Math.sin(t * 2.1) * Math.sin(t * 0.37 + 1.2)
        targetIn = clamp01(base + wander)
        targetOut = clamp01(0.48 + 0.12 * Math.sin(t * 1.05 + 0.6))
      }
    }

    curInRef.current += (targetIn - curInRef.current) * 0.2
    curOutRef.current += (targetOut - curOutRef.current) * 0.2

    const targetSpeed = 0.1 + (1 - Math.pow(curOutRef.current - 1, 2)) * 0.9
    animSpeedRef.current += (targetSpeed - animSpeedRef.current) * 0.12

    u.uAnimation.value += delta * animSpeedRef.current
    u.uInputVolume.value = curInRef.current
    u.uOutputVolume.value = curOutRef.current

    // lerp each uniform color towards its target (supports up to 6 stops)
    for (let i = 0; i < 6; i++) {
      const uniformName = `uColor${i + 1}` as keyof typeof u
      // @ts-ignore - we know these exist and are THREE.Color
      u[uniformName].value.lerp(targetColorRefs.current[i], 0.08)
    }
  })

  useEffect(() => {
    const canvas = gl.domElement
    const onContextLost = (event: Event) => {
      event.preventDefault()
      setTimeout(() => {
        gl.forceContextRestore()
      }, 1)
    }
    canvas.addEventListener("webglcontextlost", onContextLost, false)
    return () =>
      canvas.removeEventListener("webglcontextlost", onContextLost, false)
  }, [gl])

  const uniforms = useMemo(() => {
    perlinNoiseTexture.wrapS = THREE.RepeatWrapping
    perlinNoiseTexture.wrapT = THREE.RepeatWrapping
    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")

    // Create up to 6 color uniforms (fall back to first color if not provided)
    const colorUniforms: Record<string, any> = {}
    for (let i = 0; i < 6; i++) {
      const hex = initialColorsRef.current[i % initialColorsRef.current.length] || initialColorsRef.current[0]
      colorUniforms[`uColor${i + 1}`] = new THREE.Uniform(new THREE.Color(hex))
    }

    return {
      ...colorUniforms,
      uOffsets: { value: offsets },
      uPerlinTexture: new THREE.Uniform(perlinNoiseTexture),
      uTime: new THREE.Uniform(0),
      uAnimation: new THREE.Uniform(0.1),
      uInverted: new THREE.Uniform(isDark ? 1 : 0),
      uInputVolume: new THREE.Uniform(0),
      uOutputVolume: new THREE.Uniform(0),
      uOpacity: new THREE.Uniform(0),
    }
  }, [perlinNoiseTexture, offsets])

  return (
    <mesh ref={circleRef}>
      <circleGeometry args={[3.5, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShaderMulti6}
        vertexShader={vertexShader}
        transparent={true}
      />
    </mesh>
  )
}

function splitmix32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x9e3779b9) | 0
    let t = a ^ (a >>> 16)
    t = Math.imul(t, 0x21f0aaad)
    t = t ^ (t >>> 15)
    t = Math.imul(t, 0x735a2d97)
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296
  }
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

const vertexShader = /* glsl */ `
uniform float uTime;
uniform sampler2D uPerlinTexture;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Extended fragment shader that supports up to 6 color stops
const fragmentShaderMulti6 = /* glsl */ `
uniform float uTime;
uniform float uAnimation;
uniform float uInverted;
uniform float uOffsets[7];
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;
uniform float uInputVolume;
uniform float uOutputVolume;
uniform float uOpacity;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

const float PI = 3.14159265358979323846;

// Draw a single oval with soft edges and calculate its gradient color
bool drawOval(vec2 polarUv, vec2 polarCenter, float a, float b, bool reverseGradient, float softness, out vec4 color) {
    vec2 p = polarUv - polarCenter;
    float oval = (p.x * p.x) / (a * a) + (p.y * p.y) / (b * b);
    float edge = smoothstep(1.0, 1.0 - softness, oval);
    
    if (edge > 0.0) {
        float gradient = reverseGradient ? (1.0 - (p.x / a + 1.0) / 2.0) : ((p.x / a + 1.0) / 2.0);
        // Flatten gradient toward middle value for more uniform appearance
        gradient = mix(0.5, gradient, 0.1);
        color = vec4(vec3(gradient), 0.85 * edge);
        return true;
    }
    return false;
}

// Map grayscale value to a 6-color ramp
vec3 ramp6(float g, vec3 c1, vec3 c2, vec3 c3, vec3 c4, vec3 c5, vec3 c6) {
    if (g < 0.1666667) {
        return mix(c1, c2, g / 0.1666667);
    } else if (g < 0.3333334) {
        return mix(c2, c3, (g - 0.1666667) / 0.1666667);
    } else if (g < 0.5) {
        return mix(c3, c4, (g - 0.3333334) / 0.1666667);
    } else if (g < 0.6666667) {
        return mix(c4, c5, (g - 0.5) / 0.1666667);
    } else {
        return mix(c5, c6, (g - 0.6666667) / 0.3333333);
    }
}

vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// 2D noise for the ring
float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    float n = mix(
        mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
    );
    return 0.5 + 0.5 * n;
}

float sharpRing(vec3 decomposed, float time) {
    float ringStart = 1.0;
    float ringWidth = 0.3;
    float noiseScale = 5.0;
    
    float noise = mix(
        noise2D(vec2(decomposed.x, time) * noiseScale),
        noise2D(vec2(decomposed.y, time) * noiseScale),
        decomposed.z
    );
    
    noise = (noise - 0.5) * 2.5;
    
    return ringStart + noise * ringWidth * 1.5;
}

float smoothRing(vec3 decomposed, float time) {
    float ringStart = 0.9;
    float ringWidth = 0.2;
    float noiseScale = 6.0;
    
    float noise = mix(
        noise2D(vec2(decomposed.x, time) * noiseScale),
        noise2D(vec2(decomposed.y, time) * noiseScale),
        decomposed.z
    );
    
    noise = (noise - 0.5) * 5.0;
    
    return ringStart + noise * ringWidth;
}

float flow(vec3 decomposed, float time) {
    return mix(
        texture(uPerlinTexture, vec2(time, decomposed.x / 2.0)).r,
        texture(uPerlinTexture, vec2(time, decomposed.y / 2.0)).r,
        decomposed.z
    );
}

void main() {
    // Normalize vUv to be centered around (0.0, 0.0)
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Convert uv to polar coordinates
    float radius = length(uv);
    float theta = atan(uv.y, uv.x);
    if (theta < 0.0) theta += 2.0 * PI; // Normalize theta to [0, 2*PI]
    
    // Decomposed angle is used for sampling noise textures without seams:
    vec3 decomposed = vec3(
        theta / (2.0 * PI),
        mod(theta / (2.0 * PI) + 0.5, 1.0) + 1.0,
        abs(theta / PI - 1.0)
    );
    
    // Add noise to the angle for a flow-like distortion (reduced for flatter look)
    float noise = flow(decomposed, radius * 0.03 - uAnimation * 0.2) - 0.5;
    theta += noise * mix(0.08, 0.25, uOutputVolume);
    
    // Initialize the base color to white
    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
    
    // Original parameters for the ovals in polar coordinates
    float originalCenters[7] = float[7](0.0, 0.5 * PI, 1.0 * PI, 1.5 * PI, 2.0 * PI, 2.5 * PI, 3.0 * PI);
    
    // Parameters for the animated centers in polar coordinates
    float centers[7];
    for (int i = 0; i < 7; i++) {
        centers[i] = originalCenters[i] + 0.5 * sin(uTime / 20.0 + uOffsets[i]);
    }
    
    float a, b;
    vec4 ovalColor;
    
    // Check if the pixel is inside any of the ovals
    for (int i = 0; i < 7; i++) {
        float noise = texture(uPerlinTexture, vec2(mod(centers[i] + uTime * 0.05, 1.0), 0.5)).r;
        a = 0.5 + noise * 0.3; // Increased for more coverage
        b = noise * mix(3.5, 2.5, uInputVolume); // Increased height for fuller appearance
        bool reverseGradient = (i % 2 == 1); // Reverse gradient for every second oval
        
        float distTheta = min(
            abs(theta - centers[i]),
            min(
                abs(theta + 2.0 * PI - centers[i]),
                abs(theta - 2.0 * PI - centers[i])
            )
        );
        float distRadius = radius;
        float softness = 0.6; // Increased softness for flatter, less pronounced edges
        
        if (drawOval(vec2(distTheta, distRadius), vec2(0.0, 0.0), a, b, reverseGradient, softness, ovalColor)) {
            color.rgb = mix(color.rgb, ovalColor.rgb, ovalColor.a);
            color.a = max(color.a, ovalColor.a);
        }
    }
    
    // Calculate both noisy rings
    float ringRadius1 = sharpRing(decomposed, uTime * 0.1);
    float ringRadius2 = smoothRing(decomposed, uTime * 0.1);
    
    // Adjust rings based on input volume (reduced for flatter appearance)
    float inputRadius1 = radius + uInputVolume * 0.2;
    float inputRadius2 = radius + uInputVolume * 0.15;
    float opacity1 = mix(0.2, 0.6, uInputVolume);
    float opacity2 = mix(0.15, 0.45, uInputVolume);
    
    float ringAlpha1 = (inputRadius2 >= ringRadius1) ? opacity1 : 0.0;
    float ringAlpha2 = smoothstep(ringRadius2 - 0.05, ringRadius2 + 0.05, inputRadius1) * opacity2;
    
    float totalRingAlpha = max(ringAlpha1, ringAlpha2);
    
    // Apply screen blend mode for combined rings
    vec3 ringColor = vec3(1.0); // White ring color
    color.rgb = 1.0 - (1.0 - color.rgb) * (1.0 - ringColor * totalRingAlpha);
    
    // Define 6 colours to ramp against (from uniforms)
    vec3 c1 = uColor1;
    vec3 c2 = uColor2;
    vec3 c3 = uColor3;
    vec3 c4 = uColor4;
    vec3 c5 = uColor5;
    vec3 c6 = uColor6;
    
    // Convert grayscale color to the color ramp
    float luminance = mix(color.r, 1.0 - color.r, uInverted);
    color.rgb = ramp6(luminance, c1, c2, c3, c4, c5, c6);
    
    // Apply fade-in opacity
    color.a *= uOpacity;
    
    gl_FragColor = color;
}
`

