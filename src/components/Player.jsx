import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { useStore } from '../store.js'

const WALK_SPEED = 7.0
const SPRINT_SPEED = 11.5
const JUMP_IMPULSE = 6.0
const CAM_ROTATE_SPEED = 1.8
const CAM_DISTANCE = 8.5
const PITCH_MIN = 0.15
const PITCH_MAX = 0.85
const JUMP_COOLDOWN_MS = 250

export const playerPosition = new THREE.Vector3(0, 2, 14)
export const cameraYaw = { current: 0 }

export default function Player() {
  const body = useRef(null)
  const colliderRef = useRef(null)
  const avatarGroupRef = useRef(null)

  // Roblox Character Limb Refs (Pivoted at Shoulders & Hips)
  const headGroupRef = useRef(null)
  const leftArmPivotRef = useRef(null)
  const rightArmPivotRef = useRef(null)
  const leftLegPivotRef = useRef(null)
  const rightLegPivotRef = useRef(null)

  const yawRef = useRef(0)
  const pitchRef = useRef(0.36)
  const isDraggingRef = useRef(false)
  const prevPointerRef = useRef({ x: 0, y: 0 })
  const avatarAngleRef = useRef(Math.PI)
  const walkCycleRef = useRef(0)
  const prevJumpKeyRef = useRef(false)
  const lastJumpTimeRef = useRef(0)

  const [, getKeys] = useKeyboardControls()
  const { rapier, world } = useRapier()
  const { gl } = useThree()

  // Preallocated vectors outside useFrame
  const forwardVec = useMemo(() => new THREE.Vector3(), [])
  const rightVec = useMemo(() => new THREE.Vector3(), [])
  const moveDir = useMemo(() => new THREE.Vector3(), [])
  const desiredCamPos = useMemo(() => new THREE.Vector3(), [])
  const camOffset = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(0, 3, 14), [])
  const targetLook = useMemo(() => new THREE.Vector3(), [])
  const rayOrigin = useMemo(() => ({ x: 0, y: 0, z: 0 }), [])
  const rayDir = useMemo(() => ({ x: 0, y: -1, z: 0 }), [])

  // Pointer drag camera rotation on the canvas element
  useEffect(() => {
    const domElement = gl.domElement
    if (!domElement) return

    const onPointerDown = (e) => {
      if (useStore.getState().activeTerminal !== null) return
      isDraggingRef.current = true
      prevPointerRef.current.x = e.clientX
      prevPointerRef.current.y = e.clientY
    }

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return
      if (useStore.getState().activeTerminal !== null) {
        isDraggingRef.current = false
        return
      }
      const dx = e.clientX - prevPointerRef.current.x
      const dy = e.clientY - prevPointerRef.current.y
      prevPointerRef.current.x = e.clientX
      prevPointerRef.current.y = e.clientY

      yawRef.current -= dx * 0.006
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current + dy * 0.005,
        PITCH_MIN,
        PITCH_MAX
      )
      cameraYaw.current = yawRef.current
    }

    const onPointerUp = () => {
      isDraggingRef.current = false
    }

    domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [gl])

  useFrame((state, delta) => {
    const rb = body.current
    if (!rb) return

    const clampedDelta = Math.min(delta, 0.1)
    const elapsed = state.clock.elapsedTime
    const pos = rb.translation()

    // Respawn if fallen out of world
    if (pos.y < -15) {
      rb.setTranslation({ x: 0, y: 2.5, z: 14 }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      playerPosition.set(0, 2.5, 14)
      return
    }

    playerPosition.set(pos.x, pos.y, pos.z)
    const vel = rb.linvel()
    const isTerminalOpen = useStore.getState().activeTerminal !== null

    let hasInput = false
    let isSprinting = false

    if (isTerminalOpen) {
      rb.setLinvel({ x: 0, y: vel.y, z: 0 }, true)
      prevJumpKeyRef.current = false
    } else {
      const keys = getKeys()
      isSprinting = Boolean(keys.sprint)

      // Q/E camera yaw rotation
      if (keys.camLeft) yawRef.current += CAM_ROTATE_SPEED * clampedDelta
      if (keys.camRight) yawRef.current -= CAM_ROTATE_SPEED * clampedDelta
      cameraYaw.current = yawRef.current

      // Build input direction relative to camera yaw
      const forwardInput = (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0)
      const rightInput = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)

      const sinYaw = Math.sin(yawRef.current)
      const cosYaw = Math.cos(yawRef.current)

      forwardVec.set(-sinYaw, 0, -cosYaw)
      rightVec.set(cosYaw, 0, -sinYaw)

      moveDir.set(0, 0, 0)
      moveDir.addScaledVector(forwardVec, forwardInput)
      moveDir.addScaledVector(rightVec, rightInput)

      hasInput = moveDir.lengthSq() > 0.0001
      if (hasInput) {
        moveDir.normalize()
      }

      const speed = isSprinting ? SPRINT_SPEED : WALK_SPEED
      const targetVx = moveDir.x * speed
      const targetVz = moveDir.z * speed

      const smoothFactor = 1 - Math.exp(-12 * clampedDelta)
      const nextVx = THREE.MathUtils.lerp(vel.x, targetVx, smoothFactor)
      const nextVz = THREE.MathUtils.lerp(vel.z, targetVz, smoothFactor)

      rb.setLinvel({ x: nextVx, y: vel.y, z: nextVz }, true)

      // Smoothly rotate Roblox character toward movement direction
      if (hasInput && avatarGroupRef.current) {
        const targetAngle = Math.atan2(moveDir.x, moveDir.z)
        const diff = Math.atan2(
          Math.sin(targetAngle - avatarAngleRef.current),
          Math.cos(targetAngle - avatarAngleRef.current)
        )
        avatarAngleRef.current += diff * (1 - Math.exp(-14 * clampedDelta))
        avatarGroupRef.current.rotation.y = avatarAngleRef.current
      }

      // Grounded check & edge-triggered jump
      const jumpJustPressed = keys.jump && !prevJumpKeyRef.current
      prevJumpKeyRef.current = Boolean(keys.jump)

      const now = performance.now()
      if (jumpJustPressed && now - lastJumpTimeRef.current > JUMP_COOLDOWN_MS) {
        let grounded = Math.abs(vel.y) < 0.15
        try {
          if (rapier && world) {
            rayOrigin.x = pos.x
            rayOrigin.y = pos.y
            rayOrigin.z = pos.z
            const ray = new rapier.Ray(rayOrigin, rayDir)
            const hit = world.castRay(
              ray,
              0.95,
              true,
              undefined,
              undefined,
              colliderRef.current || undefined,
              rb
            )
            if (hit !== null) {
              grounded = grounded && true
            }
          }
        } catch {
          // Fallback to vertical velocity threshold
        }

        if (grounded) {
          rb.applyImpulse({ x: 0, y: JUMP_IMPULSE, z: 0 }, true)
          lastJumpTimeRef.current = now
        }
      }
    }

    // Animate Roblox Character Limbs (Walk, Sprint, Jump, and Idle)
    const horizontalSpeed = Math.hypot(vel.x, vel.z)
    const isAirborne = Math.abs(vel.y) > 0.6
    const limbLerp = 1 - Math.exp(-14 * clampedDelta)

    if (isAirborne) {
      // Classic Roblox Jump Pose: Arms raised up, legs slightly split
      if (leftArmPivotRef.current) {
        leftArmPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmPivotRef.current.rotation.x,
          Math.PI * 0.85,
          limbLerp
        )
      }
      if (rightArmPivotRef.current) {
        rightArmPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmPivotRef.current.rotation.x,
          Math.PI * 0.85,
          limbLerp
        )
      }
      if (leftLegPivotRef.current) {
        leftLegPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegPivotRef.current.rotation.x,
          -0.35,
          limbLerp
        )
      }
      if (rightLegPivotRef.current) {
        rightLegPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegPivotRef.current.rotation.x,
          0.35,
          limbLerp
        )
      }
    } else if (hasInput && horizontalSpeed > 0.4) {
      // Roblox Walk / Run Cycle
      const cycleFreq = isSprinting ? 14 : 9.5
      walkCycleRef.current += clampedDelta * cycleFreq
      const swingAmp = isSprinting ? 0.95 : 0.65
      const swing = Math.sin(walkCycleRef.current) * swingAmp

      if (leftArmPivotRef.current) {
        leftArmPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmPivotRef.current.rotation.x,
          swing,
          limbLerp
        )
      }
      if (rightArmPivotRef.current) {
        rightArmPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmPivotRef.current.rotation.x,
          -swing,
          limbLerp
        )
      }
      if (leftLegPivotRef.current) {
        leftLegPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegPivotRef.current.rotation.x,
          -swing,
          limbLerp
        )
      }
      if (rightLegPivotRef.current) {
        rightLegPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegPivotRef.current.rotation.x,
          swing,
          limbLerp
        )
      }
      if (avatarGroupRef.current) {
        avatarGroupRef.current.position.y =
          Math.abs(Math.cos(walkCycleRef.current)) * 0.06
      }
    } else {
      // Idle breathing pose
      const idleSway = Math.sin(elapsed * 2.5) * 0.05
      if (leftArmPivotRef.current) {
        leftArmPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmPivotRef.current.rotation.x,
          idleSway,
          limbLerp
        )
      }
      if (rightArmPivotRef.current) {
        rightArmPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmPivotRef.current.rotation.x,
          -idleSway,
          limbLerp
        )
      }
      if (leftLegPivotRef.current) {
        leftLegPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegPivotRef.current.rotation.x,
          0,
          limbLerp
        )
      }
      if (rightLegPivotRef.current) {
        rightLegPivotRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegPivotRef.current.rotation.x,
          0,
          limbLerp
        )
      }
      if (avatarGroupRef.current) {
        avatarGroupRef.current.position.y = THREE.MathUtils.lerp(
          avatarGroupRef.current.position.y,
          0,
          limbLerp
        )
      }
    }

    if (headGroupRef.current) {
      headGroupRef.current.rotation.y = Math.sin(elapsed * 1.6) * 0.08
    }

    // Third-person spring camera (frozen when terminal modal is active)
    if (!isTerminalOpen) {
      const yaw = yawRef.current
      const pitch = pitchRef.current
      const effectiveDist = CAM_DISTANCE * (1 - (pitch - PITCH_MIN) * 0.18)

      camOffset.set(
        Math.sin(yaw) * Math.cos(pitch) * effectiveDist,
        Math.sin(pitch) * effectiveDist,
        Math.cos(yaw) * Math.cos(pitch) * effectiveDist
      )

      desiredCamPos.set(pos.x, pos.y + 1.6, pos.z).add(camOffset)
      const camLerp = 1 - Math.exp(-6 * clampedDelta)
      state.camera.position.lerp(desiredCamPos, camLerp)

      targetLook.set(pos.x, pos.y + 1.0, pos.z)
      lookTarget.lerp(targetLook, camLerp)
      state.camera.lookAt(lookTarget)
    }
  })

  return (
    <RigidBody
      ref={body}
      colliders={false}
      type="dynamic"
      mass={1}
      lockRotations
      position={[0, 2, 14]}
      linearDamping={0.5}
      friction={0}
      ccd
    >
      <CapsuleCollider ref={colliderRef} args={[0.35, 0.4]} />

      {/* ROBLOX R6 BLOCKY HUMAN CHARACTER */}
      <group ref={avatarGroupRef} rotation={[0, Math.PI, 0]}>
        {/* HEAD GROUP */}
        <group ref={headGroupRef} position={[0, 0.56, 0]}>
          {/* Classic Roblox Beveled/Cylinder Head (Bright Yellow Skin) */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.42, 16]} />
            <meshStandardMaterial
              color="#f5cd30"
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>

          {/* Top Head Stud / Cap */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.04, 12]} />
            <meshStandardMaterial color="#f5cd30" roughness={0.35} />
          </mesh>

          {/* Stylish Blocky Hair / Cyber Visor Cap */}
          <mesh position={[0, 0.18, -0.02]} castShadow>
            <boxGeometry args={[0.52, 0.16, 0.52]} />
            <meshStandardMaterial color="#1b263b" roughness={0.5} />
          </mesh>
          {/* Cap Visor */}
          <mesh position={[0, 0.12, 0.28]} castShadow>
            <boxGeometry args={[0.48, 0.05, 0.2]} />
            <meshStandardMaterial
              color="#00e5ff"
              emissive="#00e5ff"
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Roblox Eyes (Front is +Z) */}
          <mesh position={[-0.08, 0.02, 0.235]}>
            <boxGeometry args={[0.045, 0.08, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0.08, 0.02, 0.235]}>
            <boxGeometry args={[0.045, 0.08, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>

          {/* Classic Roblox Smile */}
          <mesh position={[0, -0.08, 0.235]}>
            <boxGeometry args={[0.14, 0.035, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[-0.08, -0.06, 0.235]}>
            <boxGeometry args={[0.035, 0.035, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0.08, -0.06, 0.235]}>
            <boxGeometry args={[0.035, 0.035, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>

        {/* TORSO (Blocky Roblox Shirt / Cyber Jacket) */}
        <group position={[0, 0.05, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.62, 0.3]} />
            <meshStandardMaterial
              color="#0d6efd"
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>

          {/* Front Jacket Neon Emblem */}
          <mesh position={[0, 0.06, 0.155]}>
            <boxGeometry args={[0.26, 0.22, 0.02]} />
            <meshStandardMaterial
              color="#00ff41"
              emissive="#00ff41"
              emissiveIntensity={1.5}
              toneMapped={false}
            />
          </mesh>

          {/* Cyber Backpack on Back */}
          <mesh position={[0, 0.04, -0.2]} castShadow>
            <boxGeometry args={[0.4, 0.44, 0.14]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
          <mesh position={[0, 0.04, -0.28]}>
            <boxGeometry args={[0.22, 0.1, 0.02]} />
            <meshStandardMaterial
              color="#00e5ff"
              emissive="#00e5ff"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* LEFT ARM (Pivoted at Left Shoulder) */}
        <group ref={leftArmPivotRef} position={[-0.42, 0.32, 0]}>
          {/* Sleeve */}
          <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.28, 0.26]} />
            <meshStandardMaterial color="#0d6efd" roughness={0.4} />
          </mesh>
          {/* Yellow Blocky Hand/Forearm */}
          <mesh position={[0, -0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.28, 0.24]} />
            <meshStandardMaterial color="#f5cd30" roughness={0.35} />
          </mesh>
        </group>

        {/* RIGHT ARM (Pivoted at Right Shoulder) */}
        <group ref={rightArmPivotRef} position={[0.42, 0.32, 0]}>
          {/* Sleeve */}
          <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.28, 0.26]} />
            <meshStandardMaterial color="#0d6efd" roughness={0.4} />
          </mesh>
          {/* Yellow Blocky Hand/Forearm */}
          <mesh position={[0, -0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.28, 0.24]} />
            <meshStandardMaterial color="#f5cd30" roughness={0.35} />
          </mesh>
        </group>

        {/* LEFT LEG (Pivoted at Left Hip) */}
        <group ref={leftLegPivotRef} position={[-0.15, -0.26, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.48, 0.28]} />
            <meshStandardMaterial color="#1e293b" roughness={0.45} />
          </mesh>
          {/* Roblox Sneaker */}
          <mesh position={[0, -0.45, 0.03]} castShadow>
            <boxGeometry args={[0.27, 0.1, 0.32]} />
            <meshStandardMaterial
              color="#00ff41"
              emissive="#00ff41"
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>

        {/* RIGHT LEG (Pivoted at Right Hip) */}
        <group ref={rightLegPivotRef} position={[0.15, -0.26, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.48, 0.28]} />
            <meshStandardMaterial color="#1e293b" roughness={0.45} />
          </mesh>
          {/* Roblox Sneaker */}
          <mesh position={[0, -0.45, 0.03]} castShadow>
            <boxGeometry args={[0.27, 0.1, 0.32]} />
            <meshStandardMaterial
              color="#00ff41"
              emissive="#00ff41"
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>

        {/* Character local aura light */}
        <pointLight color="#ffffff" intensity={1.2} distance={7} decay={2} />
      </group>
    </RigidBody>
  )
}
