import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Text, Stars } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useStore } from '../store.js'

const TREES = [
  [-22, 0, 14],
  [-22, 0, 4],
  [-22, 0, -20],
  [22, 0, 14],
  [22, 0, 4],
  [22, 0, -20],
  [-8, 0, 18],
  [8, 0, 18],
  [-8, 0, -20],
  [8, 0, -20],
  [-18, 0, 20],
  [18, 0, 20]
]

const STREET_LAMPS = [
  [-5.5, 0, 10],
  [5.5, 0, 10],
  [-5.5, 0, -2],
  [5.5, 0, -2],
  [-10, 0, -6],
  [10, 0, -6]
]

const CITY_BUILDINGS = [
  { pos: [-26, 6, -10], size: [5, 12, 8], color: '#1e293b', win: '#00e5ff' },
  { pos: [-26, 8, -22], size: [5, 16, 8], color: '#0f172a', win: '#38bdf8' },
  { pos: [26, 6, -10], size: [5, 12, 8], color: '#1e293b', win: '#00ff41' },
  { pos: [26, 8, -22], size: [5, 16, 8], color: '#0f172a', win: '#a855f7' },
  { pos: [-16, 7, -27], size: [7, 14, 4], color: '#1e293b', win: '#00e5ff' },
  { pos: [16, 7, -27], size: [7, 14, 4], color: '#1e293b', win: '#00ff41' },
  { pos: [0, 9, -27], size: [9, 18, 4], color: '#0f172a', win: '#facc15' }
]

// Roblox Obby (Parkour) Platforms leading up around the Central Plaza
const OBBY_PLATFORMS = [
  { pos: [0, 0.8, 5], size: [3.6, 0.4, 2.8], color: '#00e5ff' },
  { pos: [-4, 1.6, 2], size: [3.2, 0.4, 2.8], color: '#38bdf8' },
  { pos: [4, 1.6, 2], size: [3.2, 0.4, 2.8], color: '#38bdf8' },
  { pos: [-4, 2.5, -2.5], size: [3.2, 0.4, 2.8], color: '#a855f7' },
  { pos: [4, 2.5, -2.5], size: [3.2, 0.4, 2.8], color: '#a855f7' },
  { pos: [0, 3.4, -6], size: [5.0, 0.4, 3.6], color: '#00ff41' }
]

