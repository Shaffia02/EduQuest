import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, useKeyboardControls } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useStore } from '../store.js'
import { playerPosition } from './Player.jsx'

const TERMINALS = [
  {
    id: 'dataNode',
    label: 'TERMINAL MATEMATIKA (10 SOAL)',
    position: [-14, 0, -10]
  },
  {
    id: 'commsNode',
    label: 'TERMINAL B. INGGRIS (10 SOAL ABCD)',
    position: [14, 0, -10]
  }
]

const INTERACT_DISTANCE = 3.8

function TerminalConsole({ id, label, position }) {
  const isSolved = useStore((s) => s.quests[id])
  const mathStage = useStore((s) => s.mathStage)
  const mathTotal = useStore((s) => s.mathTotal)
  const engStage = useStore((s) => s.engStage)
  const engTotal = useStore((s) => s.engTotal)
  const nearTerminal = useStore((s) => s.nearTerminal)
  const isNear = nearTerminal === id

  const ringRef = useRef(null)
  const beaconRef = useRef(null)
  const promptGroupRef = useRef(null)

  const themeColor = isSolved ? '#00ff41' : '#ff2a2a'

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const dt = Math.min(delta, 0.1)
    if (ringRef.current) {
      const pulse = 1 + Math.sin(t * 3.5) * 0.08
      ringRef.current.scale.set(pulse, pulse, 1)
    }
    if (beaconRef.current) {
      beaconRef.current.rotation.y += dt * 1.5
    }
    if (promptGroupRef.current) {
      promptGroupRef.current.position.y = 3.5 + Math.sin(t * 4) * 0.1
    }
  })

  const subStatus = !isSolved
    ? id === 'dataNode'
      ? `PROGRES: ${mathStage} / ${mathTotal} SOAL`
      : `PROGRES: ${engStage} / ${engTotal} SOAL`
    : 'SELESAI 100%'

  return (
    <group position={position}>
      {/* Console Base Collider & Pedestal */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 1.8, 1.25]} />
          <meshStandardMaterial
            color="#11161d"
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>

        {/* Tilted Glowing Screen */}
        <mesh position={[0, 2.05, -0.08]} rotation={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[1.65, 1.05, 0.12]} />
          <meshStandardMaterial color="#0b0f14" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.05, -0.01]} rotation={[-0.3, 0, 0]}>
          <planeGeometry args={[1.48, 0.88]} />
          <meshStandardMaterial
            color={themeColor}
            emissive={themeColor}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>

        {/* Keyboard Control Deck */}
        <mesh position={[0, 1.52, 0.5]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[1.4, 0.08, 0.46]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      </RigidBody>

      {/* Rotating Hologram Diamond Beacon Above Terminal */}
      <mesh ref={beaconRef} position={[0, 2.9, 0]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial
          color={themeColor}
          emissive={themeColor}
          emissiveIntensity={2.4}
          wireframe
          toneMapped={false}
        />
      </mesh>

      {/* Pulsing Ground Ring */}
      <mesh
        ref={ringRef}
        position={[0, 0.14, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[2.3, 2.6, 36]} />
        <meshStandardMaterial
          color={themeColor}
          emissive={themeColor}
          emissiveIntensity={2.2}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Floating Billboard Labels & Prompts */}
      <group ref={promptGroupRef} position={[0, 3.5, 0]}>
        <Billboard>
          <Text
            position={[0, 0.55, 0]}
            fontSize={0.28}
            color="#00e5ff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {label}
          </Text>

          <Text
            position={[0, 0.22, 0]}
            fontSize={0.22}
            color="#facc15"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.025}
            outlineColor="#000000"
          >
            {subStatus}
          </Text>

          <Text
            visible={isSolved || isNear}
            position={[0, -0.15, 0]}
            fontSize={0.35}
            color="#00ff41"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {isSolved ? '[ACCESS GRANTED]' : '[PRESS F TO HACK]'}
          </Text>
        </Billboard>
      </group>
    </group>
  )
}

export default function TerminalNodes() {
  const [, getKeys] = useKeyboardControls()
  const prevInteractRef = useRef(false)
  const lastNearRef = useRef(null)

  const terminalVectors = useMemo(
    () =>
      TERMINALS.map((t) => ({
        id: t.id,
        vec: new THREE.Vector3(t.position[0], t.position[1], t.position[2])
      })),
    []
  )

  useFrame(() => {
    const state = useStore.getState()
    let closestId = null

    for (let i = 0; i < terminalVectors.length; i++) {
      const item = terminalVectors[i]
      if (!state.quests[item.id]) {
        const dist = playerPosition.distanceTo(item.vec)
        if (dist < INTERACT_DISTANCE) {
          closestId = item.id
          break
        }
      }
    }

    if (closestId !== lastNearRef.current) {
      lastNearRef.current = closestId
      state.setNearTerminal(closestId)
    }

    // Edge-triggered F key interaction
    const interactPressed = Boolean(getKeys().interact)
    const justPressed = interactPressed && !prevInteractRef.current
    prevInteractRef.current = interactPressed

    if (
      justPressed &&
      closestId !== null &&
      state.activeTerminal === null &&
      !state.quests[closestId]
    ) {
      state.openTerminal(closestId)
    }
  })

  return (
    <group>
      {TERMINALS.map((t) => (
        <TerminalConsole
          key={t.id}
          id={t.id}
          label={t.label}
          position={t.position}
        />
      ))}
    </group>
  )
}
