import { Html } from '@react-three/drei'
import { useMemo, useState } from 'react'
import { pages } from '../lib/bookData.js'
import { getHologramContent } from '../lib/hologramContent.js'
import { portfolioData } from '../lib/portfolioData.js'

/* ── Per-page full-content renderers ─────────────────────── */

function HologramIntro({ content }) {
  return (
    <>
      <div className="holo-section-label">{content.label}</div>
      <h2 className="holo-heading">{content.title}</h2>
      <p className="holo-sub">{content.subtitle}</p>

      <div className="holo-quick-grid is-intro">
        <div className="holo-quick-card">
          <span className="holo-quick-label">Base</span>
          <span className="holo-quick-value">{content.location}</span>
        </div>
        <div className="holo-quick-card">
          <span className="holo-quick-label">Site</span>
          <span className="holo-quick-value">{content.site}</span>
        </div>
        <div className="holo-quick-card is-span-two">
          <span className="holo-quick-label">Email</span>
          <span className="holo-quick-value">{content.email}</span>
        </div>
      </div>

      <div className="holo-card is-intro-block">
        <div className="holo-card-title">Artifact Summary</div>
        <p className="holo-body">{content.summary}</p>
      </div>

      <div className="holo-metrics">
        {content.metrics.map(([value, label]) => (
          <div className="holo-metric" key={label}>
            <span className="holo-metric-value">{value}</span>
            <span className="holo-metric-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="holo-card is-intro-block">
        <div className="holo-card-title">Current Focus</div>
        <p className="holo-body">{content.focus}</p>
      </div>
    </>
  )
}

function HologramAbout({ content }) {
  return (
    <>
      <div className="holo-section-label">{content.label}</div>
      <h2 className="holo-heading">{content.title}</h2>

      {content.paragraphs.map((p, i) => (
        <p className="holo-body" key={i}>{p}</p>
      ))}

      <h3 className="holo-subheading">Fun Facts</h3>
      <ul className="holo-list">
        {content.funFacts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>

      <h3 className="holo-subheading">Skills & Technologies</h3>
      {Object.entries(content.skills).map(([category, tags]) => (
        <div key={category} className="holo-skill-group">
          <div className="holo-skill-label">{category}</div>
          <div className="holo-tags">
            {tags.map((tag) => (
              <span className="holo-tag" key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function HologramEducation({ content }) {
  return (
    <>
      <div className="holo-section-label">{content.label}</div>
      <h2 className="holo-heading">{content.title}</h2>

      {content.education.map((entry) => (
        <div className="holo-card" key={entry.school}>
          <div className="holo-card-title">{entry.degree}</div>
          <div className="holo-card-sub">{entry.school} — {entry.location}</div>
          <div className="holo-tags" style={{ marginTop: '0.3rem' }}>
            {entry.meta.map((m) => (
              <span className="holo-tag" key={m}>{m}</span>
            ))}
          </div>
          <p className="holo-body">{entry.description}</p>
          <ul className="holo-list">
            {entry.achievements.slice(0, 2).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <div className="holo-tags">
            {entry.highlights.slice(0, 4).map((h) => (
              <span className="holo-tag" key={h}>{h}</span>
            ))}
          </div>
        </div>
      ))}

      <h3 className="holo-subheading">Featured Certifications</h3>
      <div className="holo-tags">
        {content.certifications.map((certification) => (
          <span className="holo-tag" key={certification}>{certification}</span>
        ))}
      </div>
    </>
  )
}

function HologramExperience({ content }) {
  return (
    <>
      <div className="holo-section-label">{content.label}</div>
      <h2 className="holo-heading">{content.title}</h2>

      {content.experience.slice(0, 3).map((role) => (
        <div className="holo-card" key={role.title + role.company}>
          <div className="holo-card-title">{role.title}</div>
          <div className="holo-card-sub">{role.company}</div>
          <div className="holo-card-meta">{role.location} — {role.date}</div>
          <p className="holo-body">{role.description}</p>
          <ul className="holo-list">
            {role.highlights.slice(0, 2).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <div className="holo-tags">
            {role.skills.map((s) => (
              <span className="holo-tag" key={s}>{s}</span>
            ))}
          </div>
        </div>
      ))}

      <div className="holo-metrics">
        {content.metrics.map(([value, label]) => (
          <div className="holo-metric" key={label}>
            <span className="holo-metric-value">{value}</span>
            <span className="holo-metric-label">{label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function HologramProjects({ content }) {
  const visibleProjects = content.projects.slice(0, 4)

  return (
    <>
      <div className="holo-section-label">{content.label}</div>
      <h2 className="holo-heading">{content.title}</h2>

      <div className="holo-project-grid">
        {visibleProjects.map((project) => (
          <div className="holo-card" key={project.title}>
            <div className="holo-card-title">{project.title}</div>
            <p className="holo-body">{project.description}</p>
            <div className="holo-tags">
              {project.tech.map((t) => (
                <span className="holo-tag" key={t}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function HologramContact({ content }) {
  const [status, setStatus] = useState('idle')
  const quickLinks = content.links.slice(0, 3)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('sending')
    try {
      const response = await fetch(portfolioData.contactForm.action, {
        method: 'POST',
        body: new FormData(event.currentTarget),
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error('Failed')
      event.currentTarget.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <div className="holo-section-label">{content.label}</div>
      <h2 className="holo-heading">{content.title}</h2>
      <p className="holo-body">
        Send the brief, the internship, or the product idea. The fastest route is the form.
      </p>

      <div className="holo-quick-grid">
        {quickLinks.map(([label, value]) => (
          <div className="holo-quick-card" key={label}>
            <span className="holo-quick-label">{label}</span>
            <span className="holo-quick-value">{value}</span>
          </div>
        ))}
      </div>

      <h3 className="holo-subheading">Social</h3>
      <div className="holo-tags">
        {content.socialLinks.map((link) => (
          <a className="holo-tag holo-tag-link" href={link.href} target="_blank" rel="noreferrer" key={link.label}>
            {link.label}
          </a>
        ))}
      </div>

      <h3 className="holo-subheading">Send a Message</h3>
      <form className="holo-form" onSubmit={handleSubmit}>
        <div className="holo-form-row">
          {portfolioData.contactForm.fields.slice(0, 2).map((field) => (
            <label className="holo-field is-half" key={field.name}>
              <span>{field.label}</span>
              <input
                className="holo-input"
                name={field.name}
                placeholder={field.placeholder}
                required
                type={field.type}
              />
            </label>
          ))}
        </div>
        {portfolioData.contactForm.fields.slice(2).map((field) => (
          <label className="holo-field" key={field.name}>
            <span>{field.label}</span>
            {field.type === 'textarea' ? (
              <textarea
                className="holo-input holo-textarea"
                name={field.name}
                placeholder={field.placeholder}
                required
              />
            ) : (
              <input
                className="holo-input"
                name={field.name}
                placeholder={field.placeholder}
                required
                type={field.type}
              />
            )}
          </label>
        ))}
        <button className="holo-submit" type="submit">
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      {status === 'success' && (
        <div className="holo-status is-success">{portfolioData.contactForm.successMessage}</div>
      )}
      {status === 'error' && (
        <div className="holo-status is-error">Message failed. Try again.</div>
      )}
    </>
  )
}

function HologramFinale({ content }) {
  return (
    <>
      <div className="holo-section-label">{content.label}</div>
      <h2 className="holo-heading">{content.title}</h2>

      {content.paragraphs.map((p, i) => (
        <p className="holo-body" key={i}>{p}</p>
      ))}

      <h3 className="holo-subheading">Connect</h3>
      <div className="holo-tags">
        {content.links.map((link) => (
          <a className="holo-tag holo-tag-link" href={link.href} target="_blank" rel="noreferrer" key={link.label}>
            {link.label}
          </a>
        ))}
      </div>
    </>
  )
}

/* ── Panel wrapper ──────────────────────────────────────── */

function HologramPanel({ content }) {
  if (!content) return null

  const renderer = {
    intro: HologramIntro,
    about: HologramAbout,
    education: HologramEducation,
    experience: HologramExperience,
    projects: HologramProjects,
    contact: HologramContact,
    finale: HologramFinale,
  }

  const Component = renderer[content.type]

  return (
    <div className={`hologram-panel is-${content.type}`}>
      <div className="hologram-grid" />
      <div className="hologram-glow" />
      <div className="hologram-content">
        {Component ? <Component content={content} /> : (
          <>
            <div className="holo-section-label">{content.label}</div>
            <h2 className="holo-heading">{content.title}</h2>
          </>
        )}
      </div>
    </div>
  )
}

/* ── 3D anchor — hologram only, no light/projector ──────── */

function HologramProjector({ currentPage, isMobile = false }) {
  const content = useMemo(() => getHologramContent(currentPage), [currentPage])
  const active = currentPage > 0 && currentPage < pages.length && content

  const layout = content?.type === 'contact'
    ? {
        groupPosition: [-1.94, -0.24, 0.92],
        panelPosition: [0.54, 0.94, 0.12],
        distanceFactor: 0.88,
      }
    : content?.type === 'intro'
      ? {
          groupPosition: [-1.56, -0.34, 0.92],
          panelPosition: [0.72, 0.98, 0.12],
          distanceFactor: 0.76,
        }
    : {
        groupPosition: [-1.9, -0.46, 0.92],
        panelPosition: [0.58, 0.92, 0.1],
        distanceFactor: 0.84,
      }

  if (!active || isMobile) return null

  return (
    <group position={layout.groupPosition}>
      <Html
        distanceFactor={layout.distanceFactor}
        position={layout.panelPosition}
        sprite
        transform
        zIndexRange={[25, 0]}
      >
        <HologramPanel content={content} />
      </Html>
    </group>
  )
}

export { HologramPanel }
export default HologramProjector
