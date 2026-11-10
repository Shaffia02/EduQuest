import React, { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Facility from './components/Facility.jsx'
import TerminalNodes from './components/TerminalNodes.jsx'
import Player from './components/Player.jsx'
import HUD from './components/HUD.jsx'

export const keyboardMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'sprint', keys: ['ShiftLeft'] },
  { name: 'interact', keys: ['KeyF'] },
  { name: 'camLeft', keys: ['KeyQ'] },
  { name: 'camRight', keys: ['KeyE'] }
]

const SCROLL_KEYS = new Set([
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight'
])

export default function App() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName
      const isInputFocused =
        activeTag === 'INPUT' ||
        activeTag === 'TEXTAREA' ||
        activeTag === 'SELECT'
      if (!isInputFocused && SCROLL_KEYS.has(e.code)) {
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="w-screen h-screen relative bg-[#0f172a] overflow-hidden">
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ fov: 60, position: [0, 6, 22], near: 0.1, far: 220 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#0f172a']} />
          <fog attach="fog" args={['#0f172a', 35, 95]} />
          <Suspense fallback={null}>
            <Physics gravity={[0, -20, 0]} timeStep="vary">
              <Facility />
              <TerminalNodes />
              <Player />
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <HUD />
    </div>
  )
}
