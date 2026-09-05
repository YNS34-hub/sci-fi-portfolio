import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { EngineState } from '../types'

interface WebGLWorldProps {
  engineRef: React.MutableRefObject<EngineState>
  onReady: () => void
  onFailure: () => void
  onAssetState: (loaded: boolean) => void
}

const backgroundVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const backgroundFragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform float uDepth;
  uniform float uEnergy;
  uniform float uCoherence;
  uniform float uAscent;
  uniform float uReduced;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  uniform vec4 uRipple;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
               mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p = p * 2.03 + vec2(13.1, 7.7);
      amplitude *= 0.49;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 ratio = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 centered = (uv - 0.5) * ratio;
    float motion = mix(1.0, 0.12, uReduced);
    float slowTime = uTime * motion;

    float pointerDistance = length(centered - (uPointer - 0.5) * ratio);
    float lens = exp(-pointerDistance * 8.5) * (0.008 + uEnergy * 0.035);
    vec2 lensDirection = normalize(centered - (uPointer - 0.5) * ratio + vec2(0.0001));
    uv += lensDirection * sin(pointerDistance * 44.0 - slowTime * 3.0) * lens;
    uv.x += sin(uv.y * 34.0 + slowTime * 0.85) * (0.002 + (1.0 - uDepth) * 0.005) * motion;

    vec3 blackWater = vec3(0.003, 0.013, 0.026);
    vec3 deepCobalt = vec3(0.012, 0.085, 0.185);
    vec3 ice = vec3(0.39, 0.72, 0.86);
    float vertical = smoothstep(0.0, 1.0, uv.y);
    vec3 color = mix(blackWater, deepCobalt, (0.16 + vertical * 0.28) * (1.0 - uDepth * 0.72));

    float surfacePresence = 1.0 - smoothstep(0.30, 0.49, uDepth);
    float causticA = abs(sin((uv.x + fbm(uv * 3.0) * 0.07) * 18.0 + slowTime * 0.52));
    float causticB = abs(sin((uv.y + noise(uv * 5.0) * 0.04) * 14.0 - slowTime * 0.31));
    float caustics = pow(causticA * causticB, 15.0) * surfacePresence;
    color += ice * caustics * 0.15;

    float horizon = 0.58;
    float xGrid = floor((uv.x + sin(uv.y * 31.0 + slowTime) * 0.004) * 41.0);
    float cityColumn = step(0.69, hash21(vec2(xGrid, 1.73)));
    float buildingHeight = 0.045 + hash21(vec2(xGrid, 4.7)) * 0.19;
    float building = step(horizon, uv.y) * step(uv.y, horizon + buildingHeight) * cityColumn;
    float windowBand = step(0.93, hash21(vec2(xGrid, floor(uv.y * 82.0))));
    float city = building * (0.035 + windowBand * 0.17) * surfacePresence;
    float reflection = step(horizon - buildingHeight * 1.75, uv.y) * step(uv.y, horizon) * cityColumn;
    reflection *= step(0.84, hash21(vec2(xGrid, floor((horizon - uv.y) * 92.0 + slowTime * 0.55))));
    color += mix(deepCobalt, ice, windowBand) * city;
    color += deepCobalt * reflection * 0.085 * surfacePresence;

    float ink = fbm(uv * vec2(3.1, 5.4) + vec2(slowTime * 0.025, -slowTime * 0.018));
    float inkGate = smoothstep(0.35, 0.64, uDepth);
    color *= 1.0 - smoothstep(0.43, 0.78, ink) * inkGate * 0.76;

    float fissureGate = smoothstep(0.48, 0.58, uDepth) * (1.0 - smoothstep(0.72, 0.78, uDepth));
    float fissurePath = abs(uv.x - 0.63 - sin(uv.y * 12.0 + noise(uv * 8.0) * 2.2) * 0.018);
    float fissureSegment = smoothstep(0.18, 0.29, uv.y) * (1.0 - smoothstep(0.70, 0.81, uv.y));
    float fissure = (1.0 - smoothstep(0.0012, 0.0048, fissurePath)) * fissureGate * fissureSegment;
    color = mix(color, vec3(0.20, 0.012, 0.022), fissure * 0.48);

    float coreDistance = length((uv - vec2(0.53, 0.48)) * vec2(1.2, 0.75));
    float coreGate = smoothstep(0.68, 0.78, uDepth);
    float coreLight = exp(-coreDistance * (9.0 - uCoherence * 3.0)) * coreGate;
    color += mix(deepCobalt, ice, uCoherence) * coreLight * (0.08 + uCoherence * 0.26);

    float rippleAge = uTime - uRipple.z;
    float rippleDistance = length((uv - uRipple.xy) * ratio) + (noise(uv * 8.0 + slowTime * 0.08) - 0.5) * 0.014;
    float ring = exp(-abs(rippleDistance - rippleAge * 0.18) * 95.0);
    ring *= smoothstep(1.8, 0.0, rippleAge) * step(0.0, rippleAge) * uRipple.w;
    color += ice * ring * 0.25;
    float entryFlash = exp(-max(rippleAge, 0.0) * 1.65) * step(0.0, rippleAge) * uRipple.w;
    entryFlash *= 1.0 - smoothstep(1.5, 2.3, rippleAge);
    color += ice * entryFlash * (0.035 + vertical * 0.075) * surfacePresence;

    vec3 ascentColor = mix(vec3(0.004, 0.026, 0.049), vec3(0.068, 0.24, 0.34), vertical * vertical);
    float ascentRipples = pow(abs(sin(uv.x * 16.0 + slowTime * 0.24) * sin(uv.y * 11.0 - slowTime * 0.17)), 17.0);
    ascentRipples *= smoothstep(0.52, 0.92, uv.y);
    ascentColor += ice * ascentRipples * 0.065;
    color = mix(color, ascentColor, smoothstep(0.0, 1.0, uAscent));

    float vignette = smoothstep(0.94, 0.24, length(centered * vec2(0.74, 0.9)));
    color *= 0.43 + vignette * 0.68;
    float grain = hash21(gl_FragCoord.xy + floor(uTime * 17.0));
    color += (grain - 0.5) * 0.005 * (1.0 - uReduced);
    gl_FragColor = vec4(color, 1.0);
  }
