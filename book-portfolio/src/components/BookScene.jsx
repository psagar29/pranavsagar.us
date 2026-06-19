import {
  Environment,
  Float,
  Loader,
  OrbitControls,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import Book from './Book.jsx'
import { pages } from '../lib/bookData.js'

function SceneContents({ currentPage, deviceProfile, onPageChange }) {
  const { enableEnvironment, enableShadows, isMobile, reducedMotion, shadowMapSize } =
    deviceProfile
  const isEmbed = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('embed') === '1'
  const sceneBg = isEmbed ? '#ffffff' : '#0a0a0f'
  const isClosedBook = currentPage === 0 || currentPage === pages.length
  const scene = isMobile
    ? isEmbed
      ? {
          bookPosition: isClosedBook ? [-0.58, -0.05, 0] : [0.08, -0.15, 0],
          bookScale: isClosedBook ? 0.84 : 0.88,
          floatIntensity: 0.12,
          rotationIntensity: 0.016,
          speed: 0.12,
        }
      : {
          bookPosition: isClosedBook ? [-0.16, -0.02, 0] : [0.34, -0.12, 0],
          bookScale: isClosedBook ? 1.02 : 0.98,
          floatIntensity: 0.16,
          rotationIntensity: 0.022,
          speed: 0.14,
        }
    : {
        bookPosition: isClosedBook ? [0.92, -0.02, 0] : [1.5, -0.06, 0],
        bookScale: isClosedBook ? 1.16 : 1.12,
        floatIntensity: 0.24,
        rotationIntensity: 0.026,
        speed: 0.18,
      }
  const bookTilt = isClosedBook
    ? -Math.PI / 6
    : isMobile
      ? -Math.PI / 8
      : -Math.PI / 7
  const orbitTarget = isMobile && isEmbed
    ? [
        scene.bookPosition[0] + (isClosedBook ? 0.34 : 0.26),
        scene.bookPosition[1] + 0.18,
        0,
      ]
    : [
        scene.bookPosition[0] + (isMobile ? 0.02 : 0.04),
        scene.bookPosition[1] + (isMobile ? 0.12 : 0.16),
        0,
      ]

  return (
    <>
      <color attach="background" args={[sceneBg]} />
      {!isEmbed && <fog attach="fog" args={['#0a0a0f', 6.5, 15.5]} />}

      <Float
        rotation-x={bookTilt}
        floatIntensity={reducedMotion ? 0 : scene.floatIntensity}
        speed={reducedMotion ? 0 : scene.speed}
        rotationIntensity={reducedMotion ? 0 : scene.rotationIntensity}
      >
        <group position={scene.bookPosition} scale={scene.bookScale}>
          <Book
            currentPage={currentPage}
            deviceProfile={deviceProfile}
            onPageChange={onPageChange}
          />
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
        enableZoom={!isMobile}
        maxAzimuthAngle={Infinity}
        makeDefault
        maxDistance={7}
        maxPolarAngle={Math.PI / 2 + 0.62}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
        minDistance={3.2}
        minAzimuthAngle={-Infinity}
        minPolarAngle={0.36}
        rotateSpeed={isMobile ? 0.82 : 0.95}
        target={orbitTarget}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.ROTATE,
        }}
      />

      {enableEnvironment && !isEmbed && <Environment preset="night" />}

      <directionalLight
        castShadow={enableShadows}
        color={isEmbed ? '#ffffff' : '#f5ede0'}
        intensity={isEmbed ? 1.15 : 0.9}
        position={[1.8, 5.2, 2.8]}
        shadow-bias={-0.0001}
        shadow-mapSize-height={shadowMapSize}
        shadow-mapSize-width={shadowMapSize}
      />

      <hemisphereLight
        color={isEmbed ? '#ffffff' : '#f0e8d8'}
        groundColor={isEmbed ? '#e8eaef' : '#1a1510'}
        intensity={isEmbed ? 0.85 : 0.3}
      />

      <ambientLight
        color={isEmbed ? '#ffffff' : '#1a1510'}
        intensity={isEmbed ? 0.9 : 0.6}
      />

      {!isEmbed && (
        <pointLight
          color="#c9a96e"
          intensity={0.4}
          position={[0, 4.2, 0.5]}
          decay={2}
          distance={12}
        />
      )}

      {enableShadows && (
        <mesh position-y={-1.5} receiveShadow rotation-x={-Math.PI / 2}>
          <planeGeometry args={[100, 100]} />
          <shadowMaterial opacity={0.3} transparent />
        </mesh>
      )}
    </>
  )
}

function BookScene({ currentPage, deviceProfile, onPageChange }) {
  const { antialias, canvasTouchAction, enableShadows, isMobile, lowPower, rendererDpr } =
    deviceProfile
  const isEmbed = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('embed') === '1'
  const camera = isMobile
    ? isEmbed
      ? { position: [0.08, 1, 5.95], fov: 35 }
      : { position: [0.08, 0.98, 5.15], fov: 32 }
    : { position: [0.2, 1.18, 5.08], fov: 30 }
  const canvasBg = isEmbed
    ? '#ffffff'
    : 'radial-gradient(circle at 50% 30%, rgba(40, 32, 18, 0.4) 0%, rgba(15, 13, 10, 0.95) 46%, #0a0a0f 100%)'

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
        dpr={rendererDpr}
        gl={{
          antialias,
          powerPreference: lowPower ? 'default' : 'high-performance',
        }}
        performance={{ min: lowPower ? 0.45 : 0.65 }}
        shadows={enableShadows}
        style={{
          background: canvasBg,
          touchAction: canvasTouchAction,
        }}
      >
        <group position-y={isMobile ? 0.02 : 0}>
          <Suspense fallback={null}>
            <SceneContents
              currentPage={currentPage}
              deviceProfile={deviceProfile}
              onPageChange={onPageChange}
            />
          </Suspense>
        </group>
      </Canvas>
    </>
  )
}

export default BookScene
