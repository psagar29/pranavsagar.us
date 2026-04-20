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
  const mobileContent = useMemo(
    () => (isMobile ? getHologramContent(currentPage) : null),
    [currentPage, isMobile],
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [intelOpen, setIntelOpen] = useState(false)

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedInsideMenu = event.target.closest('.overlay-menu')
      const clickedHamburger = event.target.closest('.hamburger-button')
      if (menuOpen && !clickedInsideMenu && !clickedHamburger) {
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
        <div className="overlay-header">
          <div className="overlay-controls">
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
              {musicMuted ? 'Music Muted' : 'Music On'}
            </button>

            <button
              className="bond-control-btn"
              onClick={onOpenReader}
              type="button"
            >
              Full Book
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

          <h1 className="overlay-title">
            {bookMeta.title}
            {bookMeta.year ? <span>{bookMeta.year}</span> : (
              <span>Portfolio Edition</span>
            )}
          </h1>
          <p className="overlay-subtitle">{bookMeta.subtitle}</p>
          <a
            className="overlay-link"
            href={bookMeta.linkHref}
            target="_blank"
            rel="noreferrer"
          >
            {bookMeta.linkLabel}
          </a>
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
      </main>

      <button
        className={`hamburger-button ${menuOpen ? 'is-active' : ''}`}
        onClick={() => setMenuOpen((v) => !v)}
        type="button"
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <aside className={`overlay-menu ${menuOpen ? 'is-active' : ''}`}>
        <button
          className="overlay-menu-close"
          onClick={() => setMenuOpen(false)}
          type="button"
          aria-label="Close menu"
        >
          ×
        </button>
        <div className="overlay-menu-content">
          {menuLinks.map((item) => (
            <div className="overlay-menu-item" key={item.label}>
              <a href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            </div>
          ))}
        </div>
      </aside>

      {isMobile && mobileContent && (
        <div className={`mobile-intel-sheet ${intelOpen ? 'is-active' : ''}`}>
          <button
            aria-label="Close page intel"
            className="mobile-intel-backdrop"
            onClick={() => setIntelOpen(false)}
            type="button"
          />
          <div className="mobile-intel-card" role="dialog" aria-modal="true" aria-label={`${mobileContent.label} details`}>
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
