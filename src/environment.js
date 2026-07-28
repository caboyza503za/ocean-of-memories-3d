import * as THREE from 'three';
import { CONFIG } from './config.js';

export function createEnvironment(ctx) {
  createLights(ctx);
  createOceanFloor(ctx);
  createCorals(ctx);
  createKelpForest(ctx);
  createShipwreck(ctx);
  createGodRays(ctx);
  createCaustics(ctx);
  createDustParticles(ctx);
  createBubbles(ctx);
}

function createLights(ctx) {
  ctx.scene.add(new THREE.AmbientLight(CONFIG.world.ambientColor, 1.2));
  const sun = new THREE.DirectionalLight(CONFIG.world.surfaceLightColor, 1.8);
  sun.position.set(30, 100, 20);
  ctx.scene.add(sun);
  ctx.scene.add(new THREE.HemisphereLight(0xFFB6C1, 0x183040, 0.7));
}

function createOceanFloor(ctx) {
  const size = CONFIG.world.size;
  const geo = new THREE.PlaneGeometry(size * 2, size * 2, 80, 80);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  // Terrain displacement
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = Math.sin(x * 0.05) * 2 + Math.cos(z * 0.05) * 2 
            + Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.5;
    pos.setY(i, y);
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ 
    color: CONFIG.world.floorColor, 
    roughness: 0.9,
    metalness: 0.1
  });
  ctx.scene.add(new THREE.Mesh(geo, mat));
}

