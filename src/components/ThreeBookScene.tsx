'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const ThreeBookScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // 3. Renderer with antialiasing and alpha (transparent background)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff3d6, 2.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd97706, 1.8);
    dirLight2.position.set(-5, -3, 3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xf59e0b, 2.0, 15);
    pointLight.position.set(0, 1, 3);
    scene.add(pointLight);

    // 5. Procedural Canvas Texture for High-End Kitto Book Cover
    const createCoverTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Deep obsidian-leather gradient background
      const grad = ctx.createLinearGradient(0, 0, 1024, 1440);
      grad.addColorStop(0, '#1c1917'); // stone-900
      grad.addColorStop(0.5, '#0c0a09'); // stone-950
      grad.addColorStop(1, '#1c1917');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1440);

      // Subtle gold foil border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, 944, 1360);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(55, 55, 914, 1330);

      // Corner gold ornaments
      const drawCorner = (x: number, y: number, flipX = 1, flipY = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(flipX, flipY);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(70, 70, 1, 1);
      drawCorner(954, 70, -1, 1);
      drawCorner(70, 1370, 1, -1);
      drawCorner(954, 1370, -1, -1);

      // Gold Foil Logo Emblem
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(512, 420, 110, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0c0a09';
      ctx.beginPath();
      ctx.arc(512, 420, 96, 0, Math.PI * 2);
      ctx.fill();

      // Book Icon inside emblem
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(460, 440);
      ctx.lineTo(512, 410);
      ctx.lineTo(564, 440);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(460, 400);
      ctx.lineTo(512, 370);
      ctx.lineTo(564, 400);
      ctx.stroke();

      // Title "Kitto"
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kitto', 512, 690);

      // Amber Dot
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(665, 630, 18, 0, Math.PI * 2);
      ctx.fill();

      // Subtitle
      ctx.fillStyle = '#d6d3d1';
      ctx.font = '700 36px sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('TOSHKENT P2P KUTUBXONASI', 512, 770);

      // Decorative divider
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(300, 830);
      ctx.lineTo(724, 830);
      ctx.stroke();

      // Badge
      ctx.fillStyle = '#a8a29e';
      ctx.font = '500 32px sans-serif';
      ctx.fillText('100% BEPUL KITOB ALMASHUV', 512, 910);

      // Bottom tagline
      ctx.fillStyle = '#f59e0b';
      ctx.font = '700 28px sans-serif';
      ctx.fillText('MUTOLAA MADANIYATI • 2024', 512, 1310);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    const coverTexture = createCoverTexture();

    // 6. 3D Book Construction
    const bookGroup = new THREE.Group();

    // Book Dimensions
    const bookWidth = 2.8;
    const bookHeight = 3.9;
    const bookThickness = 0.55;

    // Materials
    const coverMaterial = new THREE.MeshStandardMaterial({
      map: coverTexture,
      roughness: 0.35,
      metalness: 0.25,
    });

    const spineMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.4,
      metalness: 0.3,
    });

    const pagesMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf5ea,
      roughness: 0.7,
      metalness: 0.05,
    });

    const goldTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Front Cover
    const coverThickness = 0.04;
    const frontCoverGeo = new THREE.BoxGeometry(bookWidth, bookHeight, coverThickness);
    const frontCoverMesh = new THREE.Mesh(frontCoverGeo, coverMaterial);
    frontCoverMesh.position.set(0, 0, bookThickness / 2);
    bookGroup.add(frontCoverMesh);

    // Back Cover
    const backCoverGeo = new THREE.BoxGeometry(bookWidth, bookHeight, coverThickness);
    const backCoverMesh = new THREE.Mesh(backCoverGeo, spineMaterial);
    backCoverMesh.position.set(0, 0, -bookThickness / 2);
    bookGroup.add(backCoverMesh);

    // Pages Block (Inside)
    const pagesBlockGeo = new THREE.BoxGeometry(bookWidth - 0.15, bookHeight - 0.2, bookThickness - 0.06);
    const pagesMesh = new THREE.Mesh(pagesBlockGeo, [
      goldTrimMaterial, // Right edge: Golden Trim
      pagesMaterial,    // Left spine side
      goldTrimMaterial, // Top edge: Golden Trim
      goldTrimMaterial, // Bottom edge: Golden Trim
      pagesMaterial,    // Front
      pagesMaterial,    // Back
    ]);
    pagesMesh.position.set(0.06, 0, 0);
    bookGroup.add(pagesMesh);

    // Spine
    const spineGeo = new THREE.BoxGeometry(coverThickness, bookHeight, bookThickness);
    const spineMesh = new THREE.Mesh(spineGeo, spineMaterial);
    spineMesh.position.set(-bookWidth / 2, 0, 0);
    bookGroup.add(spineMesh);

    // Bookmark Ribbon (Silk Amber)
    const ribbonPoints = [
      new THREE.Vector3(0, bookHeight / 2, 0),
      new THREE.Vector3(0.2, bookHeight / 2 - 0.5, 0.1),
      new THREE.Vector3(0.4, 0, 0.2),
      new THREE.Vector3(0.6, -bookHeight / 2 - 0.4, 0.35),
    ];
    const ribbonCurve = new THREE.CatmullRomCurve3(ribbonPoints);
    const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 20, 0.03, 8, false);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.6 });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    bookGroup.add(ribbonMesh);

    scene.add(bookGroup);

    // 7. Golden Knowledge Particles (Dust Particles floating in orbit)
    const particlesCount = 180;
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleSpeeds = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 2.2 + Math.random() * 3.0;
      particlePositions[i * 3] = Math.cos(theta) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6.0;
      particlePositions[i * 3 + 2] = Math.sin(theta) * radius;
      particleSpeeds[i] = 0.005 + Math.random() * 0.01;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const pCtx = particleCanvas.getContext('2d');
    if (pCtx) {
      const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      pGrad.addColorStop(0, 'rgba(251, 191, 36, 1)');
      pGrad.addColorStop(0.4, 'rgba(217, 119, 6, 0.6)');
      pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = pGrad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particlesMat = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Initial Book Tilt
    bookGroup.rotation.set(0.2, -0.45, 0.08);

    // 8. Interaction handling (Parallax mouse move & drag)
    let targetRotationX = 0.2;
    let targetRotationY = -0.45;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      if (isDragging) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        targetRotationY += deltaX * 0.012;
        targetRotationX += deltaY * 0.012;
        prevMouseX = clientX;
        prevMouseY = clientY;
      } else {
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        targetRotationY = -0.45 + normX * 0.6;
        targetRotationX = 0.2 - normY * 0.45;
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevMouseX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      prevMouseY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    container.addEventListener('mousedown', handlePointerDown);
    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 360;
      const newH = container.clientHeight || 420;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth floating levitation
      bookGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.14;

      // Smooth damping rotation towards target
      bookGroup.rotation.y += (targetRotationY - bookGroup.rotation.y) * 0.08;
      bookGroup.rotation.x += (targetRotationX - bookGroup.rotation.x) * 0.08;

      // Slow idle spin if not dragging
      if (!isDragging) {
        targetRotationY += 0.002;
      }

      // Rotate particle cloud gently
      particleSystem.rotation.y = elapsedTime * 0.06;
      const positions = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        positions[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.003;
      }
      particlesGeo.attributes.position.needsUpdate = true;

      // Pulse PointLight
      pointLight.intensity = 1.8 + Math.sin(elapsedTime * 3) * 0.4;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('mousedown', handlePointerDown);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      frontCoverGeo.dispose();
      backCoverGeo.dispose();
      pagesBlockGeo.dispose();
      spineGeo.dispose();
      ribbonGeo.dispose();
      coverMaterial.dispose();
      spineMaterial.dispose();
      pagesMaterial.dispose();
      goldTrimMaterial.dispose();
      ribbonMat.dispose();
      coverTexture.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Three Canvas Container */}
      <div ref={mountRef} className="w-full h-[380px] sm:h-[460px] md:h-[500px] cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Interaction Badge */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-black/40 dark:bg-stone-900/60 backdrop-blur-md border border-amber-500/30 text-[10px] sm:text-xs text-amber-300 font-semibold flex items-center gap-1.5 shadow-md pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        <span>3D Interaktiv Kitob: Sichqoncha yoki barmoq bilan aylantiring</span>
      </div>
    </div>
  );
};
