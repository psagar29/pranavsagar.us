import {
  Environment,
  Float,
  Loader,
  OrbitControls,
  Preload,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import HologramProjector from './HologramProjector.jsx'
import Book from './Book.jsx'
import { pages } from '../lib/bookData.js'

function SceneContents({ currentPage, isMobile, onPageChange }) {
  const isClosedBook = currentPage === 0 || currentPage === pages.length
  const scene = isMobile
    ? {
        bookPosition: isClosedBook ? [-0.82, -0.08, 0] : [0, -0.12, 0],
        bookScale: isClosedBook ? 0.8 : 0.73,
        floatIntensity: 0.34,
        groupY: -0.22,
        rotationIntensity: 0.45,
        speed: 0.24,
      }
    : {
        bookPosition: [0, 0, 0],
        bookScale: 1,
        floatIntensity: 1,
        groupY: 0.1,
        rotationIntensity: 2,
        speed: 0.4,
      }

  return (
    <>
      <color attach="background" args={['#081522']} />
      <fog attach="fog" args={['#081522', 6.5, 15.5]} />

      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={scene.floatIntensity}
        speed={scene.speed}
        rotationIntensity={scene.rotationIntensity}
      >
        <group position={scene.bookPosition} scale={scene.bookScale}>
          <Book currentPage={currentPage} onPageChange={onPageChange} />
        </group>
        {/* Cool blue back light */}
        <rectAreaLight
          color="#4a9eed"
          height={0.85}
          intensity={1.8}
          position={[0, 0.55, -1.55]}
          rotation={[0.1, Math.PI, 0]}
          width={1}
        />
        {/* Subtle silver rim light */}
        <rectAreaLight
          color="#8899aa"
          height={1.2}
          intensity={0.8}
          position={[1.2, 0.3, 0.5]}
          rotation={[0, -Math.PI / 3, 0]}
          width={0.6}
        />
      </Float>

      <HologramProjector currentPage={currentPage} isMobile={isMobile} />

      <OrbitControls
        enablePan={false}
        enableRotate={!isMobile}
        enableZoom={false}
        makeDefault
        maxDistance={8}
        minDistance={2}
      />

      <Environment preset="night" />

      <directionalLight
        castShadow
        color="#dbe7f8"
        intensity={1}
        position={[1.8, 5.2, 2.8]}
        shadow-bias={-0.0001}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />

      <hemisphereLight
        color="#c6dcff"
        groundColor="#10213a"
        intensity={0.34}
      />

      {/* Deep blue ambient */}
      <ambientLight color="#173456" intensity={0.78} />

      {/* Subtle blue point light from above */}
      <pointLight
        color="#78b9ff"
        intensity={0.52}
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
    ? { position: [0, 1.02, 6.45], fov: 26 }
    : { position: [-0.5, 2, 4], fov: 35 }

  return (
    <>
      <Loader
        containerStyles={{
          background: '#000',
        }}
        barStyles={{
          background: '#4a9eed',
          height: '2px',
        }}
        dataStyles={{
          fontFamily: 'Orbitron, monospace',
          color: 'rgba(74, 158, 237, 0.6)',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
        }}
        dataInterpolation={(p) => `INITIALIZING ${Math.round(p)}%`}
      />
      <Canvas
        camera={camera}
        dpr={isMobile ? [1, 1.35] : [1, 2]}
        shadows
        style={{
          background:
            'radial-gradient(circle at 50% 24%, rgba(28, 60, 102, 0.68) 0%, rgba(10, 24, 42, 0.96) 46%, #040812 100%)',
          touchAction: isMobile ? 'manipulation' : 'none',
        }}
      >
        <group position-y={isMobile ? -0.22 : 0.1}>
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
