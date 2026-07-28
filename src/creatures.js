import * as THREE from 'three';
import { CONFIG } from './config.js';

export function createCreatures(ctx) {
  createSeaFloorLife(ctx);
  createFishSchools(ctx);
  createJellyfish(ctx);
}

function createSeaFloorLife(ctx) {
  const matProps = { roughness: 0.9, metalness: 0.1 };

  // Starfish (35)
  const starColors = [0xFF5733, 0xFF8C00, 0xC70039, 0x900C3F];
  for (let i = 0; i < 35; i++) {
    const color = starColors[Math.floor(Math.random() * starColors.length)];
    const mat = new THREE.MeshStandardMaterial({ color, ...matProps });
    const grp = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), mat);
    core.scale.y = 0.5;
    grp.add(core);
    for (let arm = 0; arm < 5; arm++) {
      const angle = (arm / 5) * Math.PI * 2;
      const armMesh = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.8, 6), mat);
      armMesh.rotation.x = Math.PI / 2;
      armMesh.position.set(Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4);
      armMesh.lookAt(new THREE.Vector3(Math.cos(angle)*2, 0, Math.sin(angle)*2));
      grp.add(armMesh);
    }
    grp.position.set((Math.random() - 0.5) * CONFIG.world.size * 0.8, 0.2, (Math.random() - 0.5) * CONFIG.world.size * 0.8);
    grp.rotation.y = Math.random() * Math.PI;
    const s = 0.5 + Math.random();
    grp.scale.set(s, s, s);
    ctx.scene.add(grp);
  }

  // Sea Urchins (25)
  const urchinColors = [0x2C3E50, 0x1A0F14, 0x4A235A];
  for (let i = 0; i < 25; i++) {
    const color = urchinColors[Math.floor(Math.random() * urchinColors.length)];
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), mat));
    for (let s = 0; s < 40; s++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.6, 4), mat);
      spike.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      grp.add(spike);
    }
    grp.position.set((Math.random() - 0.5) * CONFIG.world.size * 0.8, 0.2, (Math.random() - 0.5) * CONFIG.world.size * 0.8);
    const scale = 0.5 + Math.random() * 0.8;
    grp.scale.set(scale, scale, scale);
    ctx.scene.add(grp);
  }

  // Shells (40)
  const shellColors = [0xFDFEFE, 0xFAD7A1, 0xEDBB99, 0xD7BDE2];
  for (let i = 0; i < 40; i++) {
    const color = shellColors[Math.floor(Math.random() * shellColors.length)];
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2 });
    const grp = new THREE.Group();
    if (Math.random() > 0.5) {
      // Conch
      const geo = new THREE.ConeGeometry(0.2, 0.4, 8, 1);
      const spiral = new THREE.Mesh(geo, mat);
      spiral.rotation.x = Math.PI / 2;
      grp.add(spiral);
      grp.add(new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 10, Math.PI), mat));
    } else {
      // Clam
      const halfGeo = new THREE.SphereGeometry(0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const top = new THREE.Mesh(halfGeo, mat); top.rotation.z = 0.1; grp.add(top);
      const bot = new THREE.Mesh(halfGeo, mat); bot.rotation.x = Math.PI; bot.rotation.z = -0.1; grp.add(bot);
    }
    grp.position.set((Math.random() - 0.5) * CONFIG.world.size * 0.8, 0.2, (Math.random() - 0.5) * CONFIG.world.size * 0.8);
    grp.rotation.y = Math.random() * Math.PI * 2;
    const sc = 0.5 + Math.random() * 0.8;
    grp.scale.set(sc, sc, sc);
    ctx.scene.add(grp);
  }

  // Anemones (40)
  const anemoneColors = [0xFF88CC, 0x88CCFF, 0xAAFF88, 0xFFAA88];
  ctx.anemones = [];
  for (let i = 0; i < 40; i++) {
    const color = anemoneColors[Math.floor(Math.random() * anemoneColors.length)];
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, emissive: new THREE.Color(color).multiplyScalar(0.2) });
    const grp = new THREE.Group();
    
    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.5, 12), mat);
    base.position.y = 0.25;
    grp.add(base);

    // Tentacles
    grp.userData.tentacles = [];
    const tCount = 20 + Math.floor(Math.random() * 15);
    for (let t = 0; t < tCount; t++) {
      const geo = new THREE.CylinderGeometry(0.02, 0.05, 1, 5);
      const tentacle = new THREE.Mesh(geo, mat);
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.3;
      tentacle.position.set(Math.cos(angle)*radius, 0.5, Math.sin(angle)*radius);
      // store base rotation for swaying
      tentacle.userData.baseRotX = (Math.random() - 0.5) * 0.5;
      tentacle.userData.baseRotZ = (Math.random() - 0.5) * 0.5;
      tentacle.userData.offset = Math.random() * Math.PI * 2;
      grp.add(tentacle);
      grp.userData.tentacles.push(tentacle);
    }

    grp.position.set((Math.random() - 0.5) * CONFIG.world.size * 0.8, 0, (Math.random() - 0.5) * CONFIG.world.size * 0.8);
    const sc = 0.6 + Math.random() * 0.8;
    grp.scale.set(sc, sc, sc);
    ctx.scene.add(grp);
    ctx.anemones.push(grp);
  }
}

