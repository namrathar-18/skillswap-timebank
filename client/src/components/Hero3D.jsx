import { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Line, Icosahedron, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const PALETTE = ['#6366f1', '#818cf8', '#a5b4fc', '#34d399', '#f472b6', '#fbbf24'];
const NODE_COUNT = 34;

/** Evenly distribute points on a sphere (Fibonacci lattice). */
function useNetwork(radius = 2.6) {
  return useMemo(() => {
    const nodes = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NODE_COUNT; i++) {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      nodes.push({
        pos: new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius),
        color: PALETTE[i % PALETTE.length],
        scale: 0.05 + Math.random() * 0.07,
      });
    }

    // Connect each node to its two nearest neighbours (deduped) to form a graph.
    const edges = [];
    const seen = new Set();
    nodes.forEach((n, i) => {
      const nearest = nodes
        .map((m, j) => ({ j, d: i === j ? Infinity : n.pos.distanceToSquared(m.pos) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      nearest.forEach(({ j }) => {
        const key = [i, j].sort((a, b) => a - b).join('-');
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([n.pos, nodes[j].pos]);
        }
      });
    });

    return { nodes, edges };
  }, [radius]);
}

function Node({ pos, color, scale }) {
  const ref = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = scale * (1 + 0.25 * Math.sin(t * 1.6 + phase));
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
    </mesh>
  );
}

function SkillNetwork() {
  const group = useRef();
  const { nodes, edges } = useNetwork();

  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });

  return (
    <group ref={group}>
      {/* Glowing distorted core = the "knowledge hub" */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.6}>
        <Icosahedron args={[0.9, 4]}>
          <MeshDistortMaterial
            color="#4f46e5"
            emissive="#4338ca"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.6}
            distort={0.35}
            speed={2}
          />
        </Icosahedron>
      </Float>

      {/* Connective tissue of the community graph */}
      {edges.map((points, i) => (
        <Line key={i} points={points} color="#818cf8" lineWidth={0.6} transparent opacity={0.28} />
      ))}

      {/* Skill nodes */}
      {nodes.map((n, i) => (
        <Node key={i} {...n} />
      ))}

      <Sparkles count={60} scale={7} size={2.5} speed={0.3} color="#c7d2fe" opacity={0.6} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <pointLight position={[6, 6, 6]} intensity={80} color="#818cf8" />
        <pointLight position={[-6, -4, -4]} intensity={60} color="#f472b6" />
        <SkillNetwork />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          rotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  );
}