`

const diverVertexShader = `
  uniform float uTime;
  uniform float uDepth;
  uniform float uEnergy;
  uniform float uReduced;
  uniform float uAscent;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float motion = mix(1.0, 0.1, uReduced);
    p.x += sin(p.y * 4.3 + uTime * 0.42) * (0.018 + uEnergy * 0.025) * motion;
    p.y += sin(p.x * 5.1 - uTime * 0.31) * 0.008 * motion;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const diverFragmentShader = `
  precision highp float;
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uDepth;
  uniform float uEnergy;
  uniform float uReduced;
  uniform float uAscent;
  uniform vec2 uPointer;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    float motion = mix(1.0, 0.12, uReduced);
    vec2 uv = vUv;
    float distanceToPointer = length(uv - uPointer);
    uv.x += sin(uv.y * 28.0 + uTime * 0.85) * (0.002 + uEnergy * 0.018) * motion;
    uv.x += sin(distanceToPointer * 55.0 - uTime * 2.0) * exp(-distanceToPointer * 8.0) * uEnergy * 0.025;
    vec4 sampleColor = texture2D(uMap, uv);
    float luminance = dot(sampleColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    float materialSignal = max(sampleColor.r, max(sampleColor.g, sampleColor.b));
    float surfaceGhost = smoothstep(0.035, 0.12, uDepth) * (1.0 - smoothstep(0.20, 0.29, uDepth)) * 0.26;
    float echoFigure = smoothstep(0.19, 0.31, uDepth) * (1.0 - smoothstep(0.54, 0.68, uDepth));
    float risingFigure = smoothstep(0.02, 0.22, uAscent) * (1.0 - smoothstep(0.78, 1.0, uAscent)) * 0.36;
    float appear = surfaceGhost + echoFigure + risingFigure;
    float dissolve = hash21(floor(uv * vec2(90.0, 130.0)) + floor(uTime * 0.7));
    float fibers = smoothstep(0.002, 0.072, materialSignal) * (0.76 + dissolve * 0.24);
    vec3 liftedTexture = pow(max(sampleColor.rgb, vec3(0.0)), vec3(0.62));
    vec3 color = mix(vec3(0.012, 0.064, 0.112), liftedTexture * vec3(0.72, 0.96, 1.08), 0.78);
    color = mix(color, vec3(0.18, 0.40, 0.53), smoothstep(0.08, 0.42, luminance) * 0.42);
    float alpha = fibers * appear * (0.4 + sqrt(materialSignal) * 0.6);
    gl_FragColor = vec4(color, alpha);
  }
`