function createFishSchools(ctx) {
  const schoolColors = [
    { body: 0x5DADE2, fin: 0x2E86C1 },
    { body: 0xF5A623, fin: 0xE67E22 },
    { body: 0x48C9B0, fin: 0x1ABC9C },
    { body: 0xEB984E, fin: 0xD35400 }
  ];
  for (let s = 0; s < CONFIG.fish.schoolCount; s++) { // 4 schools
    const colors = schoolColors[s % schoolColors.length];
    const center = new THREE.Vector3(
      (Math.random() - 0.5) * CONFIG.world.size * 0.7,
      6 + Math.random() * 25,
      (Math.random() - 0.5) * CONFIG.world.size * 0.7
    );
    const school = [];
    for (let i = 0; i < CONFIG.fish.fishPerSchool; i++) { // 18 fish per school
      const fish = createFish(colors);
      fish.position.copy(center).add(new THREE.Vector3(
        (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 10
      ));
      fish.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(CONFIG.fish.speed);
      fish.userData.schoolCenter = center;
      fish.userData.offset = Math.random() * Math.PI * 2;
      ctx.scene.add(fish);
      school.push(fish);
    }
    ctx.fishSchools.push(school);
  }
}

function createFish(colors) {
  const grp = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: colors.body, roughness: 0.25, metalness: 0.45,
    emissive: new THREE.Color(colors.body).multiplyScalar(0.08),
  });
  const finMat = new THREE.MeshStandardMaterial({
    color: colors.fin, roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide,
    emissive: new THREE.Color(colors.fin).multiplyScalar(0.06),
  });

  // Body
  const bodyGeo = new THREE.SphereGeometry(0.5, 10, 8);
  bodyGeo.scale(1, 0.5, 1.8);
  grp.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Tail
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.quadraticCurveTo(-0.3, 0.5, -0.55, 0.65);
  tailShape.lineTo(0, 0.15);
  tailShape.lineTo(0.55, 0.65);
  tailShape.quadraticCurveTo(0.3, 0.5, 0, 0);
  const tail = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), finMat);
  tail.position.set(0, -0.15, 0.9);
  tail.rotation.y = Math.PI;
  grp.add(tail);
  grp.userData.tail = tail;

  // Dorsal fin
  const dShape = new THREE.Shape();
  dShape.moveTo(0, 0); dShape.lineTo(-0.3, 0.45); dShape.quadraticCurveTo(0, 0.5, 0.3, 0.35); dShape.lineTo(0, 0);
  const dorsal = new THREE.Mesh(new THREE.ShapeGeometry(dShape), finMat);
  dorsal.position.set(0, 0.25, -0.1);
  dorsal.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  grp.add(dorsal);

  // Pectoral fins
  const pShape = new THREE.Shape();
  pShape.moveTo(0, 0); pShape.lineTo(0.3, 0.15); pShape.lineTo(0.15, -0.1); pShape.lineTo(0, 0);
  for (const side of [-1, 1]) {
    const pFin = new THREE.Mesh(new THREE.ShapeGeometry(pShape), finMat);
    pFin.position.set(side * 0.35, -0.05, -0.3);
    pFin.rotation.y = side * 0.5;
    pFin.rotation.z = side * 0.3;
    grp.add(pFin);
  }

  // Eyes
  const eyeW = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const eyeB = new THREE.MeshBasicMaterial({ color: 0x111111 });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), eyeW);
    eye.position.set(side * 0.32, 0.12, -0.65);
    grp.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 6), eyeB);
    pupil.position.set(side * 0.36, 0.12, -0.7);
    grp.add(pupil);
  }

  const s = 0.5 + Math.random() * 0.7;
  grp.scale.setScalar(s);
  return grp;
}

