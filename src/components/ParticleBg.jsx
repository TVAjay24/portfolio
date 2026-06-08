import { useEffect, useRef } from "react";
import * as THREE from "three";

const ParticleBg = () => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dimensions
    let width = containerRef.current.clientWidth || window.innerWidth;
    let height = containerRef.current.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Set fog to match the dark CSS --bg-darker color (#020408) for a seamless horizon
    scene.fog = new THREE.FogExp2(0x020408, 0.012);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 12, 35);
    camera.lookAt(0, 2, 0);

    // WebGL Renderer with antialiasing and transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 1. Synthwave 3D Wireframe Grid Plane (Cybernetic Terrain)
    const gridGeometry = new THREE.PlaneGeometry(150, 150, 40, 40);
    gridGeometry.rotateX(-Math.PI / 2); // Lay flat horizontally

    // Store original height layout for wave perturbations
    const positionAttr = gridGeometry.attributes.position;
    const initialHeights = [];
    for (let i = 0; i < positionAttr.count; i++) {
      initialHeights.push(positionAttr.getY(i));
    }

    // Material in cybernetic neon-cyan
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d2ff, // matching --accent-blue
      wireframe: true,
      transparent: true,
      opacity: 0.14,
      fog: true
    });

    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.position.set(0, -4, -20);
    scene.add(grid);

    // 2. 3D Floating Particle Cloud
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x00d2ff);   // --accent-blue
    const colorPurple = new THREE.Color(0xbd00ff); // --accent-purple
    const colorGreen = new THREE.Color(0x00ffc4);  // --accent-cyan

    for (let i = 0; i < particleCount; i++) {
      // Scatter in a wide volume around the camera view
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.2) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      // Color coding based on theme colors
      const r = Math.random();
      const chosenColor = r < 0.4 ? colorCyan : r < 0.75 ? colorPurple : colorGreen;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Dynamic circular particle glow canvas texture
    const createCircleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      return new THREE.CanvasTexture(canvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      map: createCircleTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse movement event tracking (normalized -1 to 1)
    const onMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Resize container
    const onResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Intersection Observer to stop rendering when scrolled out of view (Battery & GPU saving)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);

    // Render Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      const time = clock.getElapsedTime();

      // 1. Digital Synthwave Grid Waves
      const pos = gridGeometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        
        // Dynamic wave mathematics using sine and cosine frequencies
        // Subtracting time from z term slides the waves forward
        const waveX = Math.sin(x * 0.07 + time * 0.8) * 1.8;
        const waveZ = Math.cos(z * 0.07 - time * 1.2) * 1.8;
        
        pos.setY(i, waveX + waveZ);
      }
      pos.needsUpdate = true;

      // 2. Slow particle cloud rotation
      particles.rotation.y = time * 0.015;
      particles.rotation.x = time * 0.008;

      // 3. Smooth Camera Parallax Lerp based on Mouse Coordinates
      const targetX = mouseRef.current.x * 6;
      const targetY = 12 + mouseRef.current.y * 4;
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 1 + mouseRef.current.y * 2.5, -15);

      renderer.render(scene, camera);
    };
    animate();

    // Clean up connections
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      gridGeometry.dispose();
      gridMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0, // placed behind content but above base body background
        pointerEvents: "none",
        overflow: "hidden"
      }}
    />
  );
};

export default ParticleBg;