const shardVertexShader = `
  attribute float aSeed;
  attribute vec2 aUvCenter;
  varying vec2 vUv;
  varying float vSeed;
  varying vec2 vUvCenter;
  void main() {
    vUv = uv;
    vSeed = aSeed;
    vUvCenter = aUvCenter;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`

const shardFragmentShader = `
  precision highp float;
  uniform sampler2D uMap;
  uniform float uVisibility;
  uniform float uCoherence;
  varying vec2 vUv;
  varying float vSeed;
  varying vec2 vUvCenter;
  void main() {
    vec2 uv = vUv;
    float slopeA = mix(0.18, 0.72, fract(vSeed * 7.13));
    float slopeB = mix(0.28, 0.82, fract(vSeed * 11.71));
    float leftEdge = smoothstep(0.0, 0.035, uv.x - abs(uv.y - 0.5) * slopeA);
    float rightEdge = smoothstep(0.0, 0.035, 1.0 - uv.x - abs(uv.y - 0.5) * slopeB);
    float mask = leftEdge * rightEdge;
    vec2 sampleUv = clamp(vUvCenter + (uv - 0.5) * vec2(0.18, 0.22), 0.001, 0.999);
    vec4 texel = texture2D(uMap, sampleUv);
    float luminance = dot(texel.rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 blue = mix(vec3(0.025, 0.12, 0.19), vec3(0.37, 0.70, 0.82), luminance + uCoherence * 0.18);
    float border = 1.0 - smoothstep(0.035, 0.09, min(uv.x, min(1.0 - uv.x, min(uv.y, 1.0 - uv.y))));
    blue += vec3(0.18, 0.36, 0.44) * border * 0.23;
    gl_FragColor = vec4(blue, mask * uVisibility * (0.31 + luminance * 0.72));
  }
`

function seededRandom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let next = value
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

