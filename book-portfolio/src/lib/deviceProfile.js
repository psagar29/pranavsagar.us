import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 840

function getMatchMediaState(query) {
  return window.matchMedia(query).matches
}

export function getDeviceProfile(breakpoint = MOBILE_BREAKPOINT) {
  const isMobile = window.innerWidth <= breakpoint
  const coarsePointer =
    getMatchMediaState('(pointer: coarse)') ||
    getMatchMediaState('(hover: none)') ||
    navigator.maxTouchPoints > 0
  const reducedMotion = getMatchMediaState('(prefers-reduced-motion: reduce)')
  const memory =
    typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : 8
  const cores =
    typeof navigator.hardwareConcurrency === 'number'
      ? navigator.hardwareConcurrency
      : 8
  const memoryConstrained = memory <= 3
  const lowPower = reducedMotion || memory <= 4 || cores <= 4
  const compactExperience = isMobile || coarsePointer
  const maxDevicePixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.2))

  return {
    isMobile,
    coarsePointer,
    reducedMotion,
    lowPower,
    compactExperience,
    antialias: !memoryConstrained,
    canvasTouchAction: 'none',
    contentTextureScale: memoryConstrained
      ? 0.94
      : compactExperience
        ? 1
        : lowPower
          ? 1.1
          : 1.24,
    enableEnvironment: !memoryConstrained,
    enableMipmaps: !compactExperience && !memoryConstrained,
    enableShadows: !compactExperience && !lowPower,
    introTextureScale: memoryConstrained
      ? 1.02
      : compactExperience
        ? 1.08
        : lowPower
          ? 1.2
          : 1.36,
    maxAnisotropy: compactExperience ? 4 : lowPower ? 6 : 8,
    rendererDpr: compactExperience
      ? [1.1, Math.min(maxDevicePixelRatio, lowPower ? 1.45 : 1.7)]
      : lowPower
        ? [1, Math.min(maxDevicePixelRatio, 1.75)]
        : [1.2, Math.min(maxDevicePixelRatio, 2)],
    shadowMapSize: lowPower ? 1024 : 1536,
  }
}

export function useDeviceProfile(breakpoint = MOBILE_BREAKPOINT) {
  const [profile, setProfile] = useState(() => getDeviceProfile(breakpoint))

  useEffect(() => {
    const widthMedia = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const pointerMedia = window.matchMedia('(pointer: coarse)')
    const hoverMedia = window.matchMedia('(hover: none)')
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    const updateProfile = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(() => {
        setProfile(getDeviceProfile(breakpoint))
      })
    }

    widthMedia.addEventListener('change', updateProfile)
    pointerMedia.addEventListener('change', updateProfile)
    hoverMedia.addEventListener('change', updateProfile)
    motionMedia.addEventListener('change', updateProfile)
    window.addEventListener('resize', updateProfile)

    return () => {
      widthMedia.removeEventListener('change', updateProfile)
      pointerMedia.removeEventListener('change', updateProfile)
      hoverMedia.removeEventListener('change', updateProfile)
      motionMedia.removeEventListener('change', updateProfile)
      window.removeEventListener('resize', updateProfile)
      window.cancelAnimationFrame(frameId)
    }
  }, [breakpoint])

  return profile
}
