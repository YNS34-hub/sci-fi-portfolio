import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type FossilSceneProps = {
  stage: number;
  reducedMotion: boolean;
  onDragVelocity: (velocity: number) => void;
};

function buildMembraneGeometry() {
  const segments = 64;
  const rings = 22;
  const vertices: number[] = [0, 0, 0.48];
  const uvs: number[] = [0.5, 0.5];
  const indices: number[] = [];

  for (let ring = 1; ring <= rings; ring += 1) {
    const radius = ring / rings;
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const boundary =
        1 +
        Math.sin(angle * 3.1 + ring * 0.44) * 0.055 +
        Math.sin(angle * 7.3 - ring * 0.21) * 0.026;
      const radial = radius * boundary;
      const x = Math.cos(angle) * 3.05 * radial;
      const y = Math.sin(angle) * 2.08 * radial;
      const basin =
        -0.2 *
        Math.exp(
          -(
            (Math.cos(angle) * radial + 0.12) ** 2 * 3.8 +
            (Math.sin(angle) * radial - 0.05) ** 2 * 5.2
          ),
        );
      const strata =
        Math.sin(angle * 5.2 + radius * 12.5) * 0.12 * (1 - radius * 0.62) +
        Math.sin(angle * 11.4 - radius * 7.2) * 0.035;
      const z = 0.5 * (1 - radius ** 1.55) + strata + basin - radius * 0.035;
      vertices.push(x, y, z);
      uvs.push(0.5 + Math.cos(angle) * radius * 0.5, 0.5 + Math.sin(angle) * radius * 0.5);
    }
  }

  for (let segment = 0; segment < segments; segment += 1) {
    indices.push(0, 1 + segment, 1 + ((segment + 1) % segments));
  }
  for (let ring = 2; ring <= rings; ring += 1) {
    const previous = 1 + (ring - 2) * segments;
    const current = 1 + (ring - 1) * segments;
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      indices.push(
        previous + segment,
        current + segment,
        current + next,
        previous + segment,
        current + next,
        previous + next,
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  const mineralDark = new THREE.Color(0x223b34);
  const mineralMid = new THREE.Color(0x667368);
  const mineralPale = new THREE.Color(0xb6ad93);
  const colors: number[] = [];
  for (let index = 0; index < vertices.length; index += 3) {
    const x = vertices[index];
    const y = vertices[index + 1];
    const radius = Math.hypot(x / 3.05, y / 2.08);
    const band =
      0.5 +
      0.5 *
        Math.sin(radius * 18.5 + Math.atan2(y, x) * 2.7 + Math.sin(x * 2.2) * 0.9);
    const weather = 0.5 + 0.5 * Math.sin(x * 3.4 - y * 2.1 + radius * 9.2);
    const color = mineralDark.clone().lerp(mineralMid, 0.34 + band * 0.5);
    color.lerp(mineralPale, Math.max(0, weather - 0.62) * 0.78);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createMineralSurfaceTexture() {
  const surface = document.createElement("canvas");
  surface.width = 512;
  surface.height = 512;
  const context = surface.getContext("2d");
  if (!context) return null;
  const image = context.createImageData(surface.width, surface.height);
  for (let y = 0; y < surface.height; y += 1) {
    for (let x = 0; x < surface.width; x += 1) {
      const noise =
        Math.sin(x * 0.075 + Math.sin(y * 0.021) * 3.4) * 0.34 +
        Math.sin(y * 0.11 + x * 0.014) * 0.23 +
        Math.sin((x + y) * 0.18) * 0.12;
      const value = Math.round(136 + noise * 58);
      const offset = (y * surface.width + x) * 4;
      image.data[offset] = value;
      image.data[offset + 1] = value;
      image.data[offset + 2] = value;
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  context.globalAlpha = 0.24;
  context.strokeStyle = "#f4f4f4";
  context.lineWidth = 2;
  for (let vein = 0; vein < 19; vein += 1) {
    const startY = (vein * 83) % 512;
    context.beginPath();
    context.moveTo(-20, startY);
    context.bezierCurveTo(
      110,
      startY - 70 + (vein % 4) * 26,
      330,
      startY + 90 - (vein % 5) * 31,
      540,
      startY - 35,
    );
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(surface);
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.repeat.set(1.8, 1.8);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

function createBranch(points: [number, number, number][], radius: number) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  return new THREE.TubeGeometry(curve, 48, radius, 8, false);
}

function ease(value: number) {
  return 1 - (1 - value) ** 4;
}

export function FossilScene({ stage, reducedMotion, onDragVelocity }: FossilSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(stage);
  const velocityCallbackRef = useRef(onDragVelocity);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    velocityCallbackRef.current = onDragVelocity;
  }, [onDragVelocity]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const mountElement: HTMLDivElement = mount;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05090b);
    const sceneFog = new THREE.FogExp2(0x071012, 0.07);
    scene.fog = sceneFog;

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.8, 13);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.34;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    mountElement.appendChild(renderer.domElement);

    const mineralTexture = createMineralSurfaceTexture();
    if (mineralTexture) {
      mineralTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }
    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTarget = environmentGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentTarget.texture;

    const fossil = new THREE.Group();
    fossil.rotation.set(-0.16, -0.45, 0.1);
    scene.add(fossil);

    const membraneGeometry = buildMembraneGeometry();
    const membraneMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      bumpMap: mineralTexture,
      bumpScale: 0.16,
      roughnessMap: mineralTexture,
      roughness: 0.76,
      metalness: 0.02,
      transmission: 0,
      side: THREE.DoubleSide,
      emissive: 0x071713,
      emissiveIntensity: 0.1,
      clearcoat: 0.08,
      clearcoatRoughness: 0.76,
      sheen: 0.16,
      sheenColor: new THREE.Color(0xb9c6af),
      iridescence: 0.035,
      iridescenceIOR: 1.35,
      envMapIntensity: 0.5,
    });
    const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial);
    fossil.add(membrane);

    const branchMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x263d36,
      roughness: 0.74,
      metalness: 0.02,
      clearcoat: 0.06,
      clearcoatRoughness: 0.78,
      emissive: 0x102c27,
      emissiveIntensity: 0.22,
      envMapIntensity: 0.45,
    });
    const rimMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xb9b5a7,
      roughness: 0.64,
      metalness: 0.015,
      bumpMap: mineralTexture,
      bumpScale: 0.05,
      emissive: 0x242c28,
      emissiveIntensity: 0.18,
      envMapIntensity: 0.62,
    });
    const seamMaterial = new THREE.MeshStandardMaterial({
      color: 0x78ffe1,
      emissive: 0x78ffe1,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.85,
    });

    const branchDefinitions: [number, number, number][][] = [
      [
        [-2.85, -1.25, 0.12],
        [-1.2, -2.25, 0.08],
        [1.55, -1.45, 0.02],
        [2.85, -0.25, 0.12],
      ],
      [
        [2.85, -0.25, 0.12],
        [1.82, 1.58, 0.02],
        [0.1, 1.95, 0.08],
        [-1.95, 1.48, 0.04],
        [-2.85, -1.25, 0.12],
      ],
      [
        [-2.85, -1.25, 0.16],
        [-1.8, 0.28, 0.36],
        [0.35, 0.55, 0.42],
        [2.85, -0.25, 0.18],
      ],
      [
        [-1.2, -2.25, 0.08],
        [0.1, -1.1, 0.46],
        [0.35, 0.55, 0.44],
        [0.1, 1.95, 0.08],
      ],
      [
        [-1.95, 1.48, 0.08],
        [-1.8, 0.28, 0.34],
        [0.1, -1.1, 0.48],
        [1.55, -1.45, 0.06],
      ],
      [
        [1.82, 1.58, 0.05],
        [0.35, 0.55, 0.45],
        [0.1, -1.1, 0.44],
        [-1.2, -2.25, 0.05],
      ],
      [
        [-1.95, 1.48, 0.04],
        [0.35, 0.55, 0.4],
        [1.55, -1.45, 0.05],
      ],
      [
        [0.1, 1.95, 0.05],
        [0.35, 0.55, 0.44],
        [-2.85, -1.25, 0.08],
      ],
    ];

    const branchGeometries = branchDefinitions.map((definition, index) =>
      createBranch(definition, index < 2 ? 0.09 : 0.052),
    );
    branchGeometries.forEach((geometry, index) => {
      const branch = new THREE.Mesh(geometry, index < 2 ? rimMaterial : branchMaterial);
      fossil.add(branch);
    });

    const seamGeometries = [
      createBranch(
        [
          [-2.1, -0.75, 0.48],
          [-0.8, -0.15, 0.52],
          [0.2, 0.1, 0.55],
          [2.15, -0.2, 0.48],
        ],
        0.025,
      ),
      createBranch(
        [
          [-1.7, 1.1, 0.46],
          [-0.15, 0.55, 0.55],
          [0.65, 0.2, 0.51],
          [1.62, 1.18, 0.44],
        ],
        0.018,
      ),
    ];
    seamGeometries.forEach((geometry) => {
      fossil.add(new THREE.Mesh(geometry, seamMaterial));
    });

    const cavern = new THREE.Group();
    scene.add(cavern);
    const cavernMaterial = new THREE.MeshStandardMaterial({
      color: 0x18302d,
      roughness: 0.82,
      metalness: 0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.46,
    });
    const cavernGeometries: THREE.BufferGeometry[] = [];
    for (let ring = 0; ring < 9; ring += 1) {
      const radiusX = 4.9 + ring * 0.42;
      const radiusY = 3.15 + ring * 0.28;
      const points: THREE.Vector3[] = [];
      for (let segment = 0; segment <= 48; segment += 1) {
        const angle = -Math.PI * 0.82 + (segment / 48) * Math.PI * 1.64;
        const wobble = Math.sin(angle * 5 + ring * 1.7) * 0.18;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * (radiusX + wobble),
            Math.sin(angle) * (radiusY + wobble * 0.7),
            -4.5 - ring * 1.35,
          ),
        );
      }
      const curve = new THREE.CatmullRomCurve3(points, false);
      const geometry = new THREE.TubeGeometry(curve, 96, 0.042 + ring * 0.009, 6, false);
      cavernGeometries.push(geometry);
      cavern.add(new THREE.Mesh(geometry, cavernMaterial));
    }

    const particleCount = 950;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const angle = index * 2.399963;
      const radius = 1.5 + ((index * 37) % 100) / 18;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = Math.sin(angle) * radius * 0.64;
      particlePositions[index * 3 + 2] = -((index * 17) % 130) / 9 + 2;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x78ffe1,
      size: 0.026,
      transparent: true,
      opacity: 0.58,
      sizeAttenuation: true,
    });
    const spores = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(spores);

    scene.add(new THREE.HemisphereLight(0xcbd4c9, 0x020506, 1.18));
    const probe = new THREE.PointLight(0x78ffe1, 18, 12, 1.45);
    probe.position.set(-1.2, 0.4, 4);
    scene.add(probe);
    const boneLight = new THREE.DirectionalLight(0xf0e6d2, 4.2);
    boneLight.position.set(-4, 3, 6);
    scene.add(boneLight);
    const mineralRimLight = new THREE.DirectionalLight(0x6fffe0, 3.2);
    mineralRimLight.position.set(5, -2, -2);
    scene.add(mineralRimLight);
    const grazingLight = new THREE.SpotLight(0xf4d9aa, 62, 24, 0.48, 0.72, 1.25);
    grazingLight.position.set(-5.8, 3.6, 8.5);
    grazingLight.target = fossil;
    scene.add(grazingLight);
    const sulfurLight = new THREE.PointLight(0xdfef4a, 3.4, 8, 2);
    sulfurLight.position.set(2.7, -2.2, -5.5);
    scene.add(sulfurLight);

    const probeVolumeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x78ffe1) },
        uOpacity: { value: 0.22 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float vertical = smoothstep(0.0, 0.24, vUv.y) * (1.0 - smoothstep(0.62, 1.0, vUv.y));
          float ribs = 0.78 + 0.22 * sin(vUv.y * 72.0);
          gl_FragColor = vec4(uColor, vertical * ribs * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const probeVolumeGeometry = new THREE.ConeGeometry(1.35, 5.6, 48, 1, true);
    const probeVolume = new THREE.Mesh(probeVolumeGeometry, probeVolumeMaterial);
    probeVolume.rotation.x = Math.PI / 2;
    probeVolume.position.set(0, 0, 2.7);
    scene.add(probeVolume);

    const probePointGeometry = new THREE.SphereGeometry(0.075, 20, 20);
    const probePointMaterial = new THREE.MeshBasicMaterial({
      color: 0x78ffe1,
      toneMapped: false,
    });
    const probePoint = new THREE.Mesh(probePointGeometry, probePointMaterial);
    probePoint.position.set(0, 0, 0.9);
    scene.add(probePoint);

    const pointer = { x: 0, y: 0 };
    const targetRotation = { x: fossil.rotation.x, y: fossil.rotation.y };
    let dragStart: { x: number; y: number; rx: number; ry: number } | null = null;
    let dragVelocity = 0;
    let pointerEnergy = 0;

    function pointerDown(event: PointerEvent) {
      if (stageRef.current !== 2 || reducedMotion) return;
      dragStart = {
        x: event.clientX,
        y: event.clientY,
        rx: targetRotation.x,
        ry: targetRotation.y,
      };
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    function pointerMove(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      pointerEnergy = 1;
      mountElement.dataset.probing = "true";
      if (!dragStart) return;
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      targetRotation.y = dragStart.ry + dx * 0.006;
      targetRotation.x = THREE.MathUtils.clamp(dragStart.rx + dy * 0.004, -0.8, 0.65);
      dragVelocity = Math.min(1, Math.hypot(dx, dy) / 220);
      velocityCallbackRef.current(dragVelocity);
    }

    function pointerUp(event: PointerEvent) {
      dragStart = null;
      velocityCallbackRef.current(0);
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    }

    function pointerLeave() {
      mountElement.dataset.probing = "false";
      pointerEnergy = 0;
    }

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    renderer.domElement.addEventListener("pointerleave", pointerLeave);

    const cameraStates = [
      { x: -0.55, y: 1.25, z: 12.8, fog: 0.078, scale: 0.86 },
      { x: 0.2, y: 0.2, z: 9.4, fog: 0.06, scale: 1.08 },
      { x: 0.8, y: -0.1, z: 6.8, fog: 0.038, scale: 1.34 },
    ];
    let stageValue = stageRef.current;
    let frame = 0;
    const startedAt = performance.now();

    function resize() {
      const width = mountElement.clientWidth;
      const height = mountElement.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    }

    function render() {
      const elapsed = (performance.now() - startedAt) / 1000;
      stageValue += (stageRef.current - stageValue) * (reducedMotion ? 1 : 0.035);
      const lower = Math.floor(stageValue);
      const upper = Math.min(2, lower + 1);
      const t = ease(stageValue - lower);
      const from = cameraStates[Math.min(2, lower)];
      const to = cameraStates[upper];
      camera.position.x = THREE.MathUtils.lerp(from.x, to.x, t);
      camera.position.y = THREE.MathUtils.lerp(from.y, to.y, t);
      camera.position.z = THREE.MathUtils.lerp(from.z, to.z, t);
      sceneFog.density = THREE.MathUtils.lerp(from.fog, to.fog, t);
      const scale = THREE.MathUtils.lerp(from.scale, to.scale, t);
      fossil.scale.setScalar(scale);
      fossil.position.y = THREE.MathUtils.lerp(1.4, -0.1, stageValue / 2);
      fossil.rotation.x += (targetRotation.x - fossil.rotation.x) * 0.065;
      fossil.rotation.y += (targetRotation.y - fossil.rotation.y) * 0.065;
      fossil.rotation.z = 0.08 + Math.sin(elapsed * 0.32) * 0.018;
      if (!dragStart && stageRef.current === 2 && !reducedMotion) {
        targetRotation.y += 0.00045;
      }
      dragVelocity *= 0.94;
      pointerEnergy *= 0.975;
      seamMaterial.opacity = 0.44 + stageValue * 0.2 + dragVelocity * 0.3;
      membraneMaterial.emissiveIntensity = 0.08 + stageValue * 0.06 + dragVelocity * 0.2;
      membraneMaterial.iridescence = 0.03 + stageValue * 0.018 + dragVelocity * 0.1;
      branchMaterial.emissiveIntensity = 0.18 + stageValue * 0.14 + dragVelocity * 0.36;
      rimMaterial.emissiveIntensity = 0.14 + stageValue * 0.08 + dragVelocity * 0.22;
      probe.position.x += (pointer.x * 3.4 - probe.position.x) * 0.08;
      probe.position.y += (pointer.y * 2.25 - probe.position.y) * 0.08;
      probe.intensity = 13 + pointerEnergy * 15 + stageValue * 3;
      probeVolume.position.x += (pointer.x * 3.4 - probeVolume.position.x) * 0.08;
      probeVolume.position.y += (pointer.y * 2.25 - probeVolume.position.y) * 0.08;
      probePoint.position.x += (pointer.x * 3.4 - probePoint.position.x) * 0.1;
      probePoint.position.y += (pointer.y * 2.25 - probePoint.position.y) * 0.1;
      probeVolumeMaterial.uniforms.uOpacity.value =
        0.08 + pointerEnergy * 0.22 + stageValue * 0.035;
      sulfurLight.intensity = 2.2 + stageValue * 2.8;
      boneLight.intensity = 4.2 - stageValue * 0.55;
      grazingLight.intensity = 62 + dragVelocity * 34 - stageValue * 6;
      spores.rotation.z = elapsed * 0.006;
      spores.position.y = Math.sin(elapsed * 0.18) * 0.08;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mountElement);
    resize();
    render();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.domElement.removeEventListener("pointerleave", pointerLeave);
      membraneGeometry.dispose();
      branchGeometries.forEach((geometry) => geometry.dispose());
      seamGeometries.forEach((geometry) => geometry.dispose());
      cavernGeometries.forEach((geometry) => geometry.dispose());
      particleGeometry.dispose();
      probeVolumeGeometry.dispose();
      probePointGeometry.dispose();
      [membraneMaterial, branchMaterial, rimMaterial, seamMaterial, cavernMaterial, particleMaterial].forEach(
        (material) => material.dispose(),
      );
      probeVolumeMaterial.dispose();
      probePointMaterial.dispose();
      mineralTexture?.dispose();
      environmentTarget.dispose();
      environmentGenerator.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reducedMotion]);

  return <div className="fossil-scene" ref={mountRef} aria-hidden="true" />;
}