export function WebGLWorld({ engineRef, onReady, onFailure, onAssetState }: WebGLWorldProps) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let readySent = false
    const mobile = window.matchMedia('(max-width: 700px), (pointer: coarse)').matches
    const initialReduced = engineRef.current.reducedMotion

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !mobile && !initialReduced,
        alpha: false,
        powerPreference: 'high-performance',
      })
    } catch {
      onFailure()
      return
    }

    renderer.setClearColor(0x02070f, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.className = 'world-canvas'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    const telemetryCanvas = renderer.domElement as HTMLCanvasElement & { __blueDiveRenderFrames?: number }
    telemetryCanvas.__blueDiveRenderFrames = 0
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10)
    camera.position.z = 2

    const uniform = <T,>(value: T) => ({ value })
    const backgroundUniforms = {
      uTime: uniform(0),
      uDepth: uniform(0),
      uEnergy: uniform(0),
      uCoherence: uniform(0),
      uAscent: uniform(0),
      uReduced: uniform(initialReduced ? 1 : 0),
      uPointer: uniform(new THREE.Vector2(0.5, 0.5)),
      uResolution: uniform(new THREE.Vector2(1, 1)),
      uRipple: uniform(new THREE.Vector4(0.5, 0.5, -10, 0)),
    }
    const backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: backgroundUniforms,
      vertexShader: backgroundVertexShader,
      fragmentShader: backgroundFragmentShader,
      depthWrite: false,
      depthTest: false,
    })
    const backgroundGeometry = new THREE.PlaneGeometry(2, 2)
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
    background.position.z = -2
    scene.add(background)

    const fallbackTexture = new THREE.DataTexture(new Uint8Array([18, 72, 108, 255]), 1, 1)
    fallbackTexture.colorSpace = THREE.SRGBColorSpace
    fallbackTexture.needsUpdate = true
    let diverTexture: THREE.Texture = fallbackTexture

    const diverUniforms = {
      uMap: uniform<THREE.Texture>(diverTexture),
      uTime: uniform(0),
      uDepth: uniform(0),
      uEnergy: uniform(0),
      uReduced: uniform(initialReduced ? 1 : 0),
      uAscent: uniform(0),
      uPointer: uniform(new THREE.Vector2(0.5, 0.5)),
    }
    const diverMaterial = new THREE.ShaderMaterial({
      uniforms: diverUniforms,
      vertexShader: diverVertexShader,
      fragmentShader: diverFragmentShader,
      transparent: true,
      depthWrite: false,
    })
    const diverGeometry = new THREE.PlaneGeometry(1.28, 1.92, 28, 42)
    const diver = new THREE.Mesh(diverGeometry, diverMaterial)
    diver.position.set(0.24, -0.04, -0.9)
    diver.visible = false
    scene.add(diver)

    const shardCount = mobile ? 13 : 18
    const shardGeometry = new THREE.PlaneGeometry(0.22, 0.38)
    const shardSeeds = new Float32Array(shardCount)
    const shardUvCenters = new Float32Array(shardCount * 2)
    const shardRandom = seededRandom(0x0b1ee)
    for (let i = 0; i < shardCount; i += 1) shardSeeds[i] = shardRandom()
    shardGeometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(shardSeeds, 1))
    shardGeometry.setAttribute('aUvCenter', new THREE.InstancedBufferAttribute(shardUvCenters, 2))
    const shardUniforms = {
      uMap: uniform<THREE.Texture>(diverTexture),
      uVisibility: uniform(0),
      uCoherence: uniform(0),
    }
    const shardMaterial = new THREE.ShaderMaterial({
      uniforms: shardUniforms,
      vertexShader: shardVertexShader,
      fragmentShader: shardFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const shards = new THREE.InstancedMesh(shardGeometry, shardMaterial, shardCount)
    shards.position.z = -0.15
    shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    shards.visible = false
    scene.add(shards)

    const particleCount = mobile || initialReduced ? 82 : 168
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSpeeds = new Float32Array(particleCount)
    const particleRandom = seededRandom(0x31d7c0de)
    for (let i = 0; i < particleCount; i += 1) {
      particlePositions[i * 3] = (particleRandom() - 0.5) * 3.2
      particlePositions[i * 3 + 1] = particleRandom() * 2 - 1
      particlePositions[i * 3 + 2] = -0.72 + particleRandom() * 0.45
      particleSpeeds[i] = 0.00045 + particleRandom() * 0.0012
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x8bc5da,
      size: mobile ? 0.008 : 0.006,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    const loader = new THREE.TextureLoader()
    loader.load(
      '/assets/diver-memory.webp',
      (texture) => {
        if (disposed) {
          texture.dispose()
          return
        }
        texture.colorSpace = THREE.SRGBColorSpace
        texture.wrapS = THREE.MirroredRepeatWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.minFilter = THREE.LinearMipmapLinearFilter
        diverTexture = texture
        diverUniforms.uMap.value = texture
        shardUniforms.uMap.value = texture
        diver.visible = true
        shards.visible = true
        onAssetState(true)
      },
      undefined,
      () => {
        if (!disposed) {
          diver.visible = false
          shards.visible = false
          onAssetState(false)
        }
      },
    )

    let aspect = 1
    let diverBaseScaleX = 1
    let diverBaseScaleY = 1
    const resize = () => {
      const width = Math.max(1, host.clientWidth)
      const height = Math.max(1, host.clientHeight)
      aspect = width / height
      camera.left = -aspect
      camera.right = aspect
      camera.top = 1
      camera.bottom = -1
      camera.updateProjectionMatrix()
      background.scale.set(aspect, 1, 1)
      const reduced = engineRef.current.reducedMotion
      const dprCap = mobile ? 1.25 : reduced ? 1 : 1.65
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
      renderer.setSize(width, height, false)
      backgroundUniforms.uResolution.value.set(width, height)
      diverBaseScaleX = mobile ? 0.82 : Math.min(1.12, aspect * 0.72)
      diverBaseScaleY = mobile ? 0.86 : 1.03
      diver.scale.set(diverBaseScaleX, diverBaseScaleY, 1)
      diver.position.x = mobile ? 0.08 : Math.min(0.38, aspect * 0.18)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)

    const scatter: THREE.Vector3[] = []
    const targets: THREE.Vector3[] = []
    const shardBaseRotation: number[] = []
    const shardScale: number[] = []
    for (let i = 0; i < shardCount; i += 1) {
      const seed = shardSeeds[i]
      scatter.push(
        new THREE.Vector3(
          (shardRandom() - 0.5) * aspect * 1.72,
          (shardRandom() - 0.5) * 1.64,
          shardRandom() * 0.24,
        ),
      )
      const normalized = i / (shardCount - 1)
      const y = 0.58 - normalized * 1.13
      const bodyWidth = 0.12 + Math.sin(normalized * 3.14159265) * 0.34
      const x = (seed - 0.5) * bodyWidth + Math.sin(i * 1.73) * 0.045
      targets.push(new THREE.Vector3(x, y, 0))
      shardUvCenters[i * 2] = THREE.MathUtils.clamp(0.5 + x * 0.64, 0.08, 0.92)
      shardUvCenters[i * 2 + 1] = THREE.MathUtils.clamp(0.52 + y * 0.42, 0.08, 0.92)
      shardBaseRotation.push((shardRandom() - 0.5) * 4.4)
      shardScale.push(0.55 + shardRandom() * 0.68)
    }

    const dummy = new THREE.Object3D()
    const clock = new THREE.Clock()
    let scheduleMark = 0
    let previousRender = 0
    let previousReduced = initialReduced
    let lastRippleStart = -1

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      if (!disposed) onFailure()
    }
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost)

    renderer.setAnimationLoop(() => {
      if (disposed || document.visibilityState === 'hidden') return
      const elapsed = clock.getElapsedTime()
      const state = engineRef.current
      const fps = state.stage === 'record' ? 18 : state.reducedMotion ? 24 : mobile ? 30 : 60
      const sinceSchedule = elapsed - scheduleMark
      const interval = 1 / fps
      if (sinceSchedule < interval) return
      scheduleMark = elapsed - (sinceSchedule % interval)
      const delta = previousRender === 0
        ? 1 / fps
        : Math.min(0.05, Math.max(0.001, elapsed - previousRender))
      previousRender = elapsed

      if (state.reducedMotion !== previousReduced) {
        previousReduced = state.reducedMotion
        particleGeometry.setDrawRange(0, state.reducedMotion ? Math.min(82, particleCount) : particleCount)
        resize()
      }

      backgroundUniforms.uTime.value = elapsed
      backgroundUniforms.uDepth.value = state.depth
      backgroundUniforms.uEnergy.value = state.energy
      backgroundUniforms.uCoherence.value = state.coherence
      backgroundUniforms.uAscent.value = state.ascent
      backgroundUniforms.uReduced.value = state.reducedMotion ? 1 : 0
      backgroundUniforms.uPointer.value.set(state.pointer.x, 1 - state.pointer.y)
      if (state.ripple.startedAt !== lastRippleStart) {
        lastRippleStart = state.ripple.startedAt
        backgroundUniforms.uRipple.value.set(
          state.ripple.x,
          1 - state.ripple.y,
          elapsed,
          state.ripple.strength,
        )
      }

      diverUniforms.uTime.value = elapsed
      diverUniforms.uDepth.value = state.depth
      diverUniforms.uEnergy.value = state.energy
      diverUniforms.uReduced.value = state.reducedMotion ? 1 : 0
      diverUniforms.uAscent.value = state.ascent
      diverUniforms.uPointer.value.set(state.pointer.x, 1 - state.pointer.y)
      diver.rotation.z = Math.sin(elapsed * 0.18) * 0.012 * (state.reducedMotion ? 0.1 : 1)
      const figureGrowth = THREE.MathUtils.smoothstep(state.depth, 0.08, 0.34)
      const figureScale = state.ascent > 0
        ? 1 - state.ascent * 0.58
        : 0.42 + figureGrowth * 0.58
      diver.scale.set(diverBaseScaleX * figureScale, diverBaseScaleY * figureScale, 1)
      diver.position.y = -0.04 + state.ascent * 0.48
      diver.position.x = (mobile ? 0.08 : Math.min(0.38, aspect * 0.18)) + state.ascent * 0.12

      const coreVisibility = THREE.MathUtils.smoothstep(state.depth, 0.67, 0.79) * (1 - state.ascent)
      shardUniforms.uVisibility.value = coreVisibility
      shardUniforms.uCoherence.value = state.coherence
      const easedCoherence = state.coherence * state.coherence * (3 - 2 * state.coherence)
      for (let i = 0; i < shardCount && coreVisibility > 0.002; i += 1) {
        const from = scatter[i]
        const to = targets[i]
        dummy.position.lerpVectors(from, to, easedCoherence)
        if (!state.reducedMotion) {
          dummy.position.x += Math.sin(elapsed * (0.25 + shardSeeds[i] * 0.4) + i) * 0.016 * (1 - easedCoherence)
          dummy.position.y += Math.cos(elapsed * 0.22 + i * 0.7) * 0.012 * (1 - easedCoherence)
        }
        dummy.rotation.set(
          (1 - easedCoherence) * Math.sin(elapsed * 0.2 + i) * 0.5,
          (1 - easedCoherence) * Math.cos(elapsed * 0.24 + i) * 0.55,
          shardBaseRotation[i] * (1 - easedCoherence) + Math.sin(i * 1.3) * 0.12 * easedCoherence,
        )
        const pressureScale = shardScale[i] * (0.74 + state.coreWake * 0.24)
        dummy.scale.setScalar(pressureScale)
        dummy.updateMatrix()
        shards.setMatrixAt(i, dummy.matrix)
      }
      if (coreVisibility > 0.002) shards.instanceMatrix.needsUpdate = true

      const particleAttribute = particleGeometry.getAttribute('position') as THREE.BufferAttribute
      const positions = particleAttribute.array as Float32Array
      const pointerX = (state.pointer.x - 0.5) * aspect * 2
      const pointerY = (0.5 - state.pointer.y) * 2
      for (let i = 0; i < particleCount; i += 1) {
        const index = i * 3
        const x = positions[index]
        const y = positions[index + 1]
        const dx = x - pointerX
        const dy = y - pointerY
        const distanceSquared = dx * dx + dy * dy + 0.012
        const disturbance = Math.min(0.004, state.energy * 0.0005 / distanceSquared)
        positions[index] += dx * disturbance * (state.reducedMotion ? 0.15 : 1)
        positions[index + 1] += particleSpeeds[i] * (1 + state.depth * 1.8) * (state.reducedMotion ? 0.2 : 1)
        if (positions[index + 1] > 1.05) {
          positions[index + 1] = -1.05
          positions[index] = (particleRandom() - 0.5) * aspect * 2.1
        }
        if (Math.abs(positions[index]) > aspect * 1.25) positions[index] *= -0.82
      }
      particleAttribute.needsUpdate = true
      particleMaterial.opacity = 0.12 + (1 - state.depth) * 0.15 + Math.min(state.energy * 0.08, 0.08)

      renderer.render(scene, camera)
      telemetryCanvas.__blueDiveRenderFrames = (telemetryCanvas.__blueDiveRenderFrames ?? 0) + 1
      if (!readySent) {
        readySent = true
        onReady()
      }
    })

    return () => {
      disposed = true
      delete telemetryCanvas.__blueDiveRenderFrames
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost)
      scene.remove(background, diver, shards, particles)
      backgroundGeometry.dispose()
      backgroundMaterial.dispose()
      diverGeometry.dispose()
      diverMaterial.dispose()
      shardGeometry.dispose()
      shardMaterial.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      if (diverTexture !== fallbackTexture) diverTexture.dispose()
      fallbackTexture.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement)
    }
  }, [engineRef, onAssetState, onFailure, onReady])

  return <div className="world-host" ref={hostRef} />
}