export default function Facility() {
  const systemStatus = useStore((s) => s.systemStatus)
  const dataDone = useStore((s) => s.quests.dataNode)
  const commsDone = useStore((s) => s.quests.commsNode)

  const monumentRef = useRef(null)
  const outerRingRef = useRef(null)

  const isSecured = systemStatus === 'SECURED'
  const accentColor = isSecured ? '#00ff41' : '#facc15'
  const dataColor = dataDone ? '#00ff41' : '#ff2a2a'
  const commsColor = commsDone ? '#00ff41' : '#ff2a2a'

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = clock.elapsedTime
    if (monumentRef.current) {
      monumentRef.current.rotation.y += dt * 1.1
      monumentRef.current.position.y = 6.5 + Math.sin(t * 2.2) * 0.25
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += dt * 0.8
      outerRingRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 1.5) * 0.2
    }
  })

  return (
    <group>
      {/* Roblox World Sky Stars & Bright Pleasant Lighting */}
      <Stars
        radius={90}
        depth={40}
        count={2500}
        factor={4}
        saturation={0}
        fade
        speed={0.8}
      />

      {/* Bright Outdoor Hemisphere + Directional Sunlight so the world is vibrant */}
      <hemisphereLight args={['#bae6fd', '#1e293b', 0.85]} />
      <directionalLight
        position={[18, 28, 16]}
        intensity={1.6}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={75}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
      />

      {/* Main 64x64 Green Grass World Baseplate (Roblox Studs/Grass Vibe) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[32, 0.5, 32]} position={[0, -0.5, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[64, 64]} />
          <meshStandardMaterial
            color="#228b22"
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
      </RigidBody>

      {/* Asphalt Roads & Sidewalks (Cross-shaped Roblox Campus Roads) */}
      {/* North-South Main Avenue */}
      <mesh position={[0, 0.02, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7.5, 44]} />
        <meshStandardMaterial color="#334155" roughness={0.75} />
      </mesh>
      {/* Road Center Dashed Lines */}
      {[-14, -8, -2, 4, 10, 16, 20].map((zPos, i) => (
        <mesh
          key={i}
          position={[0, 0.03, zPos]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.25, 2.8]} />
          <meshStandardMaterial
            color="#facc15"
            emissive="#facc15"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}

      {/* East-West Boulevard connecting Math & English Pavilions */}
      <mesh
        position={[0, 0.025, -10]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[38, 7.5]} />
        <meshStandardMaterial color="#334155" roughness={0.75} />
      </mesh>

      {/* Neon Guide Strips Along the Road to Both Pavilions */}
      <mesh position={[-8, 0.04, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.35]} />
        <meshStandardMaterial
          color={dataColor}
          emissive={dataColor}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[8, 0.04, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.35]} />
        <meshStandardMaterial
          color={commsColor}
          emissive={commsColor}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {/* Roblox Spawn Pad at [0, 0.04, 14] */}
      <group position={[0, 0.04, 14]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <boxGeometry args={[4.2, 4.2, 0.08]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.6, 24]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={1.8}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* West Pavilion Base (MATEMATIKA) at [-14, 0, -10] */}
      <group position={[-14, 0, -10]}>
        <mesh position={[0, 0.06, 0]} receiveShadow>
          <boxGeometry args={[7.5, 0.12, 7.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Pavilion Roof & Pillars */}
        <mesh position={[-3.2, 2.4, -3.2]} castShadow>
          <boxGeometry args={[0.4, 4.8, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[3.2, 2.4, -3.2]} castShadow>
          <boxGeometry args={[0.4, 4.8, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 4.9, 0]} castShadow>
          <boxGeometry args={[8.2, 0.4, 8.2]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 5.15, 0]}>
          <boxGeometry args={[8.4, 0.12, 8.4]} />
          <meshStandardMaterial
            color={dataColor}
            emissive={dataColor}
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* East Pavilion Base (BAHASA INGGRIS) at [14, 0, -10] */}
      <group position={[14, 0, -10]}>
        <mesh position={[0, 0.06, 0]} receiveShadow>
          <boxGeometry args={[7.5, 0.12, 7.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Pavilion Roof & Pillars */}
        <mesh position={[-3.2, 2.4, -3.2]} castShadow>
          <boxGeometry args={[0.4, 4.8, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[3.2, 2.4, -3.2]} castShadow>
          <boxGeometry args={[0.4, 4.8, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 4.9, 0]} castShadow>
          <boxGeometry args={[8.2, 0.4, 8.2]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 5.15, 0]}>
          <boxGeometry args={[8.4, 0.12, 8.4]} />
          <meshStandardMaterial
            color={commsColor}
            emissive={commsColor}
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Central Plaza Fountain & Monument at [0, 0, -14] */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.8, -14]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.6, 3.6, 8]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.9, 1.3, 2.5, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
      </RigidBody>

      {/* Floating Monument Crystal & Ring */}
      <mesh ref={monumentRef} position={[0, 6.5, -14]}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={outerRingRef} position={[0, 6.5, -14]}>
        <torusGeometry args={[2.3, 0.08, 12, 40]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {/* Roblox Blocky Trees */}
      {TREES.map((pos, idx) => (
        <RigidBody key={idx} type="fixed" colliders="cuboid" position={pos}>
          {/* Brown Blocky Trunk */}
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.7, 2.4, 0.7]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          {/* Green Blocky Leaves Layer 1 */}
          <mesh position={[0, 2.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 1.6, 2.4]} />
            <meshStandardMaterial color="#16a34a" roughness={0.7} />
          </mesh>
          {/* Green Blocky Leaves Top Layer */}
          <mesh position={[0, 4.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 1.1, 1.5]} />
            <meshStandardMaterial color="#22c55e" roughness={0.7} />
          </mesh>
        </RigidBody>
      ))}

      {/* Street Lamps */}
      {STREET_LAMPS.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 4.4, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          <mesh position={[0, 4.5, 0]}>
            <sphereGeometry args={[0.32, 12, 12]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fef08a"
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* Surrounding Cyber-City Buildings */}
      {CITY_BUILDINGS.map((b, idx) => (
        <RigidBody key={idx} type="fixed" colliders="cuboid" position={b.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.45}
              metalness={0.5}
            />
          </mesh>
          {/* Glowing Neon Window Strips */}
          <mesh position={[0, 1.5, b.size[2] / 2 + 0.03]}>
            <boxGeometry args={[b.size[0] * 0.75, 0.35, 0.04]} />
            <meshStandardMaterial
              color={b.win}
              emissive={b.win}
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, -1.5, b.size[2] / 2 + 0.03]}>
            <boxGeometry args={[b.size[0] * 0.75, 0.35, 0.04]} />
            <meshStandardMaterial
              color={b.win}
              emissive={b.win}
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* Roblox Obby / Parkour Floating Platforms */}
      {OBBY_PLATFORMS.map((plat, idx) => (
        <RigidBody
          key={idx}
          type="fixed"
          colliders="cuboid"
          position={plat.pos}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={plat.size} />
            <meshStandardMaterial
              color={plat.color}
              roughness={0.35}
              metalness={0.3}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* World Perimeter Fences */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 2, -32]}>
        <mesh receiveShadow>
          <boxGeometry args={[64, 4, 1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 2, 32]}>
        <mesh receiveShadow>
          <boxGeometry args={[64, 4, 1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-32, 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[1, 4, 64]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[32, 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[1, 4, 64]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </RigidBody>

      {/* Big Sky Sign */}
      <group position={[0, 12.5, -22]}>
        <Text
          fontSize={2.1}
          color={isSecured ? '#00ff41' : '#00e5ff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.07}
          outlineColor="#05070a"
        >
          EDUQUEST ROBLOX CITY
        </Text>
        <Text
          position={[0, -1.65, 0]}
          fontSize={0.6}
          color="#facc15"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {isSecured
            ? 'MISI SELESAI: SEMUA TERMINAL PULIH 100%!'
            : 'KIRI: MATEMATIKA (10 SOAL)  |  KANAN: B. INGGRIS (10 ABCD)'}
        </Text>
      </group>

      {/* Ambient Sparkles Around Pavilions */}
      <Sparkles
        position={[-14, 2.5, -10]}
        count={65}
        scale={[10, 5, 10]}
        size={3}
        speed={0.4}
        color={dataColor}
      />
      <Sparkles
        position={[14, 2.5, -10]}
        count={65}
        scale={[10, 5, 10]}
        size={3}
        speed={0.4}
        color={commsColor}
      />
    </group>
  )
}
