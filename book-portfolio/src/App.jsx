import { useCallback, useEffect, useRef, useState } from 'react'
import BookScene from './components/BookScene.jsx'
import Overlay from './components/Overlay.jsx'
import BookReader from './components/BookReader.jsx'
import { withBase } from './lib/assets.js'
import { pages } from './lib/bookData.js'

const BOND_MUSIC_URL = withBase(
  'audios/Skyfall Complete Score 45 - Skyfall (Instrumental Version).mp4',
)
const BOND_PARTICLES = Array.from({ length: 15 }, (_, i) => {
  const leftSeed = (Math.sin(i * 19.37) + 1) / 2
  const durationSeed = (Math.sin(i * 11.11 + 0.8) + 1) / 2
  const delaySeed = (Math.sin(i * 7.17 + 1.3) + 1) / 2
  const sizeSeed = (Math.sin(i * 5.73 + 2.1) + 1) / 2

  return {
    id: i,
    left: `${leftSeed * 100}%`,
    duration: `${10 + durationSeed * 15}s`,
    delay: `${delaySeed * 10}s`,
    size: `${1 + sizeSeed * 1.5}px`,
  }
})

function App() {
  const isMobile = useIsMobile()
  const [musicMuted, setMusicMuted] = useState(true)
  const [readerOpen, setReaderOpen] = useState(false)
  const musicRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedPage = Number(params.get('page'))
    if (!Number.isFinite(requestedPage)) return 0
    return Math.min(Math.max(0, requestedPage), pages.length)
  })

  useEffect(() => {
    const audio = new Audio(BOND_MUSIC_URL)
    audio.loop = true
    audio.preload = 'auto'
    audio.defaultMuted = true
    audio.muted = true
    audio.playsInline = true
    audio.volume = 0.18
    musicRef.current = audio

    const ensurePlayback = () => {
      if (!audio.paused) {
        return
      }
      audio.play().catch(() => {})
    }

    ensurePlayback()
    window.addEventListener('pointerdown', ensurePlayback, { once: true })
    window.addEventListener('keydown', ensurePlayback, { once: true })

    return () => {
      window.removeEventListener('pointerdown', ensurePlayback)
      window.removeEventListener('keydown', ensurePlayback)
      audio.pause()
      audio.src = ''
    }
  }, [])

  const toggleMusic = useCallback(() => {
    const audio = musicRef.current
    if (!audio) return
    const nextMuted = !audio.muted
    audio.muted = nextMuted
    audio.defaultMuted = nextMuted
    setMusicMuted(nextMuted)

    if (audio.paused) {
      audio.play().catch(() => {})
    }
  }, [])

  return (
    <>
      <Overlay
        currentPage={currentPage}
        isMobile={isMobile}
        musicMuted={musicMuted}
        onMusicToggle={toggleMusic}
        onPageChange={setCurrentPage}
        onOpenReader={() => setReaderOpen(true)}
      />
      <BookScene
        currentPage={currentPage}
        isMobile={isMobile}
        onPageChange={setCurrentPage}
      />
      {readerOpen && <BookReader onClose={() => setReaderOpen(false)} />}
      <BondParticles isMobile={isMobile} />
    </>
  )
}

function BondParticles({ isMobile }) {
  const particles = isMobile ? BOND_PARTICLES.slice(0, 8) : BOND_PARTICLES

  return (
    <div className="bond-particles" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="bond-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

function useIsMobile(breakpoint = 840) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handleChange = (event) => setIsMobile(event.matches)

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [breakpoint])

  return isMobile
}

export default App
