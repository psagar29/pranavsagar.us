import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { pages } from '../lib/bookData.js'

const TURN_EASING = 0.5
const FOLD_EASING = 0.3
const INSIDE_CURVE_STRENGTH = 0.18
const OUTSIDE_CURVE_STRENGTH = 0.05
const TURN_CURVE_STRENGTH = 0.09
const HOVER_EMISSIVE_INTENSITY = 0.1
const PAGE_CURVE_DEGREES = 1.5

const PAGE_WIDTH = 1.28
const PAGE_HEIGHT = 1.73
const PAGE_DEPTH = 0.003
const PAGE_SEGMENTS = 30
const PAGE_SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS
const LAST_PAGE_INDEX = pages.length - 1

const pageGeometry = new THREE.BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2,
)

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0)

const positionAttribute = pageGeometry.attributes.position
const position = new THREE.Vector3()
const skinIndices = []
const skinWeights = []

for (let index = 0; index < positionAttribute.count; index += 1) {
  position.fromBufferAttribute(positionAttribute, index)

  const boneIndex = Math.max(0, Math.floor(position.x / PAGE_SEGMENT_WIDTH))
  const boneWeight = (position.x % PAGE_SEGMENT_WIDTH) / PAGE_SEGMENT_WIDTH

  skinIndices.push(boneIndex, boneIndex + 1, 0, 0)
  skinWeights.push(1 - boneWeight, boneWeight, 0, 0)
}

pageGeometry.setAttribute(
  'skinIndex',
  new THREE.Uint16BufferAttribute(skinIndices, 4),
)

pageGeometry.setAttribute(
  'skinWeight',
  new THREE.Float32BufferAttribute(skinWeights, 4),
)

const pageEdgeColor = new THREE.Color('white')
const pageEdgeShadowColor = new THREE.Color('#111111')
const pageEmissiveColor = new THREE.Color('#4a9eed')

const sharedPageMaterials = [
  new THREE.MeshStandardMaterial({ color: pageEdgeColor }),
  new THREE.MeshStandardMaterial({ color: pageEdgeShadowColor }),
  new THREE.MeshStandardMaterial({ color: pageEdgeColor }),
  new THREE.MeshStandardMaterial({ color: pageEdgeColor }),
]

function BookPage({
  animatedPage,
  bookClosed,
  frontTexture,
  backTexture,
  number,
  onPageChange,
  opened,
  ...props
}) {
  const groupRef = useRef()
  const turningStartRef = useRef(0)
  const openedRef = useRef(opened)
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  useCursor(hovered)

  const skinnedMesh = useMemo(() => {
    const bones = []

    for (let index = 0; index <= PAGE_SEGMENTS; index += 1) {
      const bone = new THREE.Bone()
      bones.push(bone)
      bone.position.x = index === 0 ? 0 : PAGE_SEGMENT_WIDTH

      if (index > 0) {
        bones[index - 1].add(bone)
      }
    }

    const skeleton = new THREE.Skeleton(bones)
    const materials = [
      ...sharedPageMaterials,
      new THREE.MeshStandardMaterial({
        color: pageEdgeColor,
        map: frontTexture,
        ...(number === 0
          ? { roughness: 0.78, metalness: 0.05 }
          : { roughness: 0.72, metalness: 0.08 }),
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        emissive: pageEmissiveColor,
        emissiveIntensity: 0,
      }),
      new THREE.MeshStandardMaterial({
        color: pageEdgeColor,
        map: backTexture,
        ...(number === LAST_PAGE_INDEX
          ? { roughness: 0.78, metalness: 0.05 }
          : { roughness: 0.72, metalness: 0.05 }),
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        emissive: pageEmissiveColor,
        emissiveIntensity: 0,
      }),
    ]

    const mesh = new THREE.SkinnedMesh(pageGeometry, materials)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.frustumCulled = false
    mesh.add(skeleton.bones[0])
    mesh.bind(skeleton)

    return mesh
  }, [backTexture, frontTexture, number])

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return
    }

    const emissiveIntensity = hovered ? HOVER_EMISSIVE_INTENSITY : 0
    meshRef.current.material[4].emissiveIntensity = THREE.MathUtils.lerp(
      meshRef.current.material[4].emissiveIntensity,
      emissiveIntensity,
      0.1,
    )
    meshRef.current.material[5].emissiveIntensity = THREE.MathUtils.lerp(
      meshRef.current.material[5].emissiveIntensity,
      emissiveIntensity,
      0.1,
    )

    if (openedRef.current !== opened) {
      turningStartRef.current = Date.now()
      openedRef.current = opened
    }

    let turnProgress = Math.min(400, Date.now() - turningStartRef.current) / 400
    turnProgress = Math.sin(turnProgress * Math.PI)

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2

    if (!bookClosed) {
      targetRotation += THREE.MathUtils.degToRad(number * PAGE_CURVE_DEGREES)
    }

    const bones = meshRef.current.skeleton.bones

    for (let index = 0; index < bones.length; index += 1) {
      const target = index === 0 ? groupRef.current : bones[index]
      const insideCurveStrength =
        index < 8 ? Math.sin(index * 0.2 + 0.25) : 0
      const outsideCurveStrength =
        index >= 8 ? Math.cos(index * 0.3 + 0.09) : 0
      const turnCurveStrength =
        Math.sin(index * Math.PI * (1 - bones.length)) * turnProgress

      let yRotation =
        INSIDE_CURVE_STRENGTH * insideCurveStrength * targetRotation -
        OUTSIDE_CURVE_STRENGTH * outsideCurveStrength * targetRotation +
        TURN_CURVE_STRENGTH * turnCurveStrength * targetRotation

      let xRotation = THREE.MathUtils.degToRad(Math.sign(targetRotation) * 2)

      if (bookClosed) {
        if (index === 0) {
          yRotation = targetRotation
          xRotation = 0
        } else {
          yRotation = 0
        }
      }

      easing.dampAngle(target.rotation, 'y', yRotation, TURN_EASING, delta)

      const foldIntensity =
        index > 8
          ? Math.sin(index * Math.PI * (1 / bones.length) - 0.5) * turnProgress
          : 0

      easing.dampAngle(
        target.rotation,
        'x',
        xRotation * foldIntensity,
        FOLD_EASING,
        delta,
      )
    }
  })

  return (
    <group
      {...props}
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation()
        onPageChange(opened ? number : number + 1)
        setHovered(false)
      }}
      onPointerEnter={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerLeave={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
    >
      <primitive
        object={skinnedMesh}
        ref={meshRef}
        position-z={-number * PAGE_DEPTH + animatedPage * PAGE_DEPTH}
      />
    </group>
  )
}

export default BookPage
