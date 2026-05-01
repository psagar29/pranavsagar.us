import { useEffect, useMemo, useRef, useState } from 'react'
import { withBase } from '../lib/assets.js'
import { bookMeta, navigationItems, sourceRepository } from '../lib/bookData.js'
import { getHologramContent } from '../lib/hologramContent.js'
import { HologramPanel } from './HologramProjector.jsx'

function Overlay({
  currentPage,
  isMobile,
  musicMuted,
  onMusicToggle,
  onPageChange,
  onOpenReader,
}) {
  const pageContent = useMemo(() => getHologramContent(currentPage), [currentPage])
  const mobileContent = isMobile ? pageContent : null
  const currentSection = useMemo(() => {
    const activeItem = navigationItems.find((item) => item.target === currentPage)
    return activeItem?.label ?? 'Cover'
  }, [currentPage])
  const contactPageTarget = useMemo(
    () => navigationItems.find((item) => item.label === 'Contact')?.target ?? 0,
    [],
  )
  const contactContent = useMemo(
    () => getHologramContent(contactPageTarget),
    [contactPageTarget],
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [intelOpen, setIntelOpen] = useState(false)
  const flipAudioRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedInsideMenu = event.target.closest('.overlay-utility-window')
      const clickedTrigger = event.target.closest('.utility-trigger')
      if (menuOpen && !clickedInsideMenu && !clickedTrigger) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [menuOpen])

  useEffect(() => {
    const audio = new Audio(withBase('audios/page-flip-01a.mp3'))
    audio.preload = 'auto'
    audio.volume = 0.12
    flipAudioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      flipAudioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (currentPage === 0) {
      return
    }

    const audio = flipAudioRef.current

    if (!audio) {
      return
    }

    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [currentPage])

  const handleUtilityTrigger = () => {
    onPageChange(contactPageTarget)

    if (isMobile) {
      setMenuOpen(false)
      setIntelOpen(true)
      return
    }

    setIntelOpen(false)
    setMenuOpen((value) => !value)
  }

  return (
    <>
      <main className={`overlay-shell ${isMobile ? 'is-mobile' : ''}`}>
        <header className="overlay-topbar">
          <div className="overlay-topbar-row">
            <div className="overlay-actions">
              <button
                className={`bond-control-btn ${musicMuted ? '' : 'is-active'}`}
                onClick={onMusicToggle}
                type="button"
                aria-pressed={!musicMuted}
              >
                <div className={`music-bars ${musicMuted ? '' : 'is-playing'}`}>
                  <div className="music-bar" style={{ height: '3px' }} />
                  <div className="music-bar" style={{ height: '5px' }} />
                  <div className="music-bar" style={{ height: '2px' }} />
                  <div className="music-bar" style={{ height: '6px' }} />
                </div>
                {musicMuted ? 'Audio Off' : 'Audio On'}
              </button>

              <button
                className="bond-control-btn"
                onClick={onOpenReader}
                type="button"
              >
                Open Reader
              </button>

              {isMobile && mobileContent && (
                <button
                  className={`bond-control-btn ${intelOpen ? 'is-active' : ''}`}
                  onClick={() => {
                    setMenuOpen(false)
                    setIntelOpen((open) => !open)
                  }}
                  type="button"
                >
                  Page Intel
                </button>
              )}
            </div>

            <div className="overlay-brand">
              <span className="overlay-kicker">pranavsagar.us</span>
              <h1 className="overlay-title">{bookMeta.title}</h1>
              <p className="overlay-subtitle">{bookMeta.subtitle}</p>
            </div>

            <div className="overlay-utility">
              <a
                className="repo-source-link"
                href={sourceRepository.href}
                target="_blank"
                rel="noreferrer"
                aria-label="Open this website source code on GitHub"
              >
                <GitHubIcon />
                <span>{sourceRepository.label}</span>
              </a>

              <button
                className={`utility-trigger ${menuOpen ? 'is-active' : ''}`}
                onClick={handleUtilityTrigger}
                type="button"
                aria-label={
                  isMobile
                    ? 'Open contact form'
                    : menuOpen
                      ? 'Close contact form'
                      : 'Open contact form'
                }
                aria-expanded={menuOpen}
              >
                <span className="utility-trigger-dot" />
                <span className="utility-trigger-dot" />
                <span className="utility-trigger-dot" />
              </button>

              {!isMobile && contactContent && (
                <aside className={`overlay-utility-window is-contact ${menuOpen ? 'is-active' : ''}`}>
                  <HologramPanel content={contactContent} />
                </aside>
              )}
            </div>
          </div>
        </header>

        {!isMobile && pageContent && !menuOpen && (
          <div className="desktop-intel-window">
            <HologramPanel content={pageContent} />
          </div>
        )}

        <div className="overlay-bottom">
          <div className="overlay-page-chip">
            <span className="overlay-page-chip-label">Current Page</span>
            <strong className="overlay-page-chip-value">{currentSection}</strong>
          </div>

          <div className="overlay-navigation-wrap">
            <div className="overlay-navigation">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  className={`page-button ${item.target === currentPage ? 'is-active' : ''}`}
                  onClick={() => onPageChange(item.target)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {isMobile && mobileContent && (
        <div className={`mobile-intel-sheet ${intelOpen ? 'is-active' : ''}`}>
          <button
            aria-label="Close page intel"
            className="mobile-intel-backdrop"
            onClick={() => setIntelOpen(false)}
            type="button"
          />
          <div
            className="mobile-intel-card"
            role="dialog"
            aria-modal="true"
            aria-label={`${mobileContent.label} details`}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
          >
            <div className="mobile-intel-handle" />
            <div className="mobile-intel-header">
              <div className="mobile-intel-copy">
                <span className="mobile-intel-label">{mobileContent.label}</span>
                <strong className="mobile-intel-title">{mobileContent.title}</strong>
              </div>
              <button
                className="mobile-intel-close"
                onClick={() => setIntelOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <div className="mobile-intel-body">
              <HologramPanel content={mobileContent} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.82 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.48c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.83.57A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
      />
    </svg>
  )
}

export default Overlay