function createCorals(ctx) {
  const coralColors = [0xFF6B9E, 0xFF8E72, 0xE84393, 0xFAB1A0, 0x90D8FF, 0x48C9B0];
  const matProps = { roughness: 0.7, metalness: 0.1 };

  for (let i = 0; i < 150; i++) {
    const type = Math.floor(Math.random() * 5); // 5 types now including staghorn
    const color = coralColors[Math.floor(Math.random() * coralColors.length)];
    const mat = new THREE.MeshStandardMaterial({ color, ...matProps, emissive: new THREE.Color(color).multiplyScalar(0.1) });
    
    let mesh;
    if (type === 0) {
      // Branch coral
      mesh = new THREE.Group();
      const branches = 3 + Math.floor(Math.random() * 4);
      for (let b = 0; b < branches; b++) {
        const cgeo = new THREE.CylinderGeometry(0.1, 0.3, 1 + Math.random() * 2, 6);
        const bmesh = new THREE.Mesh(cgeo, mat);
        bmesh.position.y = 0.5;
        bmesh.rotation.x = (Math.random() - 0.5) * 1.5;
        bmesh.rotation.z = (Math.random() - 0.5) * 1.5;
        mesh.add(bmesh);
      }
    } else if (type === 1) {
      // Fan coral
      const geo = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      mesh = new THREE.Mesh(geo, mat);
      const fanGeo = new THREE.PlaneGeometry(2, 2, 4, 4);
      const fanMat = new THREE.MeshStandardMaterial({ color, ...matProps, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const fan = new THREE.Mesh(fanGeo, fanMat);
      fan.position.y = 1;
      mesh.add(fan);
    } else if (type === 2) {
      // Brain coral
      const geo = new THREE.SphereGeometry(0.5 + Math.random(), 12, 12);
      mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(1, 0.6, 1);
    } else if (type === 3) {
      // Tube coral
      mesh = new THREE.Group();
      const tubes = 3 + Math.floor(Math.random() * 5);
      for (let t = 0; t < tubes; t++) {
        const h = 0.5 + Math.random();
        const tgeo = new THREE.CylinderGeometry(0.15, 0.15, h, 8);
        const tmesh = new THREE.Mesh(tgeo, mat);
        tmesh.position.set((Math.random() - 0.5)*0.5, h/2, (Math.random() - 0.5)*0.5);
        mesh.add(tmesh);
      }
    } else {
      // Staghorn coral (Type 5)
      mesh = new THREE.Group();
      const createBranch = (len, depth) => {
        if(depth === 0) return new THREE.Group();
        const grp = new THREE.Group();
        const tgeo = new THREE.CylinderGeometry(0.05*depth, 0.08*depth, len, 5);
        const m = new THREE.Mesh(tgeo, mat);
        m.position.y = len/2;
        grp.add(m);
        const forks = 1 + Math.floor(Math.random()*2);
        for(let f=0; f<forks; f++) {
          const child = createBranch(len*0.7, depth-1);
          child.position.y = len;
          child.rotation.z = (Math.random()-0.5) * 1.5;
          child.rotation.x = (Math.random()-0.5) * 1.5;
          grp.add(child);
        }
        return grp;
      };
      mesh.add(createBranch(1 + Math.random(), 3));
    }
    
    mesh.position.set(
      (Math.random() - 0.5) * CONFIG.world.size * 0.9,
      0.5,
      (Math.random() - 0.5) * CONFIG.world.size * 0.9
    );
    mesh.rotation.y = Math.random() * Math.PI;
    const s = 0.5 + Math.random() * 1.5;
    mesh.scale.set(s,s,s);
    ctx.scene.add(mesh);
  }
}

function createKelpForest(ctx) {
  const kelpMat = new THREE.MeshStandardMaterial({
    color: 0x2d5a27, roughness: 0.8, side: THREE.DoubleSide
  });
  
  for (let i = 0; i < 200; i++) {
    const points = [];
    const segments = 10 + Math.floor(Math.random() * 15);
    const heightPerSegment = 1.5 + Math.random();
    
    for (let j = 0; j <= segments; j++) {
      points.push(new THREE.Vector3(0, j * heightPerSegment, 0));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, segments * 2, 0.15, 6, false);
    const kelp = new THREE.Mesh(geo, kelpMat);
    
    kelp.position.set(
      (Math.random() - 0.5) * CONFIG.world.size,
      0,
      (Math.random() - 0.5) * CONFIG.world.size
    );
    
    // Add leaves
    for (let j = 1; j < segments; j++) {
      const leafGeo = new THREE.PlaneGeometry(0.4, 1.2);
      const leaf = new THREE.Mesh(leafGeo, kelpMat);
      leaf.position.y = j * heightPerSegment;
      leaf.position.x = (Math.random() - 0.5) * 0.5;
      leaf.rotation.x = Math.random() * Math.PI;
      leaf.rotation.y = Math.random() * Math.PI;
      kelp.add(leaf);
    }
    
    kelp.userData.swaySpeed = 0.5 + Math.random() * 0.5;
    kelp.userData.offset = Math.random() * Math.PI * 2;
    ctx.scene.add(kelp);
    ctx.seaweedMeshes.push(kelp);
  }
}

function createShipwreck(ctx) {
  const wreck = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6D4C30, roughness: 0.85 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 0.9 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x5A6A70, roughness: 0.6, metalness: 0.45 });

  // Hull
  const hullGeo = new THREE.BoxGeometry(8, 4, 25, 4, 2, 8);
  const hp = hullGeo.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
    const w = 1 - Math.pow(z / 12.5, 2) * 0.35;
    const bc = y < 0 ? Math.cos((x / 4) * Math.PI * 0.5) * 1.0 : 0;
    hp.setX(i, x * w); hp.setY(i, y - bc);
  }
  hullGeo.computeVertexNormals();
  const hull = new THREE.Mesh(hullGeo, woodMat);
  hull.position.y = 2;
  wreck.add(hull);

  // Deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(7, 0.35, 22), darkWood);
  deck.position.y = 3.85;
  wreck.add(deck);

  // Mast (broken)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 12, 8), darkWood);
  mast.position.set(0, 8, -2);
  mast.rotation.set(0.1, 0, 0.25);
  wreck.add(mast);

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(6, 3.5, 7), woodMat);
  cabin.position.set(0, 5.6, 7.5);
  wreck.add(cabin);

  // 5 Broken barrels
  for (let i = 0; i < 5; i++) {
    const barrel = new THREE.Group();
    const bGeo = new THREE.CylinderGeometry(0.4, 0.35, 1, 8);
    barrel.add(new THREE.Mesh(bGeo, woodMat));
    const ringGeo = new THREE.TorusGeometry(0.38, 0.03, 6, 12);
    const r1 = new THREE.Mesh(ringGeo, metalMat); r1.position.y = 0.3; r1.rotation.x = Math.PI / 2;
    const r2 = new THREE.Mesh(ringGeo, metalMat); r2.position.y = -0.3; r2.rotation.x = Math.PI / 2;
    barrel.add(r1); barrel.add(r2);
    
    barrel.position.set(
      (Math.random() - 0.5) * 15,
      0.5,
      -20 + (Math.random() - 0.5) * 15
    );
    barrel.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * 0.5);
    wreck.add(barrel);
  }

  wreck.position.set(15, -1, -30);
  wreck.rotation.set(0.06, 0.5, 0.1);
  ctx.scene.add(wreck);
}

