import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type MeridianSceneProps = {
  progress: number;
  reducedMotion: boolean;
};

function petalGeometry(width: number, height: number, depth: number, notch = 0) {
  const shape = new THREE.Shape();
  shape.moveTo(-width * 0.48, -height * 0.42);
  shape.bezierCurveTo(-width * 0.18, -height * 0.58, width * 0.22, -height * 0.38, width * 0.44, -height * 0.05);
  shape.bezierCurveTo(width * 0.18, height * 0.26, width * 0.08, height * 0.48, -width * 0.4, height * 0.43);
  shape.bezierCurveTo(-width * 0.18, height * 0.08, -width * 0.24, -height * 0.05, -width * 0.48, -height * 0.42);
  if (notch > 0) {
    const hole = new THREE.Path();
    hole.absellipse(-width * 0.1, 0, notch, notch * 1.45, 0, Math.PI * 2, false, 0);
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 9,
    bevelSize: Math.min(0.08, depth * 0.35),
    bevelThickness: Math.min(0.08, depth * 0.35),
    curveSegments: 72,
  });
  geometry.center();
  return geometry;
}

function arcFrameGeometry() {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 1.55, 1.2, 0, Math.PI * 2, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(0.12, 0, 1.02, 0.74, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelSegments: 9,
    bevelSize: 0.06,
    bevelThickness: 0.05,
    curveSegments: 96,
  });
  geometry.center();
  return geometry;
}

