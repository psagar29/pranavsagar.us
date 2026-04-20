import { useEffect } from 'react'
import { portfolioData } from '../lib/portfolioData.js'

function BookReader({ onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const { identity, about, skills, education, certifications, experience, metrics, projects, socialLinks } = portfolioData

  return (
    <div className="book-reader-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}>
      <div className="book-reader-container">
        <button className="book-reader-close" onClick={onClose} type="button">×</button>

        <div className="book-reader-header">
          <h2>007</h2>
          <p>Full Portfolio — {identity.name}</p>
        </div>

        {/* Identity */}
        <div className="book-reader-section">
          <div className="book-reader-section-label">Identity</div>
          <h3>{identity.name}</h3>
          <p>{identity.title} — {identity.location}</p>
          <p>{identity.email}</p>
          <div className="book-reader-tags">
            {identity.roles.map((role) => (
              <span className="book-reader-tag" key={role}>{role}</span>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="book-reader-section">
          <div className="book-reader-section-label">Key Metrics</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {metrics.map(([value, label]) => (
              <div key={label} style={{
                padding: '0.8rem 1.2rem',
                border: '1px solid var(--bond-border)',
                borderRadius: '0.6rem',
                background: 'rgba(74, 158, 237, 0.03)',
                textAlign: 'center',
                minWidth: '100px',
              }}>
                <div style={{ fontFamily: 'Orbitron', fontSize: '1.4rem', fontWeight: 900, color: 'var(--bond-blue)' }}>{value}</div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'Orbitron', letterSpacing: '0.1em', color: 'var(--bond-text-dim)', marginTop: '0.2rem', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="book-reader-divider" />

        {/* About */}
        <div className="book-reader-section">
          <div className="book-reader-section-label">About</div>
          <h3>Who I Am</h3>
          {about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          <h3 style={{ marginTop: '1rem' }}>Fun Facts</h3>
          <ul>
            {about.funFacts.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>
        </div>

        <div className="book-reader-divider" />

        {/* Skills */}
        <div className="book-reader-section">
          <div className="book-reader-section-label">Stack</div>
          <h3>Skills & Technologies</h3>
          {Object.entries(skills).map(([category, tags]) => (
            <div key={category} style={{ marginBottom: '0.8rem' }}>
              <p style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', fontWeight: 700, color: 'var(--bond-blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                {category}
              </p>
              <div className="book-reader-tags">
                {tags.map((tag) => <span className="book-reader-tag" key={tag}>{tag}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div className="book-reader-divider" />

        {/* Education */}
        <div className="book-reader-section">
          <div className="book-reader-section-label">Journey</div>
          <h3>Education</h3>
          {education.map((entry) => (
            <div key={entry.school} style={{ marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--bond-border)' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.2rem' }}>{entry.degree}</p>
              <p style={{ color: 'var(--bond-blue-dim)', margin: '0 0 0.2rem' }}>{entry.school} — {entry.location}</p>
              <div className="book-reader-tags" style={{ margin: '0.4rem 0' }}>
                {entry.meta.map((m) => <span className="book-reader-tag" key={m}>{m}</span>)}
              </div>
              <p>{entry.description}</p>
              <ul>
                {entry.achievements.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="book-reader-section">
          <div className="book-reader-section-label">Credentials</div>
          <h3>Certifications & Courses</h3>
          <p style={{ color: 'var(--bond-blue)', fontFamily: 'Orbitron', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.3rem' }}>CERTIFICATIONS</p>
          <ul>
            {certifications.certifications.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p style={{ color: 'var(--bond-blue)', fontFamily: 'Orbitron', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', marginTop: '0.8rem', marginBottom: '0.3rem' }}>COURSES</p>
          <ul>
            {certifications.courses.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>

        <div className="book-reader-divider" />

        {/* Experience */}
        <div className="book-reader-section">
          <div className="book-reader-section-label">Experience</div>
          <h3>Where I've Worked</h3>
          {experience.map((role) => (
            <div key={role.title + role.company} style={{ marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--bond-border)' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.2rem' }}>{role.title}</p>
              <p style={{ color: 'var(--bond-blue-dim)', margin: '0 0 0.15rem', fontSize: '0.82rem' }}>{role.company}</p>
              <p style={{ color: 'var(--bond-text-dim)', fontSize: '0.75rem', margin: '0 0 0.4rem' }}>{role.location} — {role.date}</p>
              <p>{role.description}</p>
              <ul>
                {role.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
              <div className="book-reader-tags">
                {role.skills.map((s) => <span className="book-reader-tag" key={s}>{s}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div className="book-reader-divider" />

        {/* Projects */}
        <div className="book-reader-section">
          <div className="book-reader-section-label">Featured Work</div>
          <h3>Projects</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.8rem' }}>
            {projects.map((project) => (
              <div key={project.title} style={{
                padding: '1rem',
                border: '1px solid var(--bond-border)',
                borderRadius: '0.7rem',
                background: 'rgba(74, 158, 237, 0.02)',
                transition: 'border-color 0.3s',
              }}>
                <p style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', fontWeight: 700, color: 'var(--bond-blue)', margin: '0 0 0.3rem' }}>{project.title}</p>
                <p style={{ fontSize: '0.78rem', margin: '0 0 0.5rem' }}>{project.description}</p>
                <div className="book-reader-tags">
                  {project.tech.map((t) => <span className="book-reader-tag" key={t}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="book-reader-divider" />

        {/* Social */}
        <div className="book-reader-section">
          <div className="book-reader-section-label">Presence</div>
          <h3>Connect</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--bond-border)',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontFamily: 'Orbitron',
                  fontWeight: 600,
                  color: 'var(--bond-text-dim)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '1.5rem 0 0.5rem', position: 'relative', zIndex: 2 }}>
          <p style={{ fontFamily: 'Orbitron', fontSize: '0.6rem', color: 'var(--bond-blue-dim)', letterSpacing: '0.2em' }}>
            007 PORTFOLIO EDITION — {identity.name.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookReader
