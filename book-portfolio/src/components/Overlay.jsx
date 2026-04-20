import { useEffect, useMemo, useState } from 'react'
import { withBase } from '../lib/assets.js'
import { bookMeta, menuLinks, navigationItems } from '../lib/bookData.js'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [intelOpen, setIntelOpen] = useState(false)

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
    audio.volume = 0.12
    audio.play().catch(() => {})
  }, [currentPage])

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
              <button
                className={`utility-trigger ${menuOpen ? 'is-active' : ''}`}
                onClick={() => setMenuOpen((value) => !value)}
                type="button"
                aria-label={menuOpen ? 'Close utility menu' : 'Open utility menu'}
                aria-expanded={menuOpen}
              >
                <span className="utility-trigger-dot" />
                <span className="utility-trigger-dot" />
                <span className="utility-trigger-dot" />
              </button>

              <aside className={`overlay-utility-window ${menuOpen ? 'is-active' : ''}`}>
                <div className="overlay-utility-label">Open Channels</div>
                <div className="overlay-utility-links">
                  {menuLinks.map((item) => (
                    <a
                      className="overlay-utility-link"
                      href={item.href}
                      key={item.label}
                      onClick={() => setMenuOpen(false)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span>{item.label}</span>
                      <small>Open</small>
                    </a>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </header>

        {!isMobile && pageContent && (
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

export default Overlay
