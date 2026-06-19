import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import Overlay from './components/Overlay.jsx'
import BookReader from './components/BookReader.jsx'
import { useDeviceProfile } from './lib/deviceProfile.js'
import { withBase } from './lib/assets.js'
import { pages } from './lib/bookData.js'

const BookScene = lazy(() => import('./components/BookScene.jsx'))

const BOND_MUSIC_URL = withBase('audios/skyfall-theme.mp3')
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
  const deviceProfile = useDeviceProfile()
  const { isMobile } = deviceProfile
  const [musicMuted, setMusicMuted] = useState(true)
  const [readerOpen, setReaderOpen] = useState(false)
  const musicRef = useRef(null)
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === '1'
  useEffect(() => {
    if (!isEmbed) return
    const prevBg = document.body.style.background
    document.body.style.background = '#ffffff'
    document.documentElement.style.background = '#ffffff'
    return () => {
      document.body.style.background = prevBg
      document.documentElement.style.background = ''
    }
  }, [isEmbed])
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedPage = Number(params.get('page'))
    if (!Number.isFinite(requestedPage)) return 0
    return Math.min(Math.max(0, requestedPage), pages.length)
  })

  useEffect(() => {
    return () => {
      const audio = musicRef.current

      if (!audio) {
        return
      }

      audio.pause()
      audio.src = ''
      musicRef.current = null
    }
  }, [])

  const toggleMusic = useCallback(() => {
    let audio = musicRef.current

    if (!audio) {
      audio = new Audio(BOND_MUSIC_URL)
      audio.loop = true
      audio.preload = 'metadata'
      audio.defaultMuted = true
      audio.muted = true
      audio.playsInline = true
      audio.volume = 0.18
      musicRef.current = audio
    }

    const nextMuted = !musicMuted
    audio.muted = nextMuted
    audio.defaultMuted = nextMuted
    setMusicMuted(nextMuted)

    if (nextMuted) {
      audio.pause()
      return
    }

    audio.play().catch(() => {
      audio.muted = true
      audio.defaultMuted = true
      setMusicMuted(true)
    })
  }, [musicMuted])

  return (
    <>
      {!isEmbed && (
        <Overlay
          currentPage={currentPage}
          isMobile={isMobile}
          musicMuted={musicMuted}
          onMusicToggle={toggleMusic}
          onPageChange={setCurrentPage}
          onOpenReader={() => setReaderOpen(true)}
        />
      )}
      <Suspense fallback={null}>
        <BookScene
          currentPage={currentPage}
          deviceProfile={deviceProfile}
          onPageChange={setCurrentPage}
        />
      </Suspense>
      {readerOpen && !isEmbed && <BookReader onClose={() => setReaderOpen(false)} />}
      {!isEmbed && <BondParticles isMobile={isMobile} />}
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

export default App
