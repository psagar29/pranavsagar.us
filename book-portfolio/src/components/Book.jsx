import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { withBase } from '../lib/assets.js'
import BookPage from './BookPage.jsx'
import { pages } from '../lib/bookData.js'
import { readImageAsset } from '../lib/imageAssetResource.js'
import { createPortfolioPageTextures } from '../lib/portfolioPageTextures.js'

const portfolioImageUrls = [
  withBase('portfolio/optimized/IMG_2433.jpg'),
  withBase('portfolio/optimized/photo1.jpg'),
  withBase('portfolio/optimized/photo2.jpg'),
  withBase('portfolio/optimized/photo3.jpg'),
  withBase('portfolio/optimized/photo4.jpg'),
  withBase('portfolio/optimized/photo5.jpg'),
  withBase('textures/cover.webp'),
  withBase('textures/back-bond.jpg'),
]

function Book({ currentPage, deviceProfile, onPageChange, ...props }) {
  const [animatedPage, setAnimatedPage] = useState(currentPage)
  const { gl } = useThree()
  const [
    portraitImage,
    galleryImageA,
    galleryImageB,
    galleryImageC,
    galleryImageD,
    galleryImageE,
    coverArtImage,
    backArtImage,
  ] = portfolioImageUrls.map(readImageAsset)
  const maxAnisotropy = Math.max(
    1,
    Math.min(gl.capabilities.getMaxAnisotropy(), deviceProfile.maxAnisotropy),
  )

  const pageTextures = useMemo(() => {
    return createPortfolioPageTextures({
      contentScale: deviceProfile.contentTextureScale,
      generateMipmaps: deviceProfile.enableMipmaps,
      introScale: deviceProfile.introTextureScale,
      anisotropy: maxAnisotropy,
      portraitImage,
      galleryImages: [
        galleryImageA,
        galleryImageB,
        galleryImageC,
        galleryImageD,
        galleryImageE,
      ],
      coverArtImage,
      backArtImage,
    })
  }, [
    backArtImage,
    coverArtImage,
    deviceProfile.contentTextureScale,
    deviceProfile.enableMipmaps,
    deviceProfile.introTextureScale,
    galleryImageA,
    galleryImageB,
    galleryImageC,
    galleryImageD,
    galleryImageE,
    maxAnisotropy,
    portraitImage,
  ])

  useEffect(() => {
    Object.values(pageTextures).forEach((texture) => {
      texture.anisotropy = maxAnisotropy
      texture.generateMipmaps = deviceProfile.enableMipmaps
      texture.minFilter = deviceProfile.enableMipmaps
        ? THREE.LinearMipmapLinearFilter
        : THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    })
  }, [deviceProfile.enableMipmaps, maxAnisotropy, pageTextures])

  useEffect(() => {
    let timeoutId

    const stepTowardTargetPage = () => {
      setAnimatedPage((page) => {
        if (currentPage === page) {
          return page
        }

        timeoutId = window.setTimeout(
          stepTowardTargetPage,
          Math.abs(currentPage - page) > 2 ? 50 : 350,
        )

        if (currentPage > page) {
          return page + 1
        }

        return page - 1
      })
    }

    stepTowardTargetPage()

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [currentPage])

  useEffect(() => {
    return () => {
      Object.values(pageTextures).forEach((texture) => texture.dispose())
    }
  }, [pageTextures])

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {pages.map((page, index) => (
        <BookPage
          key={`${page.frontId}-${page.backId}`}
          animatedPage={animatedPage}
          bookClosed={animatedPage === 0 || animatedPage === pages.length}
          frontTexture={pageTextures[page.frontId]}
          backTexture={pageTextures[page.backId]}
          number={index}
          opened={animatedPage > index}
          onPageChange={onPageChange}
        />
      ))}
    </group>
  )
}

export default Book