function coreGeometry() {
  const profile = [
    new THREE.Vector2(0.28, -0.5),
    new THREE.Vector2(0.45, -0.38),
    new THREE.Vector2(0.36, -0.1),
    new THREE.Vector2(0.58, 0),
    new THREE.Vector2(0.36, 0.14),
    new THREE.Vector2(0.46, 0.42),
    new THREE.Vector2(0.25, 0.56),
  ];
  const geometry = new THREE.LatheGeometry(profile, 96);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

function easeOutExpo(value: number) {
  return value >= 1 ? 1 : 1 - 2 ** (-10 * value);
}

function brushedRoughnessTexture() {
  const surface = document.createElement("canvas");
  surface.width = 512;
  surface.height = 512;
  const context = surface.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#8d8d8d";
  context.fillRect(0, 0, surface.width, surface.height);
  for (let index = 0; index < 1300; index += 1) {
    const y = (index * 73) % surface.height;
    const x = (index * 151) % surface.width;
    const length = 24 + ((index * 47) % 180);
    const value = 92 + ((index * 31) % 92);
    context.fillStyle = `rgb(${value}, ${value}, ${value})`;
    context.fillRect(x, y, length, index % 9 === 0 ? 2 : 1);
  }
  const texture = new THREE.CanvasTexture(surface);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 6.5);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

export function MeridianScene({ progress, reducedMotion }: MeridianSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = reducedMotion ? 1 : progress;
  }, [progress, reducedMotion]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const mountElement: HTMLDivElement = mount;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0d0c);
    scene.fog = new THREE.FogExp2(0x0c0d0c, 0.045);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.set(0.4, 0.25, 12.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.48;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountElement.appendChild(renderer.domElement);

    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmrem.fromScene(room, 0.045).texture;
    scene.environment = environmentTexture;
    room.dispose();
    pmrem.dispose();

    const brushedTexture = brushedRoughnessTexture();
    if (brushedTexture) {
      brushedTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }

    const metal = new THREE.MeshPhysicalMaterial({
      color: 0xc9c7c1,
      metalness: 1,
      roughness: 0.34,
      roughnessMap: brushedTexture,
      clearcoat: 0.12,
      clearcoatRoughness: 0.24,
      envMapIntensity: 1.35,
    });
    const darkMetal = new THREE.MeshPhysicalMaterial({
      color: 0x292a28,
      metalness: 1,
      roughness: 0.28,
      roughnessMap: brushedTexture,
      clearcoat: 0.18,
      envMapIntensity: 1.25,
    });
    const quartz = new THREE.MeshPhysicalMaterial({
      color: 0x77746f,
      metalness: 0.05,
      roughness: 0.18,
      transmission: 0.82,
      transparent: true,
      opacity: 0.94,
      thickness: 1.15,
      ior: 1.62,
      attenuationColor: new THREE.Color(0x6d675f),
      attenuationDistance: 2.8,
      envMapIntensity: 1.5,
    });
    const verified = new THREE.MeshPhysicalMaterial({
      color: 0xc84731,
      metalness: 0.84,
      roughness: 0.3,
      roughnessMap: brushedTexture,
      emissive: 0x4a0702,
      emissiveIntensity: 0.1,
      envMapIntensity: 1.3,
    });

    const instrument = new THREE.Group();
    instrument.rotation.x = -0.16;
    scene.add(instrument);

    const geometries: THREE.BufferGeometry[] = [
      arcFrameGeometry(),
      petalGeometry(2.5, 3.2, 0.25, 0.34),
      coreGeometry(),
      petalGeometry(2.1, 2.7, 0.18, 0.24),
      petalGeometry(1.55, 2.2, 0.2, 0),
      arcFrameGeometry(),
    ];

    const starts = [
      new THREE.Vector3(-3.8, -0.78, -0.55),
      new THREE.Vector3(-2.35, 0.95, 0.15),
      new THREE.Vector3(-0.88, -0.92, 0.65),
      new THREE.Vector3(0.92, 0.9, -0.25),
      new THREE.Vector3(2.35, -0.72, 0.28),
      new THREE.Vector3(3.82, 0.62, -0.45),
    ];
    const ends = [
      new THREE.Vector3(-0.08, 0, -0.55),
      new THREE.Vector3(-0.32, 0.04, -0.2),
      new THREE.Vector3(0.08, 0, 0),
      new THREE.Vector3(0.28, -0.04, 0.18),
      new THREE.Vector3(0.2, 0.02, 0.42),
      new THREE.Vector3(0.06, 0, 0.68),
    ];
    const materials = [darkMetal, metal, verified, quartz, metal, darkMetal];
    const rotations = [-0.12, 0.8, 0, -0.9, 1.25, 0.25];

    const parts = geometries.map((geometry, index) => {
      const mesh = new THREE.Mesh(geometry, materials[index]);
      mesh.position.copy(starts[index]);
      mesh.rotation.z = rotations[index];
      if (index === 1 || index === 3 || index === 4) {
        mesh.rotation.y = Math.PI / 2;
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      instrument.add(mesh);
      return mesh;
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8e6d3f,
      transparent: true,
      opacity: 0.42,
    });
    const linePoints = [new THREE.Vector3(-6.2, 0, -0.2), new THREE.Vector3(6.2, 0, -0.2)];
    const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePoints), lineMaterial);
    scene.add(axis);

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xd44931,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    const seatHalo = new THREE.Mesh(new THREE.TorusGeometry(2.18, 0.016, 8, 160), haloMaterial);
    seatHalo.position.set(0.04, 0, -1.25);
    scene.add(seatHalo);

    const ambient = new THREE.HemisphereLight(0xdde3e1, 0x11100e, 0.46);
    scene.add(ambient);

    const key = new THREE.RectAreaLight(0xf6f2e8, 18, 5.5, 8);
    key.position.set(-4.5, 5.8, 6.5);
    key.lookAt(0, 0, 0);
    scene.add(key);

    const rim = new THREE.RectAreaLight(0x9fb7c1, 13, 4, 5);
    rim.position.set(5.5, -1.5, 5.2);
    rim.lookAt(0, 0, 0);
    scene.add(rim);

    const verificationLight = new THREE.PointLight(0xd44931, 0, 8, 1.8);
    verificationLight.position.set(0.15, -0.08, 2.4);
    scene.add(verificationLight);

    const inspectionLight = new THREE.PointLight(0xf4ecdc, 0, 7, 1.6);
    inspectionLight.position.set(0, 0, 4.5);
    scene.add(inspectionLight);

    const targetRotation = { x: -0.16, y: -0.25 };
    let dragStart: { x: number; y: number } | null = null;
    let dragRotation = { x: targetRotation.x, y: targetRotation.y };
    let inspectionEnergy = 0;

    function pointerDown(event: PointerEvent) {
      dragStart = { x: event.clientX, y: event.clientY };
      dragRotation = { x: targetRotation.x, y: targetRotation.y };
      mountElement.dataset.inspecting = "true";
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    function pointerMove(event: PointerEvent) {
      if (dragStart) {
        targetRotation.y = dragRotation.y + (event.clientX - dragStart.x) * 0.006;
        targetRotation.x = THREE.MathUtils.clamp(
          dragRotation.x + (event.clientY - dragStart.y) * 0.004,
          -0.7,
          0.45,
        );
      } else if (!reducedMotion) {
        const rect = renderer.domElement.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
        const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
        targetRotation.y = -0.25 + normalizedX * 0.22;
        targetRotation.x = -0.16 + normalizedY * 0.12;
        inspectionLight.position.x = normalizedX * 7;
        inspectionLight.position.y = -normalizedY * 5;
      }
    }

    function pointerUp(event: PointerEvent) {
      dragStart = null;
      mountElement.dataset.inspecting = "false";
      renderer.domElement.releasePointerCapture(event.pointerId);
    }

    function pointerLeave() {
      if (!dragStart) mountElement.dataset.inspecting = "false";
    }

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    renderer.domElement.addEventListener("pointerleave", pointerLeave);

    const startedAt = performance.now();
    let frame = 0;

    function resize() {
      const width = mountElement.clientWidth;
      const height = mountElement.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    }

    function render() {
      const elapsed = (performance.now() - startedAt) / 1000;
      const current = progressRef.current;
      parts.forEach((part, index) => {
        const local = THREE.MathUtils.clamp(current * 1.35 - index * 0.07, 0, 1);
        const eased = easeOutExpo(local);
        part.position.lerpVectors(starts[index], ends[index], eased);
        part.rotation.x += (Math.sin(elapsed * 0.35 + index) * 0.03 * (1 - eased) - part.rotation.x * 0.02) * 0.04;
      });
      instrument.rotation.x += (targetRotation.x - instrument.rotation.x) * 0.065;
      instrument.rotation.y += (targetRotation.y - instrument.rotation.y) * 0.065;
      instrument.position.y = Math.sin(elapsed * 0.45) * 0.035 * (1 - current);
      camera.position.z = 12.5 - current * 1.2;
      const seatEnergy = THREE.MathUtils.smoothstep(current, 0.72, 1);
      haloMaterial.opacity = 0.06 + seatEnergy * 0.5;
      seatHalo.scale.setScalar(1.08 - seatEnergy * 0.08);
      verificationLight.intensity = seatEnergy * 24;
      lineMaterial.opacity = 0.18 + (1 - seatEnergy) * 0.32;
      inspectionEnergy += ((dragStart ? 1 : 0.18) - inspectionEnergy) * 0.075;
      inspectionLight.intensity = inspectionEnergy * 16;
      metal.clearcoat = 0.12 + inspectionEnergy * 0.3;
      darkMetal.clearcoat = 0.18 + inspectionEnergy * 0.34;
      verified.emissiveIntensity = 0.1 + seatEnergy * 0.42;
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
      geometries.forEach((geometry) => geometry.dispose());
      [metal, darkMetal, quartz, verified, lineMaterial, haloMaterial].forEach((material) =>
        material.dispose(),
      );
      brushedTexture?.dispose();
      environmentTexture.dispose();
      seatHalo.geometry.dispose();
      axis.geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reducedMotion]);

  return <div className="meridian-scene" ref={mountRef} aria-hidden="true" />;
}
