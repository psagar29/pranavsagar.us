import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { withBase } from '../lib/assets.js'
import BookPage from './BookPage.jsx'
import { pages } from '../lib/bookData.js'
import { createPortfolioPageTextures } from '../lib/portfolioPageTextures.js'

const portfolioImageUrls = [
  withBase('portfolio/IMG_2433.png'),
  withBase('portfolio/photo1.png'),
  withBase('portfolio/photo2.jpg'),
  withBase('portfolio/photo3.jpg'),
  withBase('portfolio/photo4.jpg'),
  withBase('portfolio/photo5.jpg'),
  withBase('textures/cover.webp'),
  withBase('textures/back-bond.jpg'),
]

function Book({ currentPage, onPageChange, ...props }) {
  const [animatedPage, setAnimatedPage] = useState(currentPage)
  const { gl } = useThree()
  const loadedAssets = useTexture(portfolioImageUrls)
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy()

  const pageTextures = useMemo(() => {
    const galleryTextures = loadedAssets.slice(1, 6)
    return createPortfolioPageTextures({
      anisotropy: maxAnisotropy,
      portraitImage: loadedAssets[0].image,
      galleryImages: galleryTextures.map((texture) => texture.image),
      coverArtImage: loadedAssets[6].image,
      backArtImage: loadedAssets[7].image,
    })
  }, [loadedAssets, maxAnisotropy])

  useEffect(() => {
    loadedAssets.forEach((texture) => {
      texture.anisotropy = maxAnisotropy
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    })
  }, [loadedAssets, maxAnisotropy])

  useEffect(() => {
    Object.values(pageTextures).forEach((texture) => {
      texture.anisotropy = maxAnisotropy
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    })
  }, [maxAnisotropy, pageTextures])

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
