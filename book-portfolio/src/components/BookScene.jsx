import {
  Environment,
  Float,
  Loader,
  OrbitControls,
  Preload,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import Book from './Book.jsx'
import { pages } from '../lib/bookData.js'

function SceneContents({ currentPage, isMobile, onPageChange }) {
  const isClosedBook = currentPage === 0 || currentPage === pages.length
  const scene = isMobile
    ? {
        bookPosition: isClosedBook ? [0.1, 0.04, 0] : [0.48, -0.04, 0],
        bookScale: isClosedBook ? 0.92 : 0.82,
        floatIntensity: 0.22,
        rotationIntensity: 0.03,
        speed: 0.18,
      }
    : {
        bookPosition: isClosedBook ? [1.18, -0.04, 0] : [1.78, -0.04, 0],
        bookScale: isClosedBook ? 1.08 : 1.04,
        floatIntensity: 0.34,
        rotationIntensity: 0.035,
        speed: 0.22,
      }
  const orbitTarget = [
    scene.bookPosition[0] + (isMobile ? 0.02 : 0.04),
    scene.bookPosition[1] + (isMobile ? 0.12 : 0.16),
    0,
  ]

  return (
    <>
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 6.5, 15.5]} />

      <Float
        rotation-x={-Math.PI / 6}
        floatIntensity={scene.floatIntensity}
        speed={scene.speed}
        rotationIntensity={scene.rotationIntensity}
      >
        <group position={scene.bookPosition} scale={scene.bookScale}>
          <Book currentPage={currentPage} onPageChange={onPageChange} />
        </group>
        {/* Cool blue back light */}
        <rectAreaLight
          color="#c9a96e"
          height={0.85}
          intensity={1.6}
          position={[0, 0.55, -1.55]}
          rotation={[0.1, Math.PI, 0]}
          width={1}
        />
        {/* Subtle warm rim light */}
        <rectAreaLight
          color="#a09888"
          height={1.2}
          intensity={0.8}
          position={[1.2, 0.3, 0.5]}
          rotation={[0, -Math.PI / 3, 0]}
          width={0.6}
        />
      </Float>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        enableRotate
        enableZoom={false}
        maxAzimuthAngle={Infinity}
        makeDefault
        maxDistance={8}
        maxPolarAngle={Math.PI - 0.28}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
        minDistance={2}
        minAzimuthAngle={-Infinity}
        minPolarAngle={0.28}
        rotateSpeed={isMobile ? 1.05 : 1.15}
        target={orbitTarget}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.ROTATE,
        }}
      />

      <Environment preset="night" />

      <directionalLight
        castShadow
        color="#f5ede0"
        intensity={0.9}
        position={[1.8, 5.2, 2.8]}
        shadow-bias={-0.0001}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />

      <hemisphereLight
        color="#f0e8d8"
        groundColor="#1a1510"
        intensity={0.3}
      />

      {/* Warm ambient */}
      <ambientLight color="#1a1510" intensity={0.6} />

      {/* Subtle gold point light from above */}
      <pointLight
        color="#c9a96e"
        intensity={0.4}
        position={[0, 4.2, 0.5]}
        decay={2}
        distance={12}
      />

      <mesh position-y={-1.5} receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.3} transparent />
      </mesh>
    </>
  )
}

function BookScene({ currentPage, isMobile, onPageChange }) {
  const camera = isMobile
    ? { position: [0.22, 0.88, 5.95], fov: 34 }
    : { position: [0.28, 1.28, 5.34], fov: 31 }

  return (
    <>
      <Loader
        containerStyles={{
          background: '#0a0a0f',
        }}
        barStyles={{
          background: '#c9a96e',
          height: '1px',
        }}
        dataStyles={{
          fontFamily: 'Orbitron, monospace',
          color: 'rgba(201, 169, 110, 0.45)',
          fontSize: '0.62rem',
          letterSpacing: '0.35em',
        }}
        dataInterpolation={(p) => `LOADING ${Math.round(p)}%`}
      />
      <Canvas
        camera={camera}
        dpr={isMobile ? [1.1, 2] : [1.4, 3]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        shadows
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(40, 32, 18, 0.4) 0%, rgba(15, 13, 10, 0.95) 46%, #0a0a0f 100%)',
          touchAction: 'none',
        }}
      >
        <group position-y={isMobile ? 0.02 : 0}>
          <Suspense fallback={null}>
            <SceneContents
              currentPage={currentPage}
              isMobile={isMobile}
              onPageChange={onPageChange}
            />
          </Suspense>
        </group>
        <Preload all />
      </Canvas>
    </>
  )
}

export default BookScene
