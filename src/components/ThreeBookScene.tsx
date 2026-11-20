'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BookOpen, Sparkles } from 'lucide-react';

export const ThreeBookScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);

  // Sync ref with state for animation loop
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 460;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 7.2);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8ed, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffe8ba, 2.8);
    mainLight.position.set(4, 7, 5);
    scene.add(mainLight);

    const warmFillLight = new THREE.DirectionalLight(0xd97706, 1.8);
    warmFillLight.position.set(-5, -3, 3);
    scene.add(warmFillLight);

    const readingLight = new THREE.PointLight(0xfbbf24, 2.5, 12);
    readingLight.position.set(0, 2.2, 3.5);
    scene.add(readingLight);

    // 4. Procedural Textures
    // A. Front Cover Texture (Obsidian Leather + Gold Foil)
    const createFrontCoverTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d')!;

      // Leather background
      const grad = ctx.createLinearGradient(0, 0, 1024, 1440);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.5, '#0c0a09');
      grad.addColorStop(1, '#181412');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1440);

      // Gold borders
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 14;
      ctx.strokeRect(36, 36, 952, 1368);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.strokeRect(52, 52, 920, 1336);

      // Corners
      const drawCorner = (x: number, y: number, fx = 1, fy = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(fx, fy);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 36);
        ctx.lineTo(0, 0);
        ctx.lineTo(36, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(70, 70, 1, 1);
      drawCorner(954, 70, -1, 1);
      drawCorner(70, 1370, 1, -1);
      drawCorner(954, 1370, -1, -1);

      // Emblem
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(512, 430, 115, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0c0a09';
      ctx.beginPath();
      ctx.arc(512, 430, 105, 0, Math.PI * 2);
      ctx.fill();

      // Kitto book icon in emblem
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(460, 410);
      ctx.quadraticCurveTo(512, 385, 564, 410);
      ctx.moveTo(460, 445);
      ctx.quadraticCurveTo(512, 420, 564, 445);
      ctx.stroke();

      // Typography
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 96px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kitto', 512, 680);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('TOSHKENT P2P KUTUBXONASI', 512, 740);

      ctx.fillStyle = '#a8a29e';
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('100% BEPUL KITOB ALMASHUV', 512, 800);

      // Ribbon deco
      ctx.fillStyle = '#d97706';
      ctx.fillRect(412, 850, 200, 3);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MUTOLAA MADANIYATI • 2024', 512, 910);

      // Click to open hint
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('📖 Ochish uchun bosing', 512, 1300);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // B. Left Open Page Texture (Manifesto & Rules)
    const createLeftPageTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d')!;

      // Aged paper texture
      ctx.fillStyle = '#FAF7F0';
      ctx.fillRect(0, 0, 1024, 1440);

      // Faint page margin & watermark
      ctx.strokeStyle = '#e7e0d3';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 904, 1320);

      // Spine shadow gradient on right side of left page
      const spineGrad = ctx.createLinearGradient(900, 0, 1024, 0);
      spineGrad.addColorStop(0, 'rgba(0,0,0,0)');
      spineGrad.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = spineGrad;
      ctx.fillRect(900, 0, 124, 1440);

      // Page Title
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('KITTO MANIFESTI', 100, 150);

      ctx.fillStyle = '#1c1917';
      ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Kitoblarga erkinlik!', 100, 220);

      ctx.fillStyle = '#78716c';
      ctx.font = 'italic 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('“O‘qilgan kitob tokchada qolmasin.”', 100, 275);

      // Divider line
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100, 310);
      ctx.lineTo(924, 310);
      ctx.stroke();

      // Rule Points
      const rules = [
        {
          num: '01',
          title: '100% Notijorat ekotizim',
          desc: 'Kitto platformasida kitoblar sotilmaydi va ijaraga berilmaydi. Faqat xolis almashuv va hadya.',
        },
        {
          num: '02',
          title: 'Toshkent Metro Qulayligi',
          desc: 'Shaharning barcha 48 metro bekatlarida kitobxonlar bevosita uchrashib mutolaa almashadilar.',
        },
        {
          num: '03',
          title: 'QR-kod & Shaxsiy Kafolat',
          desc: 'Har bir topshirish va qaytarish shaxsiy QR-kod orqali tasdiqlanadi. Kitobingiz yo‘qolmaydi.',
        },
        {
          num: '04',
          title: 'Kitobxonlar Hamjamiyati',
          desc: 'Yangi do‘stlar, adabiy suhbatlar va foydali muloqotlar maydoni.',
        },
      ];

      let startY = 370;
      rules.forEach((r) => {
        // Number badge
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(r.num, 100, startY + 36);

        // Title
        ctx.fillStyle = '#1c1917';
        ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(r.title, 175, startY + 36);

        // Desc
        ctx.fillStyle = '#44403c';
        ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(r.desc, 175, startY + 80);

        startY += 150;
      });

      // Page Number
      ctx.fillStyle = '#a8a29e';
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('— 1 —', 512, 1340);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // C. Right Open Page Texture (Call to Action & Welcome)
    const createRightPageTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d')!;

      // Paper
      ctx.fillStyle = '#FAF7F0';
      ctx.fillRect(0, 0, 1024, 1440);

      // Spine shadow gradient on left side of right page
      const spineGrad = ctx.createLinearGradient(0, 0, 124, 0);
      spineGrad.addColorStop(0, 'rgba(0,0,0,0.18)');
      spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = spineGrad;
      ctx.fillRect(0, 0, 124, 1440);

      ctx.strokeStyle = '#e7e0d3';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 904, 1320);

      // Header
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('TOSHKENT • 2024', 924, 150);

      ctx.fillStyle = '#1c1917';
      ctx.font = '800 48px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Sizning navbatingiz!', 100, 240);

      // Illustration Box
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.roundRect(100, 300, 824, 460, 32);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner Illustration Elements
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(512, 480, 75, 0, Math.PI * 2);
      ctx.fill();

      // Open book icon inside circle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(475, 470);
      ctx.quadraticCurveTo(512, 455, 549, 470);
      ctx.moveTo(475, 495);
      ctx.quadraticCurveTo(512, 480, 549, 495);
      ctx.stroke();

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('1,200+ kitob almashishga tayyor', 512, 620);

      ctx.fillStyle = '#78350f';
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Katalogga kiring va istalgan kitobni tanlang', 512, 670);

      // Quote
      ctx.fillStyle = '#292524';
      ctx.font = 'italic 28px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('“Bilim ulashilganda ko‘payadi.”', 512, 850);

      // Steps summary
      ctx.fillStyle = '#57534e';
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('1. Kitob tanlang  •  2. Taklif yuboring  •  3. Metroda oling', 512, 920);

      // Golden seal
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(312, 1000, 400, 160);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('KITTO RASMIY', 512, 1060);
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#78716c';
      ctx.fillText('KAFOLATLANGAN ALMASHUV', 512, 1105);

      // Page Number
      ctx.fillStyle = '#a8a29e';
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('— 2 —', 512, 1340);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const frontCoverTexture = createFrontCoverTexture();
    const leftPageTexture = createLeftPageTexture();
    const rightPageTexture = createRightPageTexture();

    // 5. Materials
    const darkLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x181513,
      roughness: 0.5,
      metalness: 0.15,
    });

    const goldEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xdf9d24,
      roughness: 0.35,
      metalness: 0.85,
    });

    const frontCoverMat = new THREE.MeshStandardMaterial({
      map: frontCoverTexture,
      roughness: 0.35,
      metalness: 0.25,
    });

    const leftPageMat = new THREE.MeshStandardMaterial({
      map: leftPageTexture,
      roughness: 0.7,
      metalness: 0.05,
    });

    const rightPageMat = new THREE.MeshStandardMaterial({
      map: rightPageTexture,
      roughness: 0.7,
      metalness: 0.05,
    });

    // 6. Geometry construction
    const bookWidth = 2.4;
    const bookHeight = 3.4;
    const bookThickness = 0.45;

    // Master container for the entire interactive book
    const bookGroup = new THREE.Group();
    scene.add(bookGroup);

    // Initial position & angle
    bookGroup.position.set(0, -0.1, 0);
    bookGroup.rotation.set(0.18, -0.35, 0.05);

    // --- A. BACK COVER ---
    const backCoverGeo = new THREE.BoxGeometry(bookWidth, bookHeight, 0.04);
    const backCover = new THREE.Mesh(backCoverGeo, darkLeatherMat);
    backCover.position.set(0, 0, -bookThickness / 2);
    bookGroup.add(backCover);

    // --- B. SPINE ---
    const spineGeo = new THREE.BoxGeometry(0.04, bookHeight, bookThickness);
    const spine = new THREE.Mesh(spineGeo, darkLeatherMat);
    spine.position.set(-bookWidth / 2, 0, 0);
    bookGroup.add(spine);

    // --- C. INNER PAGES BASE BLOCK ---
    const pageBlockGeo = new THREE.BoxGeometry(bookWidth * 0.96, bookHeight * 0.96, bookThickness * 0.88);
    const pageBlockMaterials = [
      goldEdgeMat, // right edge
      goldEdgeMat, // left (hidden by spine)
      goldEdgeMat, // top edge
      goldEdgeMat, // bottom edge
      rightPageMat, // top face (open right page)
      darkLeatherMat, // bottom face
    ];
    const pageBlock = new THREE.Mesh(pageBlockGeo, pageBlockMaterials);
    pageBlock.position.set(0.02, 0, 0);
    bookGroup.add(pageBlock);

    // --- D. FRONT COVER PIVOT HINGE (Opening mechanism) ---
    const frontCoverPivot = new THREE.Group();
    frontCoverPivot.position.set(-bookWidth / 2, 0, bookThickness / 2);
    bookGroup.add(frontCoverPivot);

    // Front Cover Mesh
    const coverFaceGeo = new THREE.PlaneGeometry(bookWidth, bookHeight);
    const coverOuterMesh = new THREE.Mesh(coverFaceGeo, frontCoverMat);
    coverOuterMesh.position.set(bookWidth / 2, 0, 0.01);
    frontCoverPivot.add(coverOuterMesh);

    // Inner left page mesh (visible when open)
    const innerLeftPageMesh = new THREE.Mesh(coverFaceGeo, leftPageMat);
    innerLeftPageMesh.position.set(bookWidth / 2, 0, -0.01);
    innerLeftPageMesh.rotation.set(0, Math.PI, 0);
    frontCoverPivot.add(innerLeftPageMesh);

    // --- E. FLOATING PARTICLES ---
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      scales[i] = Math.random() * 0.8 + 0.3;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.065,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Mouse/Touch Interactivity & Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = -0.35;
    let targetRotX = 0.18;
    let currentRotY = -0.35;
    let currentRotX = 0.18;
    let currentCoverAngle = 0;
    let targetCoverAngle = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.007;
        targetRotX += deltaY * 0.007;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        targetRotY += deltaX * 0.008;
        targetRotX += deltaY * 0.008;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onCanvasClick = () => {
      setIsOpen((prev) => !prev);
    };

    const dom = renderer.domElement;
    dom.style.cursor = 'grab';
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    dom.addEventListener('click', onCanvasClick);

    // 8. Animation Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Cover rotation angle
      targetCoverAngle = isOpenRef.current ? -2.7 : 0;
      currentCoverAngle += (targetCoverAngle - currentCoverAngle) * 0.06;
      frontCoverPivot.rotation.y = currentCoverAngle;

      // Adjust horizontal center when open
      const targetPosX = isOpenRef.current ? 1.0 : 0;
      bookGroup.position.x += (targetPosX - bookGroup.position.x) * 0.05;

      // Gentle floating levitation
      bookGroup.position.y = -0.1 + Math.sin(elapsed * 1.5) * 0.07;

      // Smooth rotation damping
      if (!isDragging) {
        if (!isOpenRef.current) {
          targetRotY = -0.35 + Math.sin(elapsed * 0.4) * 0.25;
          targetRotX = 0.18 + Math.cos(elapsed * 0.5) * 0.08;
        } else {
          targetRotY = 0;
          targetRotX = 0.12;
        }
      }

      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;
      bookGroup.rotation.y = currentRotY;
      bookGroup.rotation.x = currentRotX;

      // Animate particles
      particles.rotation.y = elapsed * 0.04;
      particles.rotation.x = elapsed * 0.02;

      // Reading light pulses slightly when open
      if (isOpenRef.current) {
        readingLight.intensity = 2.4 + Math.sin(elapsed * 2) * 0.3;
      } else {
        readingLight.intensity = 1.6;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      dom.removeEventListener('click', onCanvasClick);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      frontCoverTexture.dispose();
      leftPageTexture.dispose();
      rightPageTexture.dispose();
      backCoverGeo.dispose();
      spineGeo.dispose();
      pageBlockGeo.dispose();
      coverFaceGeo.dispose();
      particleGeo.dispose();
      darkLeatherMat.dispose();
      goldEdgeMat.dispose();
      frontCoverMat.dispose();
      leftPageMat.dispose();
      rightPageMat.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Canvas Mounting Container */}
      <div
        ref={mountRef}
        className="w-full h-[400px] sm:h-[480px] md:h-[520px] cursor-grab active:cursor-grabbing transition-transform duration-300"
      />

      {/* Interactive Controls & Hint Below the 3D Book */}
      <div className="mt-2 flex flex-col sm:flex-row items-center gap-2.5 z-10 animate-in fade-in duration-300">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg transition-all duration-300 active:scale-95 border ${
            isOpen
              ? 'bg-amber-600 text-white border-amber-500 shadow-amber-500/20'
              : 'bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 border-amber-500/40 hover:border-amber-500 shadow-stone-900/10'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${isOpen ? 'animate-pulse' : 'text-amber-500'}`} />
          <span>{isOpen ? 'Kitobni yopish ✕' : '📖 Kitobni ochish va varaqlash'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100/80 dark:bg-stone-900/80 backdrop-blur-xs border border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{isOpen ? 'Kitob ochildi! Sichqoncha bilan aylantiring' : 'Kitob ustiga bosing yoki aylantiring'}</span>
        </div>
      </div>
    </div>
  );
};