function createGodRays(ctx) {
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0x90D8FF, transparent: true, opacity: 0.08,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  for (let i = 0; i < 12; i++) { // 12 rays
    const w = 4 + Math.random() * 8;
    const h = CONFIG.world.depth + 25;
    const geo = new THREE.PlaneGeometry(w, h);
    const ray = new THREE.Mesh(geo, rayMat.clone());
    ray.position.set(
      (Math.random() - 0.5) * CONFIG.world.size,
      h / 2 - 8,
      (Math.random() - 0.5) * CONFIG.world.size
    );
    ray.rotation.y = Math.random() * Math.PI;
    ray.userData.baseOpacity = 0.04 + Math.random() * 0.06;
    ray.userData.speed = 0.2 + Math.random() * 0.6;
    ray.userData.offset = Math.random() * Math.PI * 2;
    ctx.scene.add(ray);
    ctx.godRays.push(ray);
  }
}

function createCaustics(ctx) {
  const causticMat = new THREE.MeshBasicMaterial({
    color: 0x80DDFF, transparent: true, opacity: 0.08,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  for (let i = 0; i < 25; i++) { // 25 spots
    const s = 3 + Math.random() * 8;
    const geo = new THREE.CircleGeometry(s, 8);
    const caustic = new THREE.Mesh(geo, causticMat.clone());
    caustic.rotation.x = -Math.PI / 2;
    caustic.position.set(
      (Math.random() - 0.5) * CONFIG.world.size * 1.2,
      0.3 + Math.random() * 0.3,
      (Math.random() - 0.5) * CONFIG.world.size * 1.2
    );
    caustic.userData.baseOpacity = 0.04 + Math.random() * 0.08;
    caustic.userData.speed = 0.8 + Math.random() * 1.5;
    caustic.userData.offset = Math.random() * Math.PI * 2;
    ctx.causticLights.push(caustic);
    ctx.scene.add(caustic);
  }
}

function createDustParticles(ctx) {
  const count = CONFIG.dust.count;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * CONFIG.world.size * 1.6;
    pos[i * 3 + 1] = Math.random() * CONFIG.world.depth;
    pos[i * 3 + 2] = (Math.random() - 0.5) * CONFIG.world.size * 1.6;
    vel[i * 3] = (Math.random() - 0.5) * 0.3;
    vel[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('velocity', new THREE.BufferAttribute(vel, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xFFB6C1, size: 0.18, transparent: true, opacity: 0.4,
    depthWrite: false, sizeAttenuation: true,
  });
  ctx.dustSystem = new THREE.Points(geo, mat);
  ctx.scene.add(ctx.dustSystem);
}

function createBubbles(ctx) {
  const count = CONFIG.bubbles.count; // 200
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const offsets = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * CONFIG.world.size * 0.9 * 2;
    pos[i * 3 + 1] = Math.random() * CONFIG.world.depth;
    pos[i * 3 + 2] = (Math.random() - 0.5) * CONFIG.world.size * 0.9 * 2;
    sizes[i] = 0.3 + Math.random() * 2.5;
    offsets[i] = Math.random() * Math.PI * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));
  const mat = new THREE.PointsMaterial({
    color: 0xBBEEFF, size: 0.45, transparent: true, opacity: 0.55,
    depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending,
  });
  ctx.bubbleSystem = new THREE.Points(geo, mat);
  ctx.scene.add(ctx.bubbleSystem);
}