function createJellyfish(ctx) {
  const jellyColors = [
    { bell: 0x88CCFF, tentacle: 0x6699FF },
    { bell: 0xFF88CC, tentacle: 0xFF66AA },
    { bell: 0xAAFF88, tentacle: 0x88DD66 },
    { bell: 0xFFAA88, tentacle: 0xFF8866 },
    { bell: 0xCC88FF, tentacle: 0xAA66FF },
  ];
  for (let i = 0; i < 15; i++) { // 15 jellyfish
    const colors = jellyColors[Math.floor(Math.random() * jellyColors.length)];
    const jelly = createSingleJellyfish(colors);
    jelly.position.set(
      (Math.random() - 0.5) * CONFIG.world.size * 0.8,
      10 + Math.random() * 35,
      (Math.random() - 0.5) * CONFIG.world.size * 0.8
    );
    jelly.userData.baseY = jelly.position.y;
    jelly.userData.driftSpeed = 0.3 + Math.random() * 0.5;
    jelly.userData.driftDir = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5
    );
    jelly.userData.pulseSpeed = 1.5 + Math.random() * 1;
    jelly.userData.offset = Math.random() * Math.PI * 2;
    ctx.jellyfish.push(jelly);
    ctx.scene.add(jelly);
  }
}

function createSingleJellyfish(colors) {
  const grp = new THREE.Group();
  const bellMat = new THREE.MeshStandardMaterial({
    color: colors.bell, transparent: true, opacity: 0.45,
    roughness: 0.2, metalness: 0.1, side: THREE.DoubleSide,
    emissive: new THREE.Color(colors.bell).multiplyScalar(0.15),
  });
  const tentMat = new THREE.MeshStandardMaterial({
    color: colors.tentacle, transparent: true, opacity: 0.35,
    roughness: 0.3, metalness: 0.05,
    emissive: new THREE.Color(colors.tentacle).multiplyScalar(0.1),
  });

  // Bell (dome)
  const bellGeo = new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const bell = new THREE.Mesh(bellGeo, bellMat);
  grp.add(bell);
  grp.userData.bell = bell;

  // Inner glow
  const innerGeo = new THREE.SphereGeometry(0.7, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const innerMat = new THREE.MeshBasicMaterial({
    color: colors.bell, transparent: true, opacity: 0.15,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  grp.add(new THREE.Mesh(innerGeo, innerMat));

  // Rim frills
  const rimGeo = new THREE.TorusGeometry(0.85, 0.08, 6, 20);
  const rim = new THREE.Mesh(rimGeo, bellMat);
  rim.position.y = -0.55;
  rim.rotation.x = Math.PI / 2;
  grp.add(rim);

  // Tentacles
  const tentCount = 8 + Math.floor(Math.random() * 6);
  grp.userData.tentacles = [];
  for (let i = 0; i < tentCount; i++) {
    const angle = (i / tentCount) * Math.PI * 2;
    const len = 1.5 + Math.random() * 3;
    const pts = [];
    for (let t = 0; t <= 1; t += 0.15) {
      pts.push(new THREE.Vector3(
        Math.cos(angle) * (0.5 + t * 0.3),
        -0.5 - t * len,
        Math.sin(angle) * (0.5 + t * 0.3)
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tGeo = new THREE.TubeGeometry(curve, 8, 0.02 + Math.random() * 0.02, 5, false);
    const tentacle = new THREE.Mesh(tGeo, tentMat);
    grp.add(tentacle);
    grp.userData.tentacles.push({ mesh: tentacle, angle, len, pts });
  }

  // Point light (Glowing)
  const light = new THREE.PointLight(colors.bell, 0.5, 8);
  light.position.y = -0.2;
  grp.add(light);
  grp.userData.light = light;

  const s = 0.4 + Math.random() * 0.8;
  grp.scale.setScalar(s);
  return grp;
}
