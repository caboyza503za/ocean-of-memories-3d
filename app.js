// ============================================
// Ocean of Memories - 7th Month Anniversary Edition
// High-Aesthetic Romantic 3D Ocean Engine
// ============================================

(function () {
  const CONFIG = {
    world: {
      size: 250,
      depth: 60,
      fogDensity: 0.012,
      fogColor: 0x160B2E,      // Rich royal plum-navy
      bgColor: 0x0A0618,
      ambientColor: 0x3E4A78,  // Warmer bioluminescent ambient
      surfaceLightColor: 0xFFB6D0, // Romantic pink-gold sun rays
      floorColor: 0x2E2A3C,    // Deep sea floor with a violet-gold undertone
    },
    fish: {
      schoolCount: 5,
      fishPerSchool: 16,
      speed: 4,
      separationDist: 3,
      cohesionDist: 12,
      separationWeight: 2.5,
      alignmentWeight: 1.2,
      cohesionWeight: 1.0,
      boundsWeight: 1.5,
      tailSpeed: 8,
      tailAmplitude: 0.4,
    },
    bubbles: { count: 200, speed: 2 },
    dust: { count: 450 },
    player: {
      minSpeed: 0, maxSpeed: 15, defaultSpeed: 4,
      sensitivity: 0.002, smoothing: 0.05,
      discoveryRadius: 8, proximityRadius: 20,
    },
  };

  let DISCOVERIES = [];
  let ASSETS = [];

  class UnderwaterWorld {
    constructor() {
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = new THREE.Clock();
      this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
      this.moveSpeed = 0;
      this.targetSpeed = CONFIG.player.defaultSpeed;
      this.direction = new THREE.Vector3(0, 0, -1);

      this.fishSchools = [];
      this.jellyfish = [];
      this.seaweedMeshes = [];
      this.anemones = [];
      this.bubbleSystem = null;
      this.dustSystem = null;
      this.sparkleSystem = null;
      this.godRays = [];
      this.causticLights = [];
      this.discoveryObjects = [];

      this.discoveredCount = 0;
      this.showingDiscovery = false;
      this.isPhotoMode = false;
      this.isStarted = false;

      this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Override for performance on mobile
      if (this.isTouchDevice) {
        CONFIG.bubbles.count = 50;
        CONFIG.dust.count = 100;
        CONFIG.fish.schoolCount = 2;
        CONFIG.fish.fishPerSchool = 8;
      }

      this.joystickActive = false;
      this.joystickBase = { x: 0, y: 0 };
      this.joystickDelta = { x: 0, y: 0 };
    }

    async init() {
      this.updateLoadingProgress(10, 'กำลังเตรียมความทรงจำ...');

      try {
        const res = await fetch('assets.json');
        const files = await res.json();
        ASSETS = files.filter(f => !f.endsWith('.py') && !f.endsWith('.json'));
      } catch (e) {
        console.error('Failed to load assets.json', e);
      }

      const total = 33;
      const colors = [0xFF3377, 0xFF66B2, 0xFFD700, 0x00E5FF, 0xFF1493];
      const miniGames = window.MiniGames || [];

      // Load saved progress
      let savedProgress = [];
      try {
        const saved = localStorage.getItem('ocean_memories_progress');
        if (saved) savedProgress = JSON.parse(saved);
      } catch (e) {}

      for (let i = 0; i < total; i++) {
        const asset = ASSETS.length > 0 ? ASSETS[i % ASSETS.length] : 'IMG_3640.jpg';
        const isFound = savedProgress[i] === true;
        if (isFound) this.discoveredCount++;

        DISCOVERIES.push({
          id: i,
          asset: asset,
          found: isFound,
          position: new THREE.Vector3(
            (Math.random() - 0.5) * (CONFIG.world.size * 0.8),
            3 + Math.random() * 12,
            (Math.random() - 0.5) * (CONFIG.world.size * 0.8)
          ),
          color: colors[i % colors.length],
          minigame: miniGames[i % miniGames.length] || {
            title: `ความทรงจำที่ ${i + 1}`,
            instruction: 'แตะเพื่อปลดล็อค',
            init: (container, onComplete) => {
              const btn = document.createElement('button');
              btn.className = 'btn-primary';
              btn.textContent = '❤️ ปลดล็อค';
              btn.onclick = onComplete;
              container.appendChild(btn);
            }
          }
        });
      }

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(CONFIG.world.bgColor);
      this.scene.fog = new THREE.FogExp2(CONFIG.world.fogColor, CONFIG.world.fogDensity);

      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
      this.camera.position.set(0, 15, 30);
      this.euler.set(-0.1, 0, 0);

      this.renderer = new THREE.WebGLRenderer({ antialias: !this.isTouchDevice, alpha: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(this.isTouchDevice ? 1.0 : window.devicePixelRatio);
      document.getElementById('canvas-container').appendChild(this.renderer.domElement);

      this.updateLoadingProgress(30, 'กำลังสร้างมหาสมุทรโรแมนติก...');
      this.createEnvironment();

      this.updateLoadingProgress(60, 'กำลังสร้างสิ่งมีชีวิตและดอกไม้ทะเล...');
      this.createCreatures();

      this.updateLoadingProgress(85, 'กำลังสร้างผลึกหัวใจความทรงจำ...');
      this.createDiscoveryPoints();

      this.updateLoadingProgress(95, 'กำลังเตรียมระบบควบคุม...');
      this.setupControls();
      this.setupUI();
      this.setupGallery();
      this.setupBGM();
      this.setupMinimap();

      this.updateLoadingProgress(100, 'พร้อมแล้ว!');
      await this.delay(400);
      document.getElementById('loading-screen').classList.add('hidden');

      // Update HUD with saved progress
      const hudCollected = document.getElementById('hud-collected');
      if (hudCollected) hudCollected.textContent = this.discoveredCount;

      this.startDate = new Date(2026, 0, 1, 1, 8, 0); // 1 Jan 2026, 01:08:00
      this.updateTimer();
      setInterval(() => this.updateTimer(), 1000);

      window.addEventListener('resize', () => this.onResize());
      this.animate();
      this.setupPasscode();
    }

    setupPasscode() {
      const passcodeScreen = document.getElementById('passcode-screen');
      const landingPage = document.getElementById('landing-page');
      const input = document.getElementById('passcode-input');
      const errorMsg = document.getElementById('passcode-error');
      const validCodes = ['010169', '010126', '1169', '1126', '0101', '11', '1/1/69'];

      if (!passcodeScreen) return;
      passcodeScreen.classList.remove('hidden');

      let currentPin = '';
      let wrongCount = 0;

      const updatePinDisplay = () => {
        if (input) input.value = currentPin;
      };

      const checkPin = () => {
        if (validCodes.includes(currentPin.trim())) {
          if (errorMsg) errorMsg.classList.add('hidden');
          this.showNotification('🔓 รหัสผ่านถูกต้อง! เก่งมากจุ๊บๆ ❤️');
          passcodeScreen.classList.add('hidden');
          if (landingPage) landingPage.classList.remove('hidden');
        } else {
          wrongCount++;
          let text = '';
          if (wrongCount === 1) {
            text = '❌ รหัสผ่านไม่ถูกต้อง อย่าให้มีครั้งที่ 1 ❤️';
          } else if (wrongCount === 2) {
            text = '❌ รหัสผ่านไม่ถูกต้อง อย่าให้มีครั้งที่ 2 ❤️';
          } else if (wrongCount === 3) {
            text = '❌ รหัสผ่านไม่ถูกต้อง ครั้งที่สามนี่ไม่ควรละนะ ❤️';
          } else {
            text = '❌ รหัสผ่านไม่ถูกต้อง งอน เชอะ ❤️';
          }

          if (errorMsg) {
            errorMsg.textContent = text;
            errorMsg.classList.remove('hidden');
            errorMsg.style.animation = 'none';
            errorMsg.offsetHeight;
            errorMsg.style.animation = 'shake 0.4s ease';
          }
          currentPin = '';
          updatePinDisplay();
        }
      };

      document.querySelectorAll('.key-btn[data-key]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (currentPin.length < 8) {
            currentPin += btn.getAttribute('data-key');
            updatePinDisplay();
            if (errorMsg) errorMsg.classList.add('hidden');
            if (currentPin.length === 6) checkPin();
          }
        });
      });

      const btnDel = document.getElementById('key-del');
      if (btnDel) {
        btnDel.addEventListener('click', () => {
          currentPin = currentPin.slice(0, -1);
          updatePinDisplay();
          if (errorMsg) errorMsg.classList.add('hidden');
        });
      }

      const btnEnter = document.getElementById('key-enter');
      if (btnEnter) {
        btnEnter.addEventListener('click', () => checkPin());
      }
    }

    delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    updateLoadingProgress(p, t) {
      const bar = document.getElementById('loading-bar');
      if (bar) bar.style.width = p + '%';
    }

    updateTimer() {
      const start = new Date(2026, 0, 1, 1, 8, 0); // 1 ม.ค. 2569 เวลา 01:08 น.
      const now = new Date();

      let years = now.getFullYear() - start.getFullYear();
      let months = (years * 12) + (now.getMonth() - start.getMonth());
      
      let tempDate = new Date(start.getTime());
      tempDate.setMonth(tempDate.getMonth() + months);
      
      if (tempDate > now) {
        months--;
        tempDate = new Date(start.getTime());
        tempDate.setMonth(tempDate.getMonth() + months);
      }
      
      let remainingMs = now - tempDate;
      const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      remainingMs -= days * (1000 * 60 * 60 * 24);
      
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      remainingMs -= hours * (1000 * 60 * 60);
      
      const minutes = Math.floor(remainingMs / (1000 * 60));
      remainingMs -= minutes * (1000 * 60);
      
      const seconds = Math.floor(remainingMs / 1000);

      const txt = document.getElementById('anniversary-timer');
      if (txt) {
        txt.textContent = `คบกันมาแล้ว: ${months} เดือน ${days} วัน ${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที ❤️`;
      }
    }

    // ============================================
    // Environment & High-Aesthetic Features
    // ============================================
    createEnvironment() {
      // Lighting
      this.scene.add(new THREE.AmbientLight(CONFIG.world.ambientColor, 1.4));
      const sun = new THREE.DirectionalLight(CONFIG.world.surfaceLightColor, 1.6);
      sun.position.set(30, 100, 20);
      this.scene.add(sun);
      this.scene.add(new THREE.HemisphereLight(0xFFC9A0, 0x102035, 0.8));
      // Soft gold fill light — adds a warm, jewel-box sheen to nearby corals & fish
      const goldFill = new THREE.PointLight(0xFFD98A, 0.5, 90);
      goldFill.position.set(0, 25, 0);
      this.scene.add(goldFill);

      // Ocean Floor Terrain with multi-frequency smooth noise
      const size = CONFIG.world.size;
      const geo = new THREE.PlaneGeometry(size * 2, size * 2, 70, 70);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const y = Math.sin(x * 0.04) * 2.5 + Math.cos(z * 0.04) * 2.5 + Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.8;
        pos.setY(i, y);
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ color: CONFIG.world.floorColor, roughness: 0.85, metalness: 0.1 });
      this.scene.add(new THREE.Mesh(geo, mat));

      // Organic Curving Kelp Forest (CatmullRom Curves)
      const kelpMat = new THREE.MeshStandardMaterial({ color: 0x225533, roughness: 0.6, side: THREE.DoubleSide });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e6f43, roughness: 0.5, side: THREE.DoubleSide });

      for (let i = 0; i < 140; i++) {
        const height = 15 + Math.random() * 15;
        const pts = [];
        const segs = 8;
        const basePos = new THREE.Vector3(
          (Math.random() - 0.5) * size,
          0,
          (Math.random() - 0.5) * size
        );

        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          pts.push(new THREE.Vector3(
            Math.sin(t * Math.PI) * 0.8,
            t * height,
            Math.cos(t * Math.PI) * 0.8
          ));
        }

        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.12, 6, false);
        const kelpGroup = new THREE.Group();
        const stem = new THREE.Mesh(tubeGeo, kelpMat);
        kelpGroup.add(stem);

        // Add organic leaves along the curve
        for (let l = 0.2; l < 0.95; l += 0.08) {
          const p = curve.getPoint(l);
          const leafGeo = new THREE.PlaneGeometry(0.6, 1.8);
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.copy(p);
          leaf.rotation.set(Math.random() * 0.6, Math.random() * Math.PI * 2, Math.random() * 0.6);
          kelpGroup.add(leaf);
        }

        kelpGroup.position.copy(basePos);
        kelpGroup.userData = { swaySpeed: 0.4 + Math.random() * 0.4, offset: Math.random() * Math.PI * 2, curve, tubeGeo };
        this.scene.add(kelpGroup);
        this.seaweedMeshes.push(kelpGroup);
      }

      // Branching Organic Corals (5 Types)
      const coralColors = [0xFF6B9E, 0xFF8E72, 0xE84393, 0xFAB1A0, 0x90D8FF, 0x48C9B0];
      for (let i = 0; i < 140; i++) {
        const type = Math.floor(Math.random() * 5);
        const color = coralColors[Math.floor(Math.random() * coralColors.length)];
        const cmat = new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.15, emissive: new THREE.Color(color).multiplyScalar(0.18) });
        let mesh;

        if (type === 0) {
          // Branching Coral Tree
          mesh = new THREE.Group();
          const branches = 4 + Math.floor(Math.random() * 3);
          for (let b = 0; b < branches; b++) {
            const bmesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 1.8, 6), cmat);
            bmesh.position.y = 0.9;
            bmesh.rotation.set((Math.random() - 0.5) * 1.0, (b / branches) * Math.PI * 2, (Math.random() - 0.5) * 1.0);
            
            // Tip sphere
            const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), cmat);
            tip.position.y = 0.9;
            bmesh.add(tip);
            mesh.add(bmesh);
          }
        } else if (type === 1) {
          // Fan Coral
          mesh = new THREE.Group();
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 2, 6), cmat);
          stem.position.y = 1;
          mesh.add(stem);
          const fanGeo = new THREE.PlaneGeometry(2.2, 2.2);
          const fan = new THREE.Mesh(fanGeo, new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.85, roughness: 0.5 }));
          fan.position.y = 1.2;
          mesh.add(fan);
        } else if (type === 2) {
          // Brain Coral
          mesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 14), cmat);
          mesh.scale.set(1.2, 0.7, 1.2);
        } else if (type === 3) {
          // Tube Coral Cluster with Rim Caps
          mesh = new THREE.Group();
          for (let t = 0; t < 6; t++) {
            const h = 0.6 + Math.random() * 1.2;
            const tmesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, h, 8), cmat);
            tmesh.position.set((Math.random() - 0.5) * 0.6, h / 2, (Math.random() - 0.5) * 0.6);
            
            const cap = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 6, 12), new THREE.MeshBasicMaterial({ color }));
            cap.rotation.x = Math.PI / 2;
            cap.position.y = h / 2;
            tmesh.add(cap);
            mesh.add(tmesh);
          }
        } else {
          // Staghorn Coral
          mesh = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 2.2, 6), cmat);
          trunk.position.y = 1.1;
          mesh.add(trunk);
          for (let f = 0; f < 4; f++) {
            const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.4, 5), cmat);
            branch.position.set((Math.random() - 0.5) * 0.5, 1.4, (Math.random() - 0.5) * 0.5);
            branch.rotation.set((Math.random() - 0.5) * 1.2, (f / 4) * Math.PI * 2, (Math.random() - 0.5) * 1.2);
            mesh.add(branch);
          }
        }

        mesh.position.set((Math.random() - 0.5) * size * 0.9, 0.3, (Math.random() - 0.5) * size * 0.9);
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.scale.setScalar(0.7 + Math.random() * 1.1);
        this.scene.add(mesh);
      }

      // Shipwreck
      const wreck = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x5C3D26, roughness: 0.85 });
      const hull = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 25), woodMat);
      hull.position.y = 2;
      wreck.add(hull);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 12, 8), woodMat);
      mast.position.set(0, 8, -2);
      mast.rotation.z = 0.25;
      wreck.add(mast);

      for (let b = 0; b < 5; b++) {
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 1, 8), woodMat);
        barrel.position.set((Math.random() - 0.5) * 15, 0.5, -20 + (Math.random() - 0.5) * 15);
        barrel.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        wreck.add(barrel);
      }

      wreck.position.set(15, -1, -30);
      wreck.rotation.set(0.06, 0.5, 0.1);
      this.scene.add(wreck);

      // God Rays — alternating gold & rose shimmer for a jewel-box feel
      const rayColors = [0xFFD98A, 0xFFA0C4, 0xB8E4FF];
      for (let i = 0; i < 12; i++) {
        const rayMat = new THREE.MeshBasicMaterial({ color: rayColors[i % rayColors.length], transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
        const ray = new THREE.Mesh(new THREE.PlaneGeometry(6 + Math.random() * 6, CONFIG.world.depth + 25), rayMat);
        ray.position.set((Math.random() - 0.5) * size, CONFIG.world.depth / 2, (Math.random() - 0.5) * size);
        ray.rotation.y = Math.random() * Math.PI;
        ray.userData = { baseOpacity: 0.03 + Math.random() * 0.05, speed: 0.3 + Math.random() * 0.5, offset: Math.random() * Math.PI * 2 };
        this.scene.add(ray);
        this.godRays.push(ray);
      }

      // Caustics — soft gold & rose light pools dancing on the seabed
      const causticColors = [0xFFDDA0, 0xFFB6D0, 0x8FDCFF];
      for (let i = 0; i < 25; i++) {
        const causticMat = new THREE.MeshBasicMaterial({ color: causticColors[i % causticColors.length], transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
        const c = new THREE.Mesh(new THREE.CircleGeometry(4 + Math.random() * 6, 8), causticMat);
        c.rotation.x = -Math.PI / 2;
        c.position.set((Math.random() - 0.5) * size, 0.4, (Math.random() - 0.5) * size);
        c.userData = { baseOpacity: 0.03 + Math.random() * 0.06, speed: 0.8 + Math.random() * 1.5, offset: Math.random() * Math.PI * 2 };
        this.causticLights.push(c);
        this.scene.add(c);
      }

      // Sparkles — fine twinkling gold glitter drifting through the water
      const sparkleCount = 260;
      const sparkleGeo = new THREE.BufferGeometry();
      const sPos = new Float32Array(sparkleCount * 3);
      const sPhase = new Float32Array(sparkleCount);
      for (let i = 0; i < sparkleCount; i++) {
        sPos[i * 3] = (Math.random() - 0.5) * size;
        sPos[i * 3 + 1] = Math.random() * CONFIG.world.depth;
        sPos[i * 3 + 2] = (Math.random() - 0.5) * size;
        sPhase[i] = Math.random() * Math.PI * 2;
      }
      sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
      sparkleGeo.setAttribute('phase', new THREE.BufferAttribute(sPhase, 1));
      this.sparkleSystem = new THREE.Points(sparkleGeo, new THREE.PointsMaterial({
        color: 0xFFE9B0, size: 0.22, transparent: true, opacity: 0.85,
        depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending,
      }));
      this.scene.add(this.sparkleSystem);

      // Particles (Dust & Bubbles)
      const dustGeo = new THREE.BufferGeometry();
      const dPos = new Float32Array(CONFIG.dust.count * 3);
      for (let i = 0; i < CONFIG.dust.count * 3; i++) dPos[i] = (Math.random() - 0.5) * size;
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
      this.dustSystem = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xFFA0C4, size: 0.25, transparent: true, opacity: 0.45 }));
      this.scene.add(this.dustSystem);

      const bubGeo = new THREE.BufferGeometry();
      const bPos = new Float32Array(CONFIG.bubbles.count * 3);
      for (let i = 0; i < CONFIG.bubbles.count * 3; i++) bPos[i] = (Math.random() - 0.5) * size;
      bubGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
      this.bubbleSystem = new THREE.Points(bubGeo, new THREE.PointsMaterial({ color: 0xAEEEEE, size: 0.4, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending }));
      this.scene.add(this.bubbleSystem);
    }

    createCreatures() {
      // Starfish (35)
      const starMat = new THREE.MeshStandardMaterial({ color: 0xFF5733, roughness: 0.7 });
      for (let i = 0; i < 35; i++) {
        const star = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.18, 5), starMat);
        star.rotation.x = Math.PI / 2;
        star.position.set((Math.random() - 0.5) * CONFIG.world.size * 0.85, 0.2, (Math.random() - 0.5) * CONFIG.world.size * 0.85);
        this.scene.add(star);
      }

      // Urchins (25)
      const urchinMat = new THREE.MeshStandardMaterial({ color: 0x1A2536, roughness: 0.9 });
      for (let i = 0; i < 25; i++) {
        const u = new THREE.Group();
        u.add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), urchinMat));
        for (let s = 0; s < 25; s++) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.65, 4), urchinMat);
          spike.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          u.add(spike);
        }
        u.position.set((Math.random() - 0.5) * CONFIG.world.size * 0.85, 0.2, (Math.random() - 0.5) * CONFIG.world.size * 0.85);
        this.scene.add(u);
      }

      // Shells (40)
      const shellMat = new THREE.MeshStandardMaterial({ color: 0xF7D6A3, roughness: 0.5, metalness: 0.2 });
      for (let i = 0; i < 40; i++) {
        const shell = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 6), shellMat);
        shell.rotation.set(Math.PI / 2, Math.random() * Math.PI, 0);
        shell.position.set((Math.random() - 0.5) * CONFIG.world.size * 0.85, 0.2, (Math.random() - 0.5) * CONFIG.world.size * 0.85);
        this.scene.add(shell);
      }

      // Anemones (40) with curved tentacles
      const anemColors = [0xFF88CC, 0x88CCFF, 0xAAFF88, 0xFFAA88];
      for (let i = 0; i < 40; i++) {
        const color = anemColors[i % anemColors.length];
        const amat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, emissive: new THREE.Color(color).multiplyScalar(0.25) });
        const an = new THREE.Group();
        an.add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.4, 10), amat));
        an.userData.tentacles = [];
        for (let t = 0; t < 16; t++) {
          const tentacle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.05, 0.9, 5), amat);
          const angle = Math.random() * Math.PI * 2;
          tentacle.position.set(Math.cos(angle) * 0.22, 0.4, Math.sin(angle) * 0.22);
          tentacle.userData = { baseRotX: (Math.random() - 0.5) * 0.4, baseRotZ: (Math.random() - 0.5) * 0.4, offset: Math.random() * Math.PI * 2 };
          an.add(tentacle);
          an.userData.tentacles.push(tentacle);
        }
        an.position.set((Math.random() - 0.5) * CONFIG.world.size * 0.85, 0, (Math.random() - 0.5) * CONFIG.world.size * 0.85);
        this.scene.add(an);
        this.anemones.push(an);
      }

      // Jellyfish (15) with bioluminescent glow
      const jellyColors = [0xFF77BB, 0x77CCFF, 0x99FF88, 0xBB88FF];
      for (let j = 0; j < 15; j++) {
        const color = jellyColors[j % jellyColors.length];
        const jmat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.55, roughness: 0.2, emissive: new THREE.Color(color).multiplyScalar(0.3), side: THREE.DoubleSide });
        const jelly = new THREE.Group();
        const bell = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), jmat);
        jelly.add(bell);
        
        // Inner rim cap
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.06, 6, 16), jmat);
        rim.position.y = -0.55;
        rim.rotation.x = Math.PI / 2;
        jelly.add(rim);

        const light = new THREE.PointLight(color, 0.8, 12);
        light.position.y = -0.2;
        jelly.add(light);

        jelly.position.set((Math.random() - 0.5) * CONFIG.world.size * 0.8, 10 + Math.random() * 30, (Math.random() - 0.5) * CONFIG.world.size * 0.8);
        jelly.userData = { baseY: jelly.position.y, pulseSpeed: 1.5 + Math.random(), offset: Math.random() * Math.PI * 2, bell, light };
        this.jellyfish.push(jelly);
        this.scene.add(jelly);
      }

      // Fish Schools (5 schools x 16 fish = 80 Boids)
      const fishColors = [0x5DADE2, 0xF5A623, 0x48C9B0, 0xEB984E, 0xAA88FF];
      for (let s = 0; s < CONFIG.fish.schoolCount; s++) {
        const color = fishColors[s % fishColors.length];
        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5, emissive: new THREE.Color(color).multiplyScalar(0.1) });
        const center = new THREE.Vector3((Math.random() - 0.5) * CONFIG.world.size * 0.6, 10 + Math.random() * 20, (Math.random() - 0.5) * CONFIG.world.size * 0.6);
        const school = [];
        for (let f = 0; f < CONFIG.fish.fishPerSchool; f++) {
          const fish = new THREE.Group();
          const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), bodyMat);
          body.scale.set(0.8, 0.5, 1.7);
          fish.add(body);

          const tailShape = new THREE.Shape();
          tailShape.moveTo(0, 0);
          tailShape.quadraticCurveTo(-0.25, 0.4, -0.45, 0.55);
          tailShape.lineTo(0, 0.1);
          tailShape.lineTo(0.45, 0.55);
          tailShape.quadraticCurveTo(0.25, 0.4, 0, 0);
          const tail = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), bodyMat);
          tail.position.set(0, -0.1, 0.8);
          tail.rotation.y = Math.PI;
          fish.add(tail);

          fish.position.copy(center).add(new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 8));
          fish.userData = {
            velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2).normalize().multiplyScalar(CONFIG.fish.speed),
            schoolCenter: center,
            offset: Math.random() * Math.PI * 2,
            tail
          };
          this.scene.add(fish);
          school.push(fish);
        }
        this.fishSchools.push(school);
      }
    }

    // ============================================
    // 3D Extruded Shiny Crystal Heart Orbs
    // ============================================
    createDiscoveryPoints() {
      // Create smooth 3D Extruded Heart Shape
      const heartShape = new THREE.Shape();
      heartShape.moveTo(0, 0);
      heartShape.bezierCurveTo(0, -0.3, -0.6, -0.7, -0.75, -0.75);
      heartShape.bezierCurveTo(-1.1, -0.75, -1.1, 0, -1.1, 0);
      heartShape.bezierCurveTo(-1.1, 0.5, 0, 0.9, 0, 1.3);
      heartShape.bezierCurveTo(0, 0.9, 1.1, 0.5, 1.1, 0);
      heartShape.bezierCurveTo(1.1, 0, 1.1, -0.75, 0.75, -0.75);
      heartShape.bezierCurveTo(0.6, -0.75, 0, -0.3, 0, 0);

      const extrudeSettings = {
        depth: 0.35,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.1,
        bevelThickness: 0.12
      };

      const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      heartGeo.center();
      heartGeo.rotateZ(Math.PI);

      for (const disc of DISCOVERIES) {
        const grp = new THREE.Group();
        grp.position.copy(disc.position);

        // 3D Shiny Crystal Heart Mesh
        const heartMat = new THREE.MeshStandardMaterial({
          color: disc.color,
          roughness: 0.15,
          metalness: 0.4,
          emissive: new THREE.Color(disc.color).multiplyScalar(0.5),
          side: THREE.DoubleSide
        });
        const heart = new THREE.Mesh(heartGeo, heartMat);
        grp.add(heart);

        // Surrounding Glass Bubble Capsule
        const bubbleMat = new THREE.MeshStandardMaterial({
          color: disc.color,
          transparent: true,
          opacity: 0.28,
          roughness: 0.1,
          metalness: 0.8,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const glassBubble = new THREE.Mesh(new THREE.SphereGeometry(2.2, 20, 20), bubbleMat);
        grp.add(glassBubble);

        // Soft Localized Glow (No floor washout)
        const light = new THREE.PointLight(disc.color, 1.5, 12);
        grp.add(light);

        grp.userData = { id: disc.id, glassBubble, heart, light, basePos: disc.position.clone() };
        if (disc.found) grp.visible = false;
        this.scene.add(grp);
        this.discoveryObjects.push(grp);
      }
    }

    // ============================================
    // Universal Controls
    // ============================================
    setupControls() {
      const canvas = this.renderer.domElement;
      this._moveKeys = { forward: false, backward: false, left: false, right: false };

      if (this.isTouchDevice) {
        const mc = document.getElementById('mobile-controls');
        if (mc) mc.style.display = 'flex';
        this.setupJoystick();
      }

      canvas.addEventListener('click', () => {
        if (this.isStarted && !this.showingDiscovery && !this.isPhotoMode) {
          const g = document.getElementById('gallery-modal');
          if (g && g.classList.contains('hidden')) {
            try { canvas.requestPointerLock(); } catch (e) { }
          }
        }
      });

      // WASD / Arrow Key Controls
      document.addEventListener('keydown', (e) => {
        if (!this.isStarted) return;
        switch (e.code) {
          case 'KeyW': case 'ArrowUp': this._moveKeys.forward = true; break;
          case 'KeyS': case 'ArrowDown': this._moveKeys.backward = true; break;
          case 'KeyA': case 'ArrowLeft': this._moveKeys.left = true; break;
          case 'KeyD': case 'ArrowRight': this._moveKeys.right = true; break;
        }
        if (e.key.toLowerCase() === 'p') this.takeScreenshot();
        if (e.key.toLowerCase() === 'f') this.togglePhotoMode();
      });
      document.addEventListener('keyup', (e) => {
        switch (e.code) {
          case 'KeyW': case 'ArrowUp': this._moveKeys.forward = false; break;
          case 'KeyS': case 'ArrowDown': this._moveKeys.backward = false; break;
          case 'KeyA': case 'ArrowLeft': this._moveKeys.left = false; break;
          case 'KeyD': case 'ArrowRight': this._moveKeys.right = false; break;
        }
      });

      let isMouseDown = false;
      let lastMouseX = 0, lastMouseY = 0;

      canvas.addEventListener('mousedown', (e) => {
        if (!this.isStarted || this.showingDiscovery) return;
        isMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      });
      document.addEventListener('mouseup', () => { isMouseDown = false; });

      document.addEventListener('mousemove', (e) => {
        if (!this.isStarted || this.showingDiscovery) return;
        if (document.pointerLockElement === canvas) {
          this.euler.y -= e.movementX * CONFIG.player.sensitivity;
          this.euler.x -= e.movementY * CONFIG.player.sensitivity;
          this.euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.euler.x));
        } else if (isMouseDown) {
          const dx = e.clientX - lastMouseX;
          const dy = e.clientY - lastMouseY;
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          this.euler.y -= dx * 0.003;
          this.euler.x -= dy * 0.003;
          this.euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.euler.x));
        }
      });

      let touchStartX = 0, touchStartY = 0, isTouchDragging = false;
      canvas.addEventListener('touchstart', (e) => {
        if (!this.isStarted || this.showingDiscovery) return;
        const touch = e.touches[0];
        if (e.target.closest('#mobile-controls') || e.target.closest('.btn-glass') || e.target.closest('.modal')) return;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isTouchDragging = true;
      }, { passive: true });

      canvas.addEventListener('touchmove', (e) => {
        if (!this.isStarted || !isTouchDragging || this.showingDiscovery) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        this.euler.y -= dx * 0.004;
        this.euler.x -= dy * 0.004;
        this.euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.euler.x));
      }, { passive: true });

      canvas.addEventListener('touchend', () => { isTouchDragging = false; });

      document.addEventListener('wheel', (e) => {
        if (!this.isStarted || this.showingDiscovery) return;
        e.preventDefault();
        this.targetSpeed -= e.deltaY * 0.005;
        this.targetSpeed = Math.max(CONFIG.player.minSpeed, Math.min(CONFIG.player.maxSpeed, this.targetSpeed));
      }, { passive: false });

      const btnUp = document.getElementById('btn-speed-up');
      if (btnUp) {
        btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); this.targetSpeed = Math.min(CONFIG.player.maxSpeed, this.targetSpeed + 0.5); });
        btnUp.addEventListener('mousedown', (e) => { e.preventDefault(); this.targetSpeed = Math.min(CONFIG.player.maxSpeed, this.targetSpeed + 0.5); });
      }
      const btnDown = document.getElementById('btn-speed-down');
      if (btnDown) {
        btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); this.targetSpeed = Math.max(CONFIG.player.minSpeed, this.targetSpeed - 0.5); });
        btnDown.addEventListener('mousedown', (e) => { e.preventDefault(); this.targetSpeed = Math.max(CONFIG.player.minSpeed, this.targetSpeed - 0.5); });
      }
    }

    setupJoystick() {
      const zone = document.getElementById('joystick-zone');
      if (!zone || !window.nipplejs) return;

      // Remove old custom visual if exists
      const old = document.getElementById('js-vis');
      if (old) old.remove();

      // Dynamic nipplejs: appears where you touch on the left half
      this._oceanJoystick = nipplejs.create({
        zone: zone,
        mode: 'dynamic',
        color: '#ff69b4',
        size: 120,
        fadeTime: 200
      });

      this._oceanJoystick.on('move', (evt, data) => {
        if (this.showingDiscovery) return;
        const force = Math.min(data.force, 2);
        const angle = data.angle.radian;
        // Use joystick to steer camera direction
        this.euler.y -= Math.cos(angle) * force * 0.003;
        this.euler.x += Math.sin(angle) * force * 0.003;
        this.euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.euler.x));
      });

      this._oceanJoystick.on('end', () => {
        // Nothing to reset - steering stops naturally
      });

      // Speed buttons are handled in setupControls() - no duplication here
    }

    setupUI() {
      document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.isStarted = true;
        this.targetSpeed = CONFIG.player.defaultSpeed;
        if (!this.isTouchDevice) {
          try { this.renderer.domElement.requestPointerLock(); } catch (e) { }
        }
      });

      document.getElementById('memory-close-btn').addEventListener('click', () => {
        // Properly stop all videos/audio before removing
        const mediaContainer = document.getElementById('memory-media');
        const videos = mediaContainer.querySelectorAll('video');
        videos.forEach(v => { v.pause(); v.src = ''; v.load(); });
        mediaContainer.innerHTML = '';
        document.getElementById('memory-modal').classList.add('hidden');
        this.showingDiscovery = false;
        this.targetSpeed = CONFIG.player.defaultSpeed;
        if (this.discoveredCount >= DISCOVERIES.length) {
          document.getElementById('celebration-modal').classList.remove('hidden');
        } else if (!this.isTouchDevice) {
          try { this.renderer.domElement.requestPointerLock(); } catch (e) { }
        }
      });

      document.getElementById('gallery-btn').addEventListener('click', () => {
        if (!this.virtualMuseum) {
          this.virtualMuseum = new VirtualMuseum(this);
        }
        this.virtualMuseum.openMuseum();
        if (document.pointerLockElement) document.exitPointerLock();
      });

      document.getElementById('gallery-close-btn').addEventListener('click', () => {
        document.getElementById('gallery-modal').classList.add('hidden');
        if (!this.showingDiscovery && !this.isTouchDevice) {
          try { this.renderer.domElement.requestPointerLock(); } catch (e) { }
        }
      });

      const envBtn = document.getElementById('envelope-btn');
      const letterModal = document.getElementById('love-letter-modal');
      const letterCloseBtn = document.getElementById('letter-close-btn');
      const letterStartBtn = document.getElementById('letter-start-btn');

      if (envBtn && letterModal) {
        envBtn.addEventListener('click', () => {
          letterModal.classList.remove('hidden');
        });
      }
      if (letterCloseBtn && letterModal) {
        letterCloseBtn.addEventListener('click', () => {
          letterModal.classList.add('hidden');
        });
      }
      if (letterStartBtn && letterModal) {
        letterStartBtn.addEventListener('click', () => {
          letterModal.classList.add('hidden');
          document.getElementById('landing-page').classList.add('hidden');
          document.getElementById('hud').classList.remove('hidden');
          this.isStarted = true;
          this.targetSpeed = CONFIG.player.defaultSpeed;
          if (!this.isTouchDevice) {
            try { this.renderer.domElement.requestPointerLock(); } catch (e) { }
          }
        });
      }

      document.getElementById('celebration-close-btn').addEventListener('click', () => {
        document.getElementById('celebration-modal').classList.add('hidden');
        document.getElementById('gallery-modal').classList.remove('hidden');
        this.renderGallery();
      });

      if (!document.getElementById('proximity-indicator')) {
        const prox = document.createElement('div');
        prox.id = 'proximity-indicator';
        prox.className = 'hidden';
        prox.style.cssText = 'position:absolute; bottom:20%; left:50%; transform:translateX(-50%); background:rgba(255,255,255,0.25); padding:10px 20px; border-radius:20px; font-weight:bold; pointer-events:none; z-index:10; border:1px solid rgba(255,255,255,0.5); text-shadow:1px 1px 2px black;';
        prox.innerHTML = '💖 ความทรงจำอยู่ใกล้ๆ!';
        document.getElementById('hud').appendChild(prox);
      }
    }

    setupBGM() {
      this.bgmPlaying = false;
      this.audioCtx = null;
      const btn = document.getElementById('bgm-toggle-btn');
      if (btn) {
        btn.addEventListener('click', () => this.toggleBGM());
      }
    }

    toggleBGM() {
      const btn = document.getElementById('bgm-toggle-btn');
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }

      if (this.bgmPlaying) {
        this.bgmPlaying = false;
        if (this.audioCtx) this.audioCtx.suspend();
        if (btn) btn.textContent = '🎵 เสียงดนตรี: ปิด';
      } else {
        this.bgmPlaying = true;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        this.playAmbientBGM();
        if (btn) btn.textContent = '🎶 เสียงดนตรี: เปิด';
      }
    }

    playAmbientBGM() {
      if (!this.bgmPlaying || !this.audioCtx) return;
      
      const freqs = [261.63, 329.63, 392.00, 523.25]; // C major 7 romantic chord
      const now = this.audioCtx.currentTime;
      
      freqs.forEach((f, idx) => {
        try {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f * (1 + Math.sin(now * 0.5 + idx) * 0.01), now);
          
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.exponentialRampToValueAtTime(0.04, now + 2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 5.5);
          
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          
          osc.start(now);
          osc.stop(now + 6);
        } catch(e) {}
      });

      setTimeout(() => {
        if (this.bgmPlaying) this.playAmbientBGM();
      }, 5000);
    }

    setupMinimap() {
      const btn = document.getElementById('minimap-toggle-btn');
      const closeBtn = document.getElementById('minimap-close-btn');
      const modal = document.getElementById('minimap-modal');

      if (btn) {
        btn.addEventListener('click', () => {
          if (modal) modal.classList.remove('hidden');
          this.drawMinimap();
          if (document.pointerLockElement) document.exitPointerLock();
        });
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          if (modal) modal.classList.add('hidden');
        });
      }
    }

    drawMinimap() {
      const canvas = document.getElementById('minimap-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const mapRadius = CONFIG.world.size * 0.8;

      ctx.clearRect(0, 0, w, h);

      // Radar background
      ctx.fillStyle = '#0a1423';
      ctx.fillRect(0, 0, w, h);

      // Radar rings
      ctx.strokeStyle = 'rgba(255, 105, 180, 0.25)';
      ctx.lineWidth = 1;
      for (let r = 40; r < w / 2; r += 40) {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw DISCOVERIES
      for (let i = 0; i < DISCOVERIES.length; i++) {
        const d = DISCOVERIES[i];
        const mapX = w / 2 + (d.position.x / mapRadius) * (w / 2 - 20);
        const mapY = h / 2 + (d.position.z / mapRadius) * (h / 2 - 20);

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.found ? '💛' : '💖', mapX, mapY);
      }

      // Draw Player Position & Direction
      const pX = w / 2 + (this.camera.position.x / mapRadius) * (w / 2 - 20);
      const pY = h / 2 + (this.camera.position.z / mapRadius) * (w / 2 - 20);

      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(pX, pY, 6, 0, Math.PI * 2);
      ctx.fill();

      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);
      ctx.strokeStyle = '#ff69b4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(pX + camDir.x * 16, pY + camDir.z * 16);
      ctx.stroke();
    }

    takeScreenshot() {
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:white; z-index:9999; pointer-events:none; transition:opacity 0.5s;';
      document.body.appendChild(flash);
      setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 500); }, 50);
      this.renderer.render(this.scene, this.camera);
      const link = document.createElement('a');
      link.download = `ocean-memory-${Date.now()}.png`;
      link.href = this.renderer.domElement.toDataURL('image/png');
      link.click();
      this.showNotification('📸 บันทึกภาพเรียบร้อยแล้ว!');
    }

    togglePhotoMode() {
      this.isPhotoMode = !this.isPhotoMode;
      const hud = document.getElementById('hud');
      const polaroid = document.getElementById('polaroid-overlay');

      if (this.isPhotoMode) {
        if (hud) hud.style.opacity = '0';
        if (polaroid) polaroid.classList.remove('hidden');
        this.showNotification('📷 โหมดถ่ายภาพ (โพลารอยด์) เปิดใช้งาน - กด P บันทึกภาพ');
      } else {
        if (hud) hud.style.opacity = '1';
        if (polaroid) polaroid.classList.add('hidden');
      }
    }

    showNotification(text) {
      let n = document.getElementById('notification');
      if (!n) {
        n = document.createElement('div');
        n.id = 'notification';
        n.style.cssText = 'position:fixed; top:20px; right:20px; background:rgba(0,0,0,0.6); padding:15px; border-radius:10px; z-index:999; transition:opacity 0.3s; pointer-events:none;';
        document.body.appendChild(n);
      }
      n.textContent = text;
      n.style.opacity = '1';
      setTimeout(() => n.style.opacity = '0', 2500);
    }

    setupGallery() {
      const grid = document.getElementById('gallery-grid');
      grid.innerHTML = '';
      for (let i = 0; i < 33; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item locked';
        item.id = `gallery-item-${i}`;
        grid.appendChild(item);
      }
    }

    renderGallery() {
      DISCOVERIES.forEach((disc, i) => {
        const item = document.getElementById(`gallery-item-${i}`);
        if (disc.found) {
          item.classList.remove('locked');
          item.innerHTML = '';
          const aLower = disc.asset.toLowerCase();
          if (aLower.endsWith('.mp4') || aLower.endsWith('.mov')) {
            const v = document.createElement('video');
            v.src = `assets/${disc.asset}`;
            v.muted = true;
            v.loop = true;
            v.play();
            item.appendChild(v);
          } else {
            const img = document.createElement('img');
            img.src = `assets/${disc.asset}`;
            item.appendChild(img);
          }
          item.onclick = () => this.showMemory(disc);
        }
      });
    }

    checkDiscoveries() {
      if (this.showingDiscovery) return;
      let nearestDist = Infinity;
      let nearestObj = null;

      for (let i = 0; i < DISCOVERIES.length; i++) {
        const d = DISCOVERIES[i];
        if (d.found) continue;
        const dist = this.camera.position.distanceTo(d.position);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestObj = d;
        }

        if (dist < CONFIG.player.discoveryRadius) {
          this.triggerMiniGame(d, i);
          return;
        }
      }

      // Update Heart Compass Radar
      const radarText = document.getElementById('radar-text');
      const compassArrow = document.getElementById('compass-arrow');
      if (nearestObj && radarText && compassArrow) {
        radarText.textContent = `หัวใจถัดไป: ${Math.round(nearestDist)} ม.`;
        
        const targetDir = new THREE.Vector3().subVectors(nearestObj.position, this.camera.position).normalize();
        const camDir = new THREE.Vector3();
        this.camera.getWorldDirection(camDir);
        
        const crossY = camDir.x * targetDir.z - camDir.z * targetDir.x;
        const dot = camDir.x * targetDir.x + camDir.z * targetDir.z;
        const angleDeg = Math.atan2(crossY, dot) * (180 / Math.PI);
        
        compassArrow.style.transform = `rotate(${angleDeg}deg)`;
      } else if (radarText) {
        radarText.textContent = '💖 เก็บหัวใจครบแล้ว!';
      }

      const ind = document.getElementById('proximity-indicator');
      if (ind) {
        if (nearestDist < CONFIG.player.proximityRadius) ind.classList.remove('hidden');
        else ind.classList.add('hidden');
      }
    }

    triggerMiniGame(disc, index) {
      this.showingDiscovery = true;
      this.targetSpeed = 0;
      if (document.pointerLockElement) document.exitPointerLock();

      const ind = document.getElementById('proximity-indicator');
      if (ind) ind.classList.add('hidden');

      const modal = document.getElementById('minigame-modal');
      document.getElementById('minigame-title').textContent = disc.minigame.title;
      document.getElementById('minigame-instruction').textContent = disc.minigame.instruction;
      const container = document.getElementById('minigame-container');
      container.innerHTML = '';
      modal.classList.remove('hidden');

      disc.minigame.init(container, () => {
        modal.classList.add('hidden');
        this.unlockMemory(disc, index);
      });
    }

    unlockMemory(disc, index) {
      disc.found = true;
      this.discoveredCount++;
      document.getElementById('hud-collected').textContent = this.discoveredCount;
      const obj = this.discoveryObjects[index];
      if (obj) obj.visible = false;
      this.saveProgress();
      this.showMemory(disc);
    }

    saveProgress() {
      try {
        const progress = DISCOVERIES.map(d => d.found);
        localStorage.setItem('ocean_memories_progress', JSON.stringify(progress));
      } catch (e) {
        console.warn('Cannot save progress:', e);
      }
    }

    showMemory(disc) {
      if (!this.showingDiscovery && document.pointerLockElement) document.exitPointerLock();
      document.getElementById('memory-index').textContent = `${disc.id + 1}/33`;
      const mediaContainer = document.getElementById('memory-media');
      mediaContainer.innerHTML = '';

      const LOVE_MESSAGES = [
        "ขอบคุณสำหรับรอยยิ้มแรกที่ทำให้ตกหลุมรักหนูนะ ❤️",
        "7 เดือนแล้ว ไวเหมือนกันเนอะ ขอบคุณที่อยู่ด้วยกันมาตลอดนะ",
        "คบกันมา 7 เดือน มีเรื่องสนุกๆ และเสียงหัวเราะเยอะแยะเลย",
        "จำรูปนี้ได้ไหม ตอนนั้นยิ้มแย้มกันน่ารักเชียว 😄",
        "ขอบคุณที่คอยเป็นกำลังใจและอยู่ข้างๆ กันเสมอนะครับ 💕",
        "เห็นรูปนี้ทีไรก็แอบอมยิ้มทุกที น่ารักตลอดเลยนะหนู",
        "ขอบคุณที่คอยดูแลและใส่ใจกันในทุกๆ วันนะ",
        "ถึงจะแอบมีงอนกันบ้าง แต่ก็รักหนูคนเดียวเหมือนเดิมนะ",
        "เวลาได้คุยกับหนูแล้วมันทำให้หายเหนื่อยจริงๆ นะ",
        "ขอบคุณที่คอยส่งยิ้มหวานๆ ให้ได้อมยิ้มก่อนนอนเสมอ",
        "หนูเป็นทั้งแฟนและเพื่อนคู่คิดที่ดีที่สุดเลยรู้ไหม",
        "นับถอยหลังรอไปเที่ยวและกินของอร่อยๆ ด้วยกันทริปถัดไปนะ",
        "ขอบคุณที่รับฟังพี่บ่นได้ทุกเรื่องเลยนะคนดี 💕",
        "7 เดือนที่ผ่านมา มีแต่ความทรงจำน่ารักๆ เต็มไปหมด",
        "ขอบคุณที่เป็นเซฟโซนที่สบายใจที่สุดเสมอนะ",
        "รักหนูนะ ❤️ พี่จะคอยดูแลหนูให้ดีที่สุดเสมอ",
        "ทุกคำพูดน่ารักๆ ของหนู ทำให้พี่อมยิ้มได้ตลอดเลย",
        "ขอบคุณที่เข้าใจและคอยอยู่ซัพพอร์ตกันตลอดนะ",
        "เหนื่อยแค่ไหน แค่ได้คุยกับหนูก็สบายใจขึ้นทันทีเลย",
        "ขอให้เราจับมือคบกันไปนานๆ มีวันครบรอบด้วยกันอีกหลายๆ ปีนะ",
        "ขอบคุณสำหรับความไว้ใจและความรักที่มีให้กันเสมอ",
        "หนูเป็นคนเก่งเสมอเลยนะครับ ตั้งใจทำอะไรก็สำเร็จแน่นอน ✨",
        "น่ารักขนาดนี้ จะไม่ให้หลงได้ยังไงเนอะ 😄",
        "อยากไปเก็บความทรงจำและถ่ายรูปคู่กันเยอะๆ อีกจัง",
        "ขอบคุณที่คอยสร้างเสียงหัวเราะให้ในทุกๆ วันนะ",
        "ทุกช่วงเวลาที่คบกันมา มีค่ามากเลยนะ",
        "รักหนูมากๆ นะครับ ยิ้มหวานของพี่ 💕",
        "สัญญาว่าจะใส่ใจและดูแลความรักของเราให้ดีที่สุด",
        "หนูคือเรื่องราวที่ดีที่สุดเรื่องหนึ่งในชีวิตเลยนะ",
        "สุขสันต์วันครบรอบ 7 เดือนนะ ❤️",
        "มหาสมุทรแห่งความทรงจำนี้ รวมเรื่องราวของเราสองคนไว้ทั้งหมดเลย",
        "อยู่เป็นความสดใสให้กันแบบนี้ไปนานๆ นะ ❤️",
        "รักที่สุดในโลกเลยครับ ❤️"
      ];

      const captionEl = document.getElementById('memory-caption');
      if (captionEl) {
        captionEl.textContent = LOVE_MESSAGES[disc.id % LOVE_MESSAGES.length];
      }

      const aLower = disc.asset.toLowerCase();
      if (aLower.endsWith('.mp4') || aLower.endsWith('.mov')) {
        const v = document.createElement('video');
        v.src = `assets/${disc.asset}`;
        v.controls = true;
        v.autoplay = true;
        mediaContainer.appendChild(v);
      } else {
        const img = document.createElement('img');
        img.src = `assets/${disc.asset}`;
        mediaContainer.appendChild(img);
      }
      document.getElementById('memory-modal').classList.remove('hidden');
    }

    // ============================================
    // Smooth Animation Loop with Organic Sway Physics
    // ============================================
    animate() {
      requestAnimationFrame(() => this.animate());

      // Skip heavy ocean rendering when museum is open
      if (this.virtualMuseum && this.virtualMuseum.active) {
        return;
      }

      const delta = Math.min(this.clock.getDelta(), 0.05);
      const time = this.clock.elapsedTime;

      if (this.isStarted) {
        this.moveSpeed += (this.targetSpeed - this.moveSpeed) * CONFIG.player.smoothing;
        this.camera.quaternion.setFromEuler(this.euler);
        this.direction.set(0, 0, -1).applyQuaternion(this.camera.quaternion);

        // Forward/backward auto-movement + WASD strafe
        this.camera.position.addScaledVector(this.direction, this.moveSpeed * delta);

        if (this._moveKeys) {
          const right = new THREE.Vector3().crossVectors(this.direction, new THREE.Vector3(0, 1, 0)).normalize();
          const strafeSpeed = 8 * delta;
          if (this._moveKeys.forward) this.camera.position.addScaledVector(this.direction, strafeSpeed);
          if (this._moveKeys.backward) this.camera.position.addScaledVector(this.direction, -strafeSpeed);
          if (this._moveKeys.left) this.camera.position.addScaledVector(right, -strafeSpeed);
          if (this._moveKeys.right) this.camera.position.addScaledVector(right, strafeSpeed);
        }

        const hs = CONFIG.world.size * 0.85;
        this.camera.position.x = Math.max(-hs, Math.min(hs, this.camera.position.x));
        this.camera.position.y = Math.max(2, Math.min(CONFIG.world.depth - 2, this.camera.position.y));
        this.camera.position.z = Math.max(-hs, Math.min(hs, this.camera.position.z));

        // Throttle discovery check DOM updates to every 6 frames
        this._frameCount = (this._frameCount || 0) + 1;
        if (this._frameCount % 6 === 0) {
          this.checkDiscoveries();
        }
      }

      // Update creatures & environment
      this.updateFish(delta);
      this.updateJellyfish(delta);
      this.updateDust(delta, time);
      this.updateBubbles(delta, time);
      this.updateGodRays(time);
      this.updateCaustics(time);
      this.updateSparkles(time);

      // Smooth Organic Kelp Sway
      for (let i = 0; i < this.seaweedMeshes.length; i++) {
        const sw = this.seaweedMeshes[i];
        sw.rotation.x = Math.sin(time * sw.userData.swaySpeed + sw.userData.offset) * 0.12;
        sw.rotation.z = Math.cos(time * sw.userData.swaySpeed * 0.7 + sw.userData.offset) * 0.08;
      }

      // Anemones Sway
      for (let i = 0; i < this.anemones.length; i++) {
        const an = this.anemones[i];
        for (let t = 0; t < an.userData.tentacles.length; t++) {
          const tentacle = an.userData.tentacles[t];
          tentacle.rotation.x = tentacle.userData.baseRotX + Math.sin(time * 2.2 + tentacle.userData.offset) * 0.2;
          tentacle.rotation.z = tentacle.userData.baseRotZ + Math.cos(time * 2.2 + tentacle.userData.offset) * 0.2;
        }
      }

      // 3D Extruded Crystal Hearts floating & spinning
      for (let i = 0; i < this.discoveryObjects.length; i++) {
        const obj = this.discoveryObjects[i];
        if (!obj.visible) continue;
        obj.position.y = obj.userData.basePos.y + Math.sin(time * 1.8 + obj.userData.id) * 0.6;
        obj.userData.heart.rotation.y = time * 1.5;
        obj.userData.glassBubble.scale.setScalar(1 + Math.sin(time * 2.5) * 0.08);
      }

      this.renderer.render(this.scene, this.camera);
    }

    updateFish(delta) {
      const tv = new THREE.Vector3();
      const sep = new THREE.Vector3(), ali = new THREE.Vector3(), coh = new THREE.Vector3();
      for (let s = 0; s < this.fishSchools.length; s++) {
        const school = this.fishSchools[s];
        for (let i = 0; i < school.length; i++) {
          const fish = school[i];
          sep.set(0, 0, 0); ali.set(0, 0, 0); coh.set(0, 0, 0);
          let sc = 0, nc = 0;
          for (let o = 0; o < school.length; o++) {
            if (o === i) continue;
            const other = school[o];
            const d = fish.position.distanceTo(other.position);
            if (d < CONFIG.fish.separationDist) {
              tv.subVectors(fish.position, other.position).normalize().divideScalar(Math.max(d, 0.5));
              sep.add(tv); sc++;
            }
            if (d < CONFIG.fish.cohesionDist) {
              ali.add(other.userData.velocity);
              coh.add(other.position); nc++;
            }
          }
          if (sc > 0) sep.divideScalar(sc);
          if (nc > 0) {
            ali.divideScalar(nc).normalize().multiplyScalar(CONFIG.fish.speed).sub(fish.userData.velocity);
            coh.divideScalar(nc).sub(fish.position);
          }
          const bounds = new THREE.Vector3();
          const hs = CONFIG.world.size * 0.7;
          if (fish.position.x < -hs) bounds.x += 2; if (fish.position.x > hs) bounds.x -= 2;
          if (fish.position.y < 3) bounds.y += 2; if (fish.position.y > CONFIG.world.depth - 5) bounds.y -= 2;
          if (fish.position.z < -hs) bounds.z += 2; if (fish.position.z > hs) bounds.z -= 2;
          tv.subVectors(fish.userData.schoolCenter, fish.position).multiplyScalar(0.01);
          bounds.add(tv);

          const pd = fish.position.distanceTo(this.camera.position);
          if (pd < 10) {
            tv.subVectors(fish.position, this.camera.position).normalize().multiplyScalar(5);
            bounds.add(tv);
          }

          fish.userData.velocity
            .add(sep.multiplyScalar(CONFIG.fish.separationWeight * delta))
            .add(ali.multiplyScalar(CONFIG.fish.alignmentWeight * delta))
            .add(coh.multiplyScalar(CONFIG.fish.cohesionWeight * delta))
            .add(bounds.multiplyScalar(CONFIG.fish.boundsWeight * delta));

          const sp = fish.userData.velocity.length();
          if (sp > CONFIG.fish.speed * 1.5) fish.userData.velocity.multiplyScalar(CONFIG.fish.speed * 1.5 / sp);
          else if (sp < CONFIG.fish.speed * 0.5) fish.userData.velocity.normalize().multiplyScalar(CONFIG.fish.speed * 0.5);

          fish.position.add(tv.copy(fish.userData.velocity).multiplyScalar(delta));
          fish.lookAt(tv.copy(fish.position).add(fish.userData.velocity));
          if (fish.userData.tail) {
            fish.userData.tail.rotation.y = Math.PI / 2 + Math.sin(this.clock.elapsedTime * CONFIG.fish.tailSpeed + fish.userData.offset) * CONFIG.fish.tailAmplitude;
          }
        }
      }
    }

    updateJellyfish(delta) {
      const time = this.clock.elapsedTime;
      for (let i = 0; i < this.jellyfish.length; i++) {
        const jelly = this.jellyfish[i];
        const t = time * jelly.userData.pulseSpeed + jelly.userData.offset;
        const pulse = 1 + Math.sin(t) * 0.15;
        if (jelly.userData.bell) jelly.userData.bell.scale.set(pulse, 1 / pulse, pulse);
        jelly.position.y = jelly.userData.baseY + Math.sin(t * 0.5) * 2;
        if (jelly.userData.light) jelly.userData.light.intensity = 0.4 + Math.sin(t * 2) * 0.4;
      }
    }

    updateDust(delta, t) {
      if (!this.dustSystem) return;
      const pos = this.dustSystem.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + Math.sin(t * 0.2 + i) * 0.02;
        if (y < 0 || y > CONFIG.world.depth) y = Math.random() * CONFIG.world.depth;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    updateBubbles(delta, t) {
      if (!this.bubbleSystem) return;
      const pos = this.bubbleSystem.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + CONFIG.bubbles.speed * delta;
        if (y > CONFIG.world.depth + 5) y = -2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    updateSparkles(t) {
      if (!this.sparkleSystem) return;
      const mat = this.sparkleSystem.material;
      mat.opacity = 0.55 + Math.sin(t * 1.6) * 0.3;
      this.sparkleSystem.rotation.y = t * 0.01;
    }

    updateGodRays(t) {
      for (let i = 0; i < this.godRays.length; i++) {
        const ray = this.godRays[i];
        ray.material.opacity = ray.userData.baseOpacity * (0.4 + 0.6 * Math.sin(t * ray.userData.speed + ray.userData.offset));
      }
    }

    updateCaustics(t) {
      for (let i = 0; i < this.causticLights.length; i++) {
        const c = this.causticLights[i];
        const v = Math.sin(t * c.userData.speed + c.userData.offset);
        c.material.opacity = c.userData.baseOpacity * (0.3 + 0.7 * Math.abs(v));
      }
    }

    onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      if (this.virtualMuseum) this.virtualMuseum.onResize();
    }
  }

  // ============================================
  // 3D Virtual Museum Engine
  // ============================================
  class VirtualMuseum {
    constructor(parentApp) {
      this.app = parentApp;
      this.active = false;
      this.explored = new Set();
      this.container = document.getElementById('museum-canvas-container');
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.exhibits = [];
      this.inspectingIndex = -1;

      this.moveState = { forward: false, backward: false, left: false, right: false };
      this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
      this.nearExhibit = null;

      this.inspectScene = null;
      this.inspectCamera = null;
      this.inspectRenderer = null;
      this.inspectFrameMesh = null;
      this.isDraggingInspect = false;
      this.previousMousePosition = { x: 0, y: 0 };
    }

    init() {
      if (this.renderer) return;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x060914);
      this.scene.fog = new THREE.FogExp2(0x060914, 0.015);

      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
      this.camera.position.set(0, 2.2, 22);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio((this.app && this.app.isTouchDevice) ? 1.0 : Math.min(window.devicePixelRatio, 2));
      // Disable shadows on mobile for performance
      this.renderer.shadowMap.enabled = !(this.app && this.app.isTouchDevice);
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.container.appendChild(this.renderer.domElement);

      this.buildMuseumRoom();
      this.buildExhibits();
      this.setupControls();
      this.setupInspector();
    }

    buildMuseumRoom() {
      // Romantic Dark Elegant Gallery Upgrade
      this.scene.background = new THREE.Color(0x050811);
      this.scene.fog = new THREE.FogExp2(0x050811, 0.015);

      // Deep dark reflective floor
      const floorGeo = new THREE.PlaneGeometry(50, 70);
      const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x070a12, // Very dark blue/black
        roughness: 0.05, // Highly polished
        metalness: 0.8 
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      // Elegant grid to simulate large tiles
      const grid = new THREE.GridHelper(70, 14, 0x1f2937, 0x111827);
      grid.position.y = 0.01;
      this.scene.add(grid);

      // Rich Navy Walls
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.2 });
      
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(50, 15), wallMat);
      backWall.position.set(0, 7.5, -34);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(50, 15), wallMat);
      frontWall.position.set(0, 7.5, 34);
      frontWall.rotation.y = Math.PI;
      this.scene.add(frontWall);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(68, 15), wallMat);
      leftWall.position.set(-24, 7.5, 0);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.receiveShadow = true;
      this.scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(68, 15), wallMat);
      rightWall.position.set(24, 7.5, 0);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.receiveShadow = true;
      this.scene.add(rightWall);

      // Dark Ceiling
      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(50, 68), new THREE.MeshBasicMaterial({ color: 0x020408 }));
      ceiling.position.y = 15;
      ceiling.rotation.x = Math.PI / 2;
      this.scene.add(ceiling);

      // Elegant Gold Accent Lines (Cove Lighting illusion) — glowing brushed gold
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffaa00, emissiveIntensity: 1.4, roughness: 0.25, metalness: 0.9 });
      const topTrimL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 68), goldMat);
      topTrimL.position.set(-23.9, 14.5, 0);
      this.scene.add(topTrimL);

      const topTrimR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 68), goldMat);
      topTrimR.position.set(23.9, 14.5, 0);
      this.scene.add(topTrimR);

      const topTrimB = new THREE.Mesh(new THREE.BoxGeometry(50, 0.12, 0.12), goldMat);
      topTrimB.position.set(0, 14.5, -33.9);
      this.scene.add(topTrimB);
      this.museumGoldTrim = [topTrimL, topTrimR, topTrimB];

      // Majestic Centerpiece: Giant Glowing Heart
      const heartShape = new THREE.Shape();
      heartShape.moveTo(0, 0);
      heartShape.bezierCurveTo(0, -0.3, -0.6, -0.7, -0.75, -0.75);
      heartShape.bezierCurveTo(-1.1, -0.75, -1.1, 0, -1.1, 0);
      heartShape.bezierCurveTo(-1.1, 0.5, 0, 0.9, 0, 1.3);
      heartShape.bezierCurveTo(0, 0.9, 1.1, 0.5, 1.1, 0);
      heartShape.bezierCurveTo(1.1, 0, 1.1, -0.75, 0.75, -0.75);
      heartShape.bezierCurveTo(0.6, -0.75, 0, -0.3, 0, 0);
      const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };
      const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      heartGeo.center();
      heartGeo.rotateZ(Math.PI);
      const heartMat = new THREE.MeshStandardMaterial({ 
        color: 0xff1493, 
        emissive: 0xff1493, 
        emissiveIntensity: 0.6, 
        roughness: 0.2, 
        metalness: 0.5 
      });
      const centerHeart = new THREE.Mesh(heartGeo, heartMat);
      centerHeart.position.set(0, 6, -10);
      centerHeart.scale.set(3, 3, 3);
      centerHeart.castShadow = true;
      this.scene.add(centerHeart);
      this.centerHeart = centerHeart;

      // Classy Base for the heart
      const baseGeo = new THREE.CylinderGeometry(2, 2.5, 0.5, 32);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
      const heartBase = new THREE.Mesh(baseGeo, baseMat);
      heartBase.position.set(0, 0.25, -10);
      heartBase.receiveShadow = true;
      this.scene.add(heartBase);

      // Cozy Lighting Setup
      // Low Ambient light to keep shadows dramatic
      this.scene.add(new THREE.AmbientLight(0xffe6e6, 0.3));
      
      // Main overhead spotlight simulating a central chandelier
      const mainLight = new THREE.DirectionalLight(0xffebd6, 0.8);
      mainLight.position.set(0, 20, 0);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 50;
      mainLight.shadow.camera.left = -25;
      mainLight.shadow.camera.right = 25;
      mainLight.shadow.camera.top = 35;
      mainLight.shadow.camera.bottom = -35;
      mainLight.shadow.bias = -0.001;
      this.scene.add(mainLight);

      // Accent Lights for the walls (brings out the pictures) — warm candlelit gold
      const leftLight = new THREE.PointLight(0xffd9a0, 0.7, 40);
      leftLight.position.set(-15, 8, 0);
      this.scene.add(leftLight);
      
      const rightLight = new THREE.PointLight(0xffd9a0, 0.7, 40);
      rightLight.position.set(15, 8, 0);
      this.scene.add(rightLight);

      const backLight = new THREE.PointLight(0xffd9a0, 0.7, 30);
      backLight.position.set(0, 8, -25);
      this.scene.add(backLight);

      this.museumAccentLights = [leftLight, rightLight, backLight];
    }

    createCanvasPhotoTexture(assetName, index, isFound) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      if (!isFound) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 512; i += 40) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        }

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 12;
        ctx.strokeRect(10, 10, 492, 492);

        ctx.font = 'bold 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', 256, 210);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 30px Kanit, sans-serif';
        ctx.fillText(`ความทรงจำที่ ${index + 1}`, 256, 300);

        ctx.fillStyle = '#ff4785';
        ctx.font = '22px Kanit, sans-serif';
        ctx.fillText('🔒 ยังไม่ได้ปลดล็อค', 256, 360);
        ctx.fillStyle = '#64748b';
        ctx.font = '16px Kanit, sans-serif';
        ctx.fillText('(ต้องไปเก็บหัวใจด่านนี้ในทะเลก่อน)', 256, 400);

        return new THREE.CanvasTexture(canvas);
      }

      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#ff6b9e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 12;
      ctx.strokeRect(10, 10, 492, 492);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`💖 ความทรงจำที่ ${index + 1}`, 256, 220);

      ctx.font = '24px Kanit, sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`(กด Inspect เพื่อส่องดูรูปภาพ)`, 256, 290);

      ctx.font = '18px Kanit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(assetName, 256, 350);

      const aLower = assetName.toLowerCase();
      const isVideo = aLower.endsWith('.mp4') || aLower.endsWith('.mov');

      if (isVideo) {
        const video = document.createElement('video');
        video.src = `assets/${assetName}`;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.play().catch(() => {});
        const vTexture = new THREE.VideoTexture(video);
        vTexture.minFilter = THREE.LinearFilter;
        vTexture.magFilter = THREE.LinearFilter;
        return vTexture;
      }

      const texture = new THREE.CanvasTexture(canvas);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `assets/${assetName}`;
      img.onload = () => {
        ctx.drawImage(img, 20, 20, 472, 472);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, 472, 472);
        texture.needsUpdate = true;
      };

      return texture;
    }

    createCanvasBackNoteTexture(index, isFound) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#2d1b10';
      ctx.fillRect(0, 0, 512, 512);

      if (!isFound) {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 8;
        ctx.strokeRect(15, 15, 482, 482);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 28px Kanit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🔒 บันทึกรักยังไม่ปลดล็อค`, 256, 180);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '22px Kanit, sans-serif';
        ctx.fillText('ไปว่ายน้ำตามหาฟองหัวใจด่านที่ ' + (index + 1), 256, 250);
        ctx.fillText('ใต้ทะเลเพื่อเปิดอ่านข้อความนี้นะครับ ❤️', 256, 290);

        return new THREE.CanvasTexture(canvas);
      }

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 8;
      ctx.strokeRect(15, 15, 482, 482);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 28px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`💌 บันทึกรักความทรงจำที่ ${index + 1}`, 256, 80);

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 105);
      ctx.lineTo(452, 105);
      ctx.stroke();

      const LOVE_MESSAGES = [
        "ขอบคุณสำหรับรอยยิ้มแรกที่ทำให้ตกหลุมรักหนูนะ ❤️",
        "7 เดือนแล้ว ไวเหมือนกันเนอะ ขอบคุณที่อยู่ด้วยกันมาตลอดนะ",
        "คบกันมา 7 เดือน มีเรื่องสนุกๆ และเสียงหัวเราะเยอะแยะเลย",
        "จำรูปนี้ได้ไหม ตอนนั้นยิ้มแย้มกันน่ารักเชียว 😄",
        "ขอบคุณที่คอยเป็นกำลังใจและอยู่ข้างๆ กันเสมอนะครับ 💕",
        "เห็นรูปนี้ทีไรก็แอบอมยิ้มทุกที น่ารักตลอดเลยนะหนู",
        "ขอบคุณที่คอยดูแลและใส่ใจกันในทุกๆ วันนะ",
        "ถึงจะแอบมีงอนกันบ้าง แต่ก็รักหนูคนเดียวเหมือนเดิมนะ",
        "เวลาได้คุยกับหนูแล้วมันทำให้หายเหนื่อยจริงๆ นะ",
        "ขอบคุณที่คอยส่งยิ้มหวานๆ ให้ได้อมยิ้มก่อนนอนเสมอ",
        "หนูเป็นทั้งแฟนและเพื่อนคู่คิดที่ดีที่สุดเลยรู้ไหม",
        "นับถอยหลังรอไปเที่ยวและกินของอร่อยๆ ด้วยกันทริปถัดไปนะ",
        "ขอบคุณที่รับฟังพี่บ่นได้ทุกเรื่องเลยนะคนดี 💕",
        "7 เดือนที่ผ่านมา มีแต่ความทรงจำน่ารักๆ เต็มไปหมด",
        "ขอบคุณที่เป็นเซฟโซนที่สบายใจที่สุดเสมอนะ",
        "รักหนูนะ ❤️ พี่จะคอยดูแลหนูให้ดีที่สุดเสมอ",
        "ทุกคำพูดน่ารักๆ ของหนู ทำให้พี่อมยิ้มได้ตลอดเลย",
        "ขอบคุณที่เข้าใจและคอยอยู่ซัพพอร์ตกันตลอดนะ",
        "เหนื่อยแค่ไหน แค่ได้คุยกับหนูก็สบายใจขึ้นทันทีเลย",
        "ขอให้เราจับมือคบกันไปนานๆ มีวันครบรอบด้วยกันอีกหลายๆ ปีนะ",
        "ขอบคุณสำหรับความไว้ใจและความรักที่มีให้กันเสมอ",
        "หนูเป็นคนเก่งเสมอเลยนะครับ ตั้งใจทำอะไรก็สำเร็จแน่นอน ✨",
        "น่ารักขนาดนี้ จะไม่ให้หลงได้ยังไงเนอะ 😄",
        "อยากไปเก็บความทรงจำและถ่ายรูปคู่กันเยอะๆ อีกจัง",
        "ขอบคุณที่คอยสร้างเสียงหัวเราะให้ในทุกๆ วันนะ",
        "ทุกช่วงเวลาที่คบกันมา มีค่ามากเลยนะ",
        "รักหนูมากๆ นะครับ ยิ้มหวานของพี่ 💕",
        "สัญญาว่าจะใส่ใจและดูแลความรักของเราให้ดีที่สุด",
        "หนูคือเรื่องราวที่ดีที่สุดเรื่องหนึ่งในชีวิตเลยนะ",
        "สุขสันต์วันครบรอบ 7 เดือนนะ ❤️",
        "มหาสมุทรแห่งความทรงจำนี้ รวมเรื่องราวของเราสองคนไว้ทั้งหมดเลย",
        "อยู่เป็นความสดใสให้กันแบบนี้ไปนานๆนะ ❤️",
        "รักที่สุดในโลกเลยครับ ❤️"
      ];

      const text = LOVE_MESSAGES[index % LOVE_MESSAGES.length];
      ctx.fillStyle = '#ffffff';
      ctx.font = '22px Kanit, sans-serif';
      
      const words = text.split(' ');
      let line = '';
      let y = 160;

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > 420 && n > 0) {
          ctx.fillText(line, 256, y);
          line = words[n] + ' ';
          y += 38;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 256, y);

      ctx.fillStyle = '#ff6b9e';
      ctx.font = 'bold 24px Kanit, sans-serif';
      ctx.fillText('จั๊ม ❤️ ม่อน', 256, 440);

      return new THREE.CanvasTexture(canvas);
    }

    buildExhibits() {
      // Clear old exhibit meshes if any
      if (this.exhibits) {
        this.exhibits.forEach(e => this.scene.remove(e));
      }
      this.exhibits = [];
      const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.6 });

      const positions = [];

      // Left Wall (10)
      for (let i = 0; i < 10; i++) {
        positions.push({ x: -21.6, y: 2.8, z: -25 + i * 5.2, rotY: Math.PI / 2 });
      }
      // Back Wall (13)
      for (let i = 0; i < 13; i++) {
        positions.push({ x: -18 + i * 3.0, y: 2.8, z: -31.6, rotY: 0 });
      }
      // Right Wall (10)
      for (let i = 0; i < 10; i++) {
        positions.push({ x: 21.6, y: 2.8, z: -25 + i * 5.2, rotY: -Math.PI / 2 });
      }

      for (let i = 0; i < DISCOVERIES.length; i++) {
        const disc = DISCOVERIES[i];
        const isFound = disc.found;
        const pos = positions[i] || { x: 0, y: 2.8, z: 0, rotY: 0 };

        const frameColor = isFound ? 0xffd700 : 0x475569;
        const frameMat = new THREE.MeshStandardMaterial({ 
          color: frameColor, 
          roughness: isFound ? 0.3 : 0.7, 
          metalness: isFound ? 0.8 : 0.2,
          emissive: isFound ? 0x221100 : 0x000000 
        });

        const exhibitGroup = new THREE.Group();
        exhibitGroup.position.set(pos.x, pos.y, pos.z);
        exhibitGroup.rotation.y = pos.rotY;

        const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 0.15), frameMat);
        outerFrame.castShadow = true;
        exhibitGroup.add(outerFrame);

        const photoTex = this.createCanvasPhotoTexture(disc.asset, i, isFound);
        const frontCanvas = new THREE.Mesh(
          new THREE.PlaneGeometry(2.1, 2.1), 
          new THREE.MeshStandardMaterial({ 
            map: photoTex, 
            roughness: 0.3,
            emissive: isFound ? 0x111111 : 0x000000
          })
        );
        frontCanvas.position.z = 0.08;
        exhibitGroup.add(frontCanvas);

        const noteTex = this.createCanvasBackNoteTexture(i, isFound);
        const backCanvas = new THREE.Mesh(
          new THREE.PlaneGeometry(2.1, 2.1), 
          new THREE.MeshStandardMaterial({ 
            map: noteTex, 
            roughness: 0.5,
            emissive: isFound ? 0x111111 : 0x000000
          })
        );
        backCanvas.position.z = -0.08;
        backCanvas.rotation.y = Math.PI;
        exhibitGroup.add(backCanvas);

        const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 12), pedestalMat);
        pedestal.position.set(0, -1.6, 0);
        pedestal.castShadow = true;
        exhibitGroup.add(pedestal);

        exhibitGroup.userData = { index: i, discovery: disc, posInfo: pos, isFound: isFound };
        this.scene.add(exhibitGroup);
        this.exhibits.push(exhibitGroup);
      }
    }

    setupControls() {
      const onKeyDown = (e) => {
        if (!this.active) return;
        switch (e.code) {
          case 'KeyW': case 'ArrowUp': this.moveState.forward = true; break;
          case 'KeyS': case 'ArrowDown': this.moveState.backward = true; break;
          case 'KeyA': case 'ArrowLeft': this.moveState.left = true; break;
          case 'KeyD': case 'ArrowRight': this.moveState.right = true; break;
        }
      };

      const onKeyUp = (e) => {
        if (!this.active) return;
        switch (e.code) {
          case 'KeyW': case 'ArrowUp': this.moveState.forward = false; break;
          case 'KeyS': case 'ArrowDown': this.moveState.backward = false; break;
          case 'KeyA': case 'ArrowLeft': this.moveState.left = false; break;
          case 'KeyD': case 'ArrowRight': this.moveState.right = false; break;
        }
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);

      let isMouseDown = false;
      let prevMouse = { x: 0, y: 0 };

      const dom = this.container;

      if (this.app && !this.app.isTouchDevice) {
        dom.addEventListener('click', () => {
          if (this.active && document.getElementById('inspect-modal').classList.contains('hidden')) {
            try { dom.requestPointerLock(); } catch (e) {}
          }
        });
      }

      dom.addEventListener('mousedown', (e) => { isMouseDown = true; prevMouse = { x: e.clientX, y: e.clientY }; });
      window.addEventListener('mouseup', () => isMouseDown = false);
      window.addEventListener('mousemove', (e) => {
        if (!this.active) return;
        if (document.pointerLockElement === dom) {
          this.euler.y -= e.movementX * CONFIG.player.sensitivity;
          this.euler.x -= e.movementY * CONFIG.player.sensitivity;
          this.euler.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.euler.x));
        } else if (isMouseDown) {
          const dx = e.clientX - prevMouse.x;
          const dy = e.clientY - prevMouse.y;
          prevMouse = { x: e.clientX, y: e.clientY };
          this.euler.y -= dx * 0.003;
          this.euler.x -= dy * 0.003;
          this.euler.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.euler.x));
        }
      });

      let touchStartX = 0, touchStartY = 0, isTouchDragging = false;
      dom.addEventListener('touchstart', (e) => {
        if (!this.active) return;
        const touch = e.touches[0];
        if (e.target.closest('#mobile-controls') || e.target.closest('.btn-glass') || (e.target.closest('.modal') && !e.target.closest('#museum-modal'))) return;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isTouchDragging = true;
      }, { passive: true });

      dom.addEventListener('touchmove', (e) => {
        if (!this.active || !isTouchDragging) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        this.euler.y -= dx * 0.004;
        this.euler.x -= dy * 0.004;
        this.euler.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.euler.x));
      }, { passive: true });

      dom.addEventListener('touchend', () => { isTouchDragging = false; });

      if (this.app && this.app.isTouchDevice && window.nipplejs) {
        // Use museum-specific mobile controls (inside museum-modal, so visible on top)
        const mc = document.getElementById('museum-mobile-controls');
        if (mc) mc.style.display = 'flex';

        // Destroy previous joystick if exists
        if (this._museumJoystick) {
          this._museumJoystick.destroy();
        }

        this._museumJoystick = nipplejs.create({
          zone: document.getElementById('museum-joystick-zone'),
          mode: 'dynamic',
          color: 'white',
          size: 120,
          fadeTime: 200
        });
        this._museumJoystick.on('move', (evt, data) => {
          const angle = data.angle.radian;
          this.moveState.forward = Math.sin(angle) > 0.3;
          this.moveState.backward = Math.sin(angle) < -0.3;
          this.moveState.right = Math.cos(angle) > 0.3;
          this.moveState.left = Math.cos(angle) < -0.3;
        });
        this._museumJoystick.on('end', () => {
          this.moveState.forward = false;
          this.moveState.backward = false;
          this.moveState.left = false;
          this.moveState.right = false;
        });
      }
    }

    setupInspector() {
      const inspectContainer = document.getElementById('inspect-3d-canvas-container');
      if (!inspectContainer) return;

      this.inspectScene = new THREE.Scene();
      this.inspectScene.background = new THREE.Color(0x050a19);

      this.inspectCamera = new THREE.PerspectiveCamera(45, inspectContainer.clientWidth / (inspectContainer.clientHeight || 400), 0.1, 50);
      this.inspectCamera.position.set(0, 0, 5);

      this.inspectRenderer = new THREE.WebGLRenderer({ antialias: !(this.app && this.app.isTouchDevice), alpha: true });
      this.inspectRenderer.setSize(inspectContainer.clientWidth, inspectContainer.clientHeight || 400);
      this.inspectRenderer.setPixelRatio((this.app && this.app.isTouchDevice) ? 1.0 : window.devicePixelRatio);
      inspectContainer.appendChild(this.inspectRenderer.domElement);

      this.inspectScene.add(new THREE.AmbientLight(0xffffff, 1.2));
      const dirLight = new THREE.DirectionalLight(0xffd700, 1.5);
      dirLight.position.set(5, 5, 5);
      this.inspectScene.add(dirLight);

      const dom = inspectContainer;
      const startDrag = (e) => {
        this.isDraggingInspect = true;
        const p = e.touches ? e.touches[0] : e;
        this.previousMousePosition = { x: p.clientX, y: p.clientY };
      };

      const moveDrag = (e) => {
        if (!this.isDraggingInspect || !this.inspectFrameMesh) return;
        const p = e.touches ? e.touches[0] : e;
        const deltaX = p.clientX - this.previousMousePosition.x;
        const deltaY = p.clientY - this.previousMousePosition.y;
        this.previousMousePosition = { x: p.clientX, y: p.clientY };

        this.inspectFrameMesh.rotation.y += deltaX * 0.01;
        this.inspectFrameMesh.rotation.x += deltaY * 0.01;
      };

      const endDrag = () => { this.isDraggingInspect = false; };

      dom.addEventListener('mousedown', startDrag);
      dom.addEventListener('mousemove', moveDrag);
      window.addEventListener('mouseup', endDrag);

      dom.addEventListener('touchstart', startDrag, { passive: false });
      dom.addEventListener('touchmove', moveDrag, { passive: false });
      dom.addEventListener('touchend', endDrag);

      const closeInspect = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        document.getElementById('inspect-modal').classList.add('hidden');
      };
      const closeBtn = document.getElementById('inspect-close-btn');
      closeBtn.addEventListener('click', closeInspect);
      closeBtn.addEventListener('touchstart', closeInspect, { passive: false });

      document.getElementById('btn-do-inspect').addEventListener('click', () => {
        if (this.nearExhibit !== null) {
          this.openInspectView(this.nearExhibit);
        }
      });

      document.getElementById('museum-exit-btn').addEventListener('click', () => {
        this.closeMuseum();
      });

      document.getElementById('museum-start-guide-btn').addEventListener('click', () => {
        document.getElementById('museum-guide').classList.add('hidden');
      });
    }

    openInspectView(exhibitIndex) {
      const disc = DISCOVERIES[exhibitIndex];
      if (!disc) return;
      const isFound = disc.found;

      this.explored.add(exhibitIndex);
      document.getElementById('museum-explored-count').textContent = this.explored.size;

      document.getElementById('inspect-item-title').textContent = isFound 
        ? `รูปภาพความทรงจำที่ ${exhibitIndex + 1}` 
        : `🔒 ความทรงจำที่ ${exhibitIndex + 1} (ยังไม่ได้ปลดล็อค)`;

      const LOVE_MESSAGES = [
        "ขอบคุณสำหรับรอยยิ้มแรกที่ทำให้ตกหลุมรักหนูนะ ❤️",
        "7 เดือนแล้ว ไวเหมือนกันเนอะ ขอบคุณที่อยู่ด้วยกันมาตลอดนะ",
        "คบกันมา 7 เดือน มีเรื่องสนุกๆ และเสียงหัวเราะเยอะแยะเลย",
        "จำรูปนี้ได้ไหม ตอนนั้นยิ้มแย้มกันน่ารักเชียว 😄",
        "ขอบคุณที่คอยเป็นกำลังใจและอยู่ข้างๆ กันเสมอนะครับ 💕",
        "เห็นรูปนี้ทีไรก็แอบอมยิ้มทุกที น่ารักตลอดเลยนะหนู",
        "ขอบคุณที่คอยดูแลและใส่ใจกันในทุกๆ วันนะ",
        "ถึงจะแอบมีงอนกันบ้าง แต่ก็รักหนูคนเดียวเหมือนเดิมนะ",
        "เวลาได้คุยกับหนูแล้วมันทำให้หายเหนื่อยจริงๆ นะ",
        "ขอบคุณที่คอยส่งยิ้มหวานๆ ให้ได้อมยิ้มก่อนนอนเสมอ",
        "หนูเป็นทั้งแฟนและเพื่อนคู่คิดที่ดีที่สุดเลยรู้ไหม",
        "นับถอยหลังรอไปเที่ยวและกินของอร่อยๆ ด้วยกันทริปถัดไปนะ",
        "ขอบคุณที่รับฟังพี่บ่นได้ทุกเรื่องเลยนะคนดี 💕",
        "7 เดือนที่ผ่านมา มีแต่ความทรงจำน่ารักๆ เต็มไปหมด",
        "ขอบคุณที่เป็นเซฟโซนที่สบายใจที่สุดเสมอนะ",
        "รักหนูนะ ❤️ พี่จะคอยดูแลหนูให้ดีที่สุดเสมอ",
        "ทุกคำพูดน่ารักๆ ของหนู ทำให้พี่อมยิ้มได้ตลอดเลย",
        "ขอบคุณที่เข้าใจและคอยอยู่ซัพพอร์ตกันตลอดนะ",
        "เหนื่อยแค่ไหน แค่ได้คุยกับหนูก็สบายใจขึ้นทันทีเลย",
        "ขอให้เราจับมือคบกันไปนานๆ มีวันครบรอบด้วยกันอีกหลายๆ ปีนะ",
        "ขอบคุณสำหรับความไว้ใจและความรักที่มีให้กันเสมอ",
        "หนูเป็นคนเก่งเสมอเลยนะครับ ตั้งใจทำอะไรก็สำเร็จแน่นอน ✨",
        "น่ารักขนาดนี้ จะไม่ให้หลงได้ยังไงเนอะ 😄",
        "อยากไปเก็บความทรงจำและถ่ายรูปคู่กันเยอะๆ อีกจัง",
        "ขอบคุณที่คอยสร้างเสียงหัวเราะให้ในทุกๆ วันนะ",
        "ทุกช่วงเวลาที่คบกันมา มีค่ามากเลยนะ",
        "รักหนูมากๆ นะครับ ยิ้มหวานของพี่ 💕",
        "สัญญาว่าจะใส่ใจและดูแลความรักของเราให้ดีที่สุด",
        "หนูคือเรื่องราวที่ดีที่สุดเรื่องหนึ่งในชีวิตเลยนะ",
        "สุขสันต์วันครบรอบ 7 เดือนนะ ❤️",
        "มหาสมุทรแห่งความทรงจำนี้ รวมเรื่องราวของเราสองคนไว้ทั้งหมดเลย",
        "อยู่เป็นความสดใสให้กันแบบนี้ไปนานๆนะ ❤️",
        "รักที่สุดในโลกเลยครับ ❤️"
      ];

      const noteText = isFound 
        ? LOVE_MESSAGES[exhibitIndex % LOVE_MESSAGES.length] 
        : '🔒 ความทรงจำนี้ยังไม่ได้ปลดล็อค ต้องไปว่ายน้ำตามหาฟองหัวใจด่านนี้ในทะเลก่อนนะครับ ❤️';

      document.getElementById('inspect-note-text').textContent = noteText;

      if (this.inspectFrameMesh) {
        this.inspectScene.remove(this.inspectFrameMesh);
      }

      const frameColor = isFound ? 0xffd700 : 0x475569;
      const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, roughness: isFound ? 0.3 : 0.7, metalness: isFound ? 0.8 : 0.2 });
      const group = new THREE.Group();

      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.15), frameMat);
      group.add(frame);

      const photoTex = this.createCanvasPhotoTexture(disc.asset, exhibitIndex, isFound);
      const frontCanvas = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.3), new THREE.MeshStandardMaterial({ map: photoTex }));
      frontCanvas.position.z = 0.08;
      group.add(frontCanvas);

      const noteTex = this.createCanvasBackNoteTexture(exhibitIndex, isFound);
      const backCanvas = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.3), new THREE.MeshStandardMaterial({ map: noteTex }));
      backCanvas.position.z = -0.08;
      backCanvas.rotation.y = Math.PI;
      group.add(backCanvas);

      this.inspectFrameMesh = group;
      this.inspectScene.add(this.inspectFrameMesh);

      document.getElementById('inspect-modal').classList.remove('hidden');

      // Fix 0-width canvas bug by resizing renderer after layout updates
      setTimeout(() => {
        const inspectContainer = document.getElementById('inspect-3d-canvas-container');
        if (inspectContainer && this.inspectRenderer && this.inspectCamera) {
          const w = inspectContainer.clientWidth || window.innerWidth;
          const h = inspectContainer.clientHeight || window.innerHeight * 0.6;
          this.inspectRenderer.setSize(w, h);
          this.inspectCamera.aspect = w / h;
          this.inspectCamera.updateProjectionMatrix();
        }
      }, 50);

      this.animateInspector();
    }

    animateInspector() {
      if (document.getElementById('inspect-modal').classList.contains('hidden')) return;
      requestAnimationFrame(() => this.animateInspector());

      if (this.inspectFrameMesh && !this.isDraggingInspect) {
        this.inspectFrameMesh.rotation.y += 0.005;
      }

      if (this.inspectRenderer && this.inspectScene && this.inspectCamera) {
        this.inspectRenderer.render(this.inspectScene, this.inspectCamera);
      }
    }

    openMuseum() {
      this.init();
      this.buildExhibits();
      this.active = true;
      if (this.app) {
        this.app.targetSpeed = 0;
      }
      document.getElementById('museum-modal').classList.remove('hidden');
      document.getElementById('museum-guide').classList.remove('hidden');
      document.getElementById('museum-explored-count').textContent = this.explored.size;
      this.animateMuseum();
    }

    closeMuseum() {
      this.active = false;

      // Stop all playing videos in exhibit textures
      if (this.exhibits) {
        this.exhibits.forEach(ex => {
          const vid = ex.userData && ex.userData.video;
          if (vid) { vid.pause(); vid.src = ''; }
        });
      }

      // Destroy museum joystick
      if (this._museumJoystick) {
        this._museumJoystick.destroy();
        this._museumJoystick = null;
      }
      const museumMC = document.getElementById('museum-mobile-controls');
      if (museumMC) museumMC.style.display = 'none';

      document.getElementById('museum-modal').classList.add('hidden');

      // Restore mobile controls for ocean mode
      if (this.app && this.app.isTouchDevice) {
        const mc = document.getElementById('mobile-controls');
        if (mc) mc.style.display = 'flex';
        const speedControls = document.querySelector('.speed-controls');
        if (speedControls) speedControls.style.display = 'flex';
      }

      if (this.app) {
        this.app.targetSpeed = 4; // CONFIG.player.defaultSpeed
        if (!this.app.showingDiscovery && !this.app.isTouchDevice) {
          try { this.app.renderer.domElement.requestPointerLock(); } catch (e) { }
        }
      }
    }

    updateProximity() {
      let nearestIndex = null;
      let minDist = 4.2;

      for (let i = 0; i < this.exhibits.length; i++) {
        const ex = this.exhibits[i];
        const dist = this.camera.position.distanceTo(ex.position);
        if (dist < minDist) {
          minDist = dist;
          nearestIndex = i;
        }
      }

      this.nearExhibit = nearestIndex;
      const prompt = document.getElementById('museum-inspect-prompt');
      if (prompt) {
        if (nearestIndex !== null) {
          const disc = DISCOVERIES[nearestIndex];
          const isFound = disc ? disc.found : false;
          prompt.querySelector('span').textContent = isFound 
            ? `💖 ความทรงจำที่ ${nearestIndex + 1} (ปลดล็อคแล้ว)` 
            : `🔒 ความทรงจำที่ ${nearestIndex + 1} (ยังไม่ปลดล็อค)`;
          prompt.classList.remove('hidden');
        } else {
          prompt.classList.add('hidden');
        }
      }
    }

    animateMuseum() {
      if (!this.active) return;
      requestAnimationFrame(() => this.animateMuseum());

      const moveSpeed = 0.22;
      const dir = new THREE.Vector3();

      if (this.moveState.forward) dir.z -= 1;
      if (this.moveState.backward) dir.z += 1;
      if (this.moveState.left) dir.x -= 1;
      if (this.moveState.right) dir.x += 1;

      if (this.app && this.app.joystickActive && this.app.joystickDelta) {
        dir.z += (this.app.joystickDelta.y * 0.02);
        dir.x += (this.app.joystickDelta.x * 0.02);
      }

      dir.normalize();
      dir.applyEuler(new THREE.Euler(0, this.euler.y, 0));
      this.camera.position.addScaledVector(dir, moveSpeed);

      this.camera.position.x = Math.max(-20, Math.min(20, this.camera.position.x));
      this.camera.position.z = Math.max(-30, Math.min(30, this.camera.position.z));
      this.camera.position.y = 2.2;

      this.camera.quaternion.setFromEuler(this.euler);

      if (this.centerHeart) {
        this.centerHeart.rotation.y += 0.01;
        this.centerHeart.position.y = 6 + Math.sin(Date.now() * 0.002) * 0.5;
      }

      const t = Date.now() * 0.001;
      if (this.museumGoldTrim) {
        const glow = 1.1 + Math.sin(t * 1.3) * 0.3;
        for (const trim of this.museumGoldTrim) trim.material.emissiveIntensity = glow;
      }
      if (this.museumAccentLights) {
        this.museumAccentLights.forEach((light, i) => {
          light.intensity = 0.65 + Math.sin(t * 1.1 + i * 2.1) * 0.12;
        });
      }

      this.updateProximity();

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    onResize() {
      if (!this.renderer || !this.camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);

      const inspectContainer = document.getElementById('inspect-3d-canvas-container');
      if (this.inspectRenderer && this.inspectCamera && inspectContainer) {
        const iw = inspectContainer.clientWidth;
        const ih = inspectContainer.clientHeight || 400;
        this.inspectCamera.aspect = iw / ih;
        this.inspectCamera.updateProjectionMatrix();
        this.inspectRenderer.setSize(iw, ih);
      }
    }
  }

  function startApp() {
    const app = new UnderwaterWorld();
    app.init();
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }
})();
