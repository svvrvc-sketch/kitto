'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BookOpen, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const ThreeBookScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);

  // Zoom and camera controls refs
  const zoomInRef = useRef<() => void>(() => {});
  const zoomOutRef = useRef<() => void>(() => {});
  const resetViewRef = useRef<() => void>(() => {});

  // Sync ref with state for animation loop
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 7.2);

    let currentCameraDist = 7.2;
    let targetCameraDist = 7.2;
    let currentCameraY = 0.2;
    let targetCameraY = 0.2;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // 3. Lighting - Balanced, clean reading lighting
    const ambientLight = new THREE.AmbientLight(0xfffdf7, 1.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
    mainLight.position.set(4, 8, 6);
    scene.add(mainLight);

    const warmFillLight = new THREE.DirectionalLight(0xd97706, 1.5);
    warmFillLight.position.set(-6, -2, 4);
    scene.add(warmFillLight);

    const readingLight = new THREE.PointLight(0xffedd5, 3.0, 15);
    readingLight.position.set(0, 1.5, 4.5);
    scene.add(readingLight);

    // 4. Ultra-Crisp Canvas Textures (2048 x 2880 for zero blur)
    // A. Front Cover Texture (Obsidian Leather + Gold Foil)
    const createFrontCoverTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2880;
      const ctx = canvas.getContext('2d')!;

      // Leather background
      const grad = ctx.createLinearGradient(0, 0, 2048, 2880);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.5, '#0c0a09');
      grad.addColorStop(1, '#181412');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2048, 2880);

      // Gold borders
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 26;
      ctx.strokeRect(70, 70, 1908, 2740);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 8;
      ctx.strokeRect(104, 104, 1840, 2672);

      // Corners
      const drawCorner = (x: number, y: number, fx = 1, fy = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(fx, fy);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(0, 72);
        ctx.lineTo(0, 0);
        ctx.lineTo(72, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(140, 140, 1, 1);
      drawCorner(1908, 140, -1, 1);
      drawCorner(140, 2740, 1, -1);
      drawCorner(1908, 2740, -1, -1);

      // Emblem
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(1024, 840, 230, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0c0a09';
      ctx.beginPath();
      ctx.arc(1024, 840, 210, 0, Math.PI * 2);
      ctx.fill();

      // Kitto book icon in emblem
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 24;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(920, 800);
      ctx.quadraticCurveTo(1024, 750, 1128, 800);
      ctx.moveTo(920, 870);
      ctx.quadraticCurveTo(1024, 820, 1128, 870);
      ctx.stroke();

      // Typography
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 180px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kitto', 1024, 1340);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 56px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('O‘ZBEKISTON P2P KUTUBXONASI', 1024, 1460);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 48px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('100% BEPUL KITOB ALMASHUV', 1024, 1570);

      // Ribbon deco
      ctx.fillStyle = '#d97706';
      ctx.fillRect(824, 1660, 400, 6);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 42px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MUTOLAA MADANIYATI • 2024', 1024, 1780);

      // Click to open hint
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('📖 Ochish uchun bosing yoki tugmani bosing', 1024, 2560);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    // B. Left Open Page Texture (Manifesto & Rules - Razor Sharp)
    const createLeftPageTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2880;
      const ctx = canvas.getContext('2d')!;

      // Crisp Parchment Paper
      ctx.fillStyle = '#FAF7F0';
      ctx.fillRect(0, 0, 2048, 2880);

      // Page border
      ctx.strokeStyle = '#d6cebf';
      ctx.lineWidth = 4;
      ctx.strokeRect(120, 120, 1808, 2640);

      // Subtle spine inner shadow
      const spineGrad = ctx.createLinearGradient(1800, 0, 2048, 0);
      spineGrad.addColorStop(0, 'rgba(0,0,0,0)');
      spineGrad.addColorStop(1, 'rgba(0,0,0,0.14)');
      ctx.fillStyle = spineGrad;
      ctx.fillRect(1800, 0, 248, 2880);

      // Page Title
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 60px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('KITTO MANIFESTI • RASMIY NIZOM', 180, 280);

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 100px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Kitoblarga erkinlik!', 180, 420);

      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 52px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('“O‘qilgan kitob tokchada chang bosib qolmasin.”', 180, 520);

      // Divider line
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(180, 580);
      ctx.lineTo(1868, 580);
      ctx.stroke();

      // 4 Core Rules
      const rules = [
        {
          num: '01',
          title: '100% Notijorat ekotizim',
          desc: 'Kitto platformasida kitoblar sotilmaydi va ijaraga berilmaydi. Faqat xolis almashuv, hadya va bepul mutolaa.',
        },
        {
          num: '02',
          title: 'Qulay Uchrashuv Manzili',
          desc: 'Kitobxonlar o‘zlari uchun eng qulay bo‘lgan gavjum va xavfsiz jamoat joylarida uchrashib mutolaa almashadilar.',
        },
        {
          num: '03',
          title: 'QR-kod & Shaxsiy Kafolat',
          desc: 'Har bir topshirish va qaytarish shaxsiy QR-kod orqali tasdiqlanadi. Kitobingiz yo‘qolmaydi, holati kafolatlanadi.',
        },
        {
          num: '04',
          title: 'Haqiqiy Kitobxonlar Hamjamiyati',
          desc: 'Adabiy suhbatlar, yangi do‘stlar va o‘zaro ishonchga asoslangan kitobxonlar birlashmasi.',
        },
      ];

      let startY = 700;
      rules.forEach((r) => {
        // Number badge box
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.roundRect(180, startY, 120, 100, 20);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 54px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(r.num, 240, startY + 70);

        // Title
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 58px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(r.title, 340, startY + 68);

        // Description
        ctx.fillStyle = '#334155';
        ctx.font = '500 44px "Plus Jakarta Sans", sans-serif';
        
        // Multi-line word wrap
        const words = r.desc.split(' ');
        let line = '';
        let lineY = startY + 140;
        const maxLineWidth = 1500;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxLineWidth && n > 0) {
            ctx.fillText(line, 340, lineY);
            line = words[n] + ' ';
            lineY += 60;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 340, lineY);

        startY += 360;
      });

      // Page Number
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 46px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('— 1 —', 1024, 2680);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    // C. Right Open Page Texture (Steps & Certified Seal - Razor Sharp)
    const createRightPageTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2880;
      const ctx = canvas.getContext('2d')!;

      // Paper
      ctx.fillStyle = '#FAF7F0';
      ctx.fillRect(0, 0, 2048, 2880);

      // Spine shadow gradient on left edge
      const spineGrad = ctx.createLinearGradient(0, 0, 248, 0);
      spineGrad.addColorStop(0, 'rgba(0,0,0,0.14)');
      spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = spineGrad;
      ctx.fillRect(0, 0, 248, 2880);

      ctx.strokeStyle = '#d6cebf';
      ctx.lineWidth = 4;
      ctx.strokeRect(120, 120, 1808, 2640);

      // Header
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 56px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('O‘ZBEKISTON • 2024', 1868, 280);

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 96px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Sizning navbatingiz!', 180, 420);

      // Big Amber Callout Card
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.roundRect(180, 520, 1688, 620, 40);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Emblem inside card
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(1024, 690, 100, 0, Math.PI * 2);
      ctx.fill();

      // Open book icon inside circle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(970, 680);
      ctx.quadraticCurveTo(1024, 660, 1078, 680);
      ctx.moveTo(970, 715);
      ctx.quadraticCurveTo(1024, 695, 1078, 715);
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 64px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Mutolaa madaniyatini ulashing', 1024, 880);

      ctx.fillStyle = '#92400e';
      ctx.font = '600 46px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Katalogga kiring va yangi asarlarni kashf eting', 1024, 960);

      ctx.fillStyle = '#a16207';
      ctx.font = '500 40px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('O‘qilgan kitoblaringizga yangi hayot bering', 1024, 1030);

      // Steps Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 60px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Qanday boshlash kerak?', 180, 1260);

      const steps = [
        { title: '1. Kitobingizni qo‘shing', sub: 'Suratini oling va 1 daqiqada e’lon bering' },
        { title: '2. Istalgan kitobni tanlang', sub: 'Katalogdan yoqqan asarni topib taklif yuboring' },
        { title: '3. Suhbatlashing & Uchrashing', sub: 'Telegram kabi qulay chatda uchrashuv joyini kelishing' },
        { title: '4. QR-kod bilan qabul qiling', sub: 'Uchrashuvda QR-kodni ko‘rsatib almashuvni yakunlang' },
      ];

      let stepY = 1360;
      steps.forEach((s) => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(220, stepY + 10, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(s.title, 260, stepY + 20);

        ctx.fillStyle = '#475569';
        ctx.font = '500 42px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(s.sub, 260, stepY + 75);

        stepY += 140;
      });

      // Golden Seal of Guarantee
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(424, 2060, 1200, 280, 30);
      ctx.stroke();

      ctx.fillStyle = '#fffbeb';
      ctx.fill();

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 56px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ KITTO RASMIY EKOTIZIMI ★', 1024, 2160);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('100% KAFOLATLANGAN VA ISHONCHLI ALMASHUV', 1024, 2240);

      // Page Number
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 46px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('— 2 —', 1024, 2680);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.anisotropy = maxAnisotropy;
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
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.055,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Mouse/Touch Interactivity & Drag Rotation & Zooming
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

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCameraDist = Math.max(3.2, Math.min(8.5, targetCameraDist + e.deltaY * 0.004));
    };

    // Zoom and reset buttons callbacks
    zoomInRef.current = () => {
      targetCameraDist = Math.max(3.2, targetCameraDist - 0.8);
    };
    zoomOutRef.current = () => {
      targetCameraDist = Math.min(8.5, targetCameraDist + 0.8);
    };
    resetViewRef.current = () => {
      if (isOpenRef.current) {
        targetCameraDist = 4.8;
        targetRotX = 0.02;
        targetRotY = 0;
      } else {
        targetCameraDist = 7.2;
        targetRotX = 0.18;
        targetRotY = -0.35;
      }
    };

    const dom = renderer.domElement;
    dom.style.cursor = 'grab';
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth cover opening (~175.5 degrees so both pages lay flat)
      targetCoverAngle = isOpenRef.current ? -3.06 : 0;
      currentCoverAngle += (targetCoverAngle - currentCoverAngle) * 0.07;
      frontCoverPivot.rotation.y = currentCoverAngle;

      // Adjust camera distance: when open, zoom in automatically so text is big & legible!
      const defaultDist = isOpenRef.current ? 4.8 : 7.2;
      const defaultY = isOpenRef.current ? 0.0 : 0.2;
      
      // If user hasn't explicitly scrolled to another distance, guide to default
      if (!isDragging) {
        if (isOpenRef.current && targetCameraDist > 6.0) {
          targetCameraDist = 4.8;
        } else if (!isOpenRef.current && targetCameraDist < 5.5) {
          targetCameraDist = 7.2;
        }
      }

      currentCameraDist += (targetCameraDist - currentCameraDist) * 0.08;
      currentCameraY += (defaultY - currentCameraY) * 0.08;
      camera.position.z = currentCameraDist;
      camera.position.y = currentCameraY;

      // Center the two pages in the viewport when opened
      const targetPosX = isOpenRef.current ? 1.18 : 0;
      bookGroup.position.x += (targetPosX - bookGroup.position.x) * 0.07;

      // Gentle floating levitation
      bookGroup.position.y = -0.05 + Math.sin(elapsed * 1.5) * 0.05;

      // Smooth rotation damping
      if (!isDragging) {
        if (!isOpenRef.current) {
          targetRotY = -0.35 + Math.sin(elapsed * 0.4) * 0.18;
          targetRotX = 0.18 + Math.cos(elapsed * 0.5) * 0.06;
        } else {
          // Face directly at the viewer for perfect crystal-clear reading
          targetRotY = 0;
          targetRotX = 0.02;
        }
      }

      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;
      bookGroup.rotation.y = currentRotY;
      bookGroup.rotation.x = currentRotX;

      // Animate particles
      particles.rotation.y = elapsed * 0.03;
      particles.rotation.x = elapsed * 0.015;

      // Reading light pulses slightly when open
      if (isOpenRef.current) {
        readingLight.intensity = 3.2 + Math.sin(elapsed * 2) * 0.3;
      } else {
        readingLight.intensity = 1.8;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 460;
      const h = container.clientHeight || 520;
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
      dom.removeEventListener('wheel', onWheel);

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
        className="w-full h-[320px] sm:h-[460px] md:h-[520px] cursor-grab active:cursor-grabbing transition-transform duration-300"
      />

      {/* Floating Control Toolbar (Open/Close, Zoom In/Out, Reset View) */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5 z-10 animate-in fade-in duration-300">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg transition-all duration-300 active:scale-95 border ${
            isOpen
              ? 'bg-amber-600 text-white border-amber-500 shadow-amber-500/25 ring-2 ring-amber-500/30'
              : 'bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 border-amber-500/40 hover:border-amber-500 shadow-stone-900/10'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${isOpen ? 'animate-pulse' : 'text-amber-500'}`} />
          <span>{isOpen ? 'Kitobni yopish ✕' : '📖 Kitobni ochish va o‘qish'}</span>
        </button>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <button
            type="button"
            onClick={() => zoomInRef.current()}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            title="Yaqinlashtirish (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => zoomOutRef.current()}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            title="Uzoqlashtirish (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => resetViewRef.current()}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            title="Ko‘rinishni tiklash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive guidance tag */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100/90 dark:bg-stone-900/90 backdrop-blur-xs border border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{isOpen ? 'Kitob ochildi! Barmog‘ingiz yoki sichqoncha bilan varaqlang' : 'Kitobni barmog‘ingiz yoki sichqoncha bilan aylantiring'}</span>
        </div>
      </div>
    </div>
  );
};
