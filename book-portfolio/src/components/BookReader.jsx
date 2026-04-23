import { useEffect } from 'react'
import { portfolioData, projectCollections } from '../lib/portfolioData.js'

function BookReader({ onClose }) {
  useEffect(() => {
    if (!onClose) {
      return undefined
    }

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const {
    identity,
    about,
    skills,
    education,
    certifications,
    experience,
    metrics,
    socialLinks,
  } = portfolioData

  return (
    <div
      className="book-reader-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div className="book-reader-container">
        <button className="book-reader-close" onClick={onClose} type="button">
          Close
        </button>

        <div className="book-reader-header">
          <div className="book-reader-eyebrow">Readable Portfolio</div>
          <h2>{identity.name}</h2>
          <p>{identity.title} · {identity.location}</p>
        </div>

        <div className="book-reader-hero">
          <div className="book-reader-hero-copy">
            <p className="book-reader-hero-kicker">Overview</p>
            <h3>Systems-minded product work across web, desktop, and iOS.</h3>
            <p>
              This reader is the clean-text version of the book. It focuses on the
              work, the operating style, and the execution signals that matter.
            </p>
          </div>

          <div className="book-reader-metrics-grid">
            {metrics.map(([value, label]) => (
              <div className="book-reader-metric" key={label}>
                <div className="book-reader-metric-value">{value}</div>
                <div className="book-reader-metric-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="book-reader-section">
          <div className="book-reader-section-label">Identity</div>
          <h3>{identity.name}</h3>
          <p>{identity.title} — {identity.location}</p>
          <p>{identity.email}</p>
          <div className="book-reader-tags">
            {identity.roles.map((role) => (
              <span className="book-reader-tag" key={role}>
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="book-reader-divider" />

        <div className="book-reader-section">
          <div className="book-reader-section-label">About</div>
          <h3>How I Build</h3>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <h3>Operating Notes</h3>
          <ul>
            {about.funFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>

        <div className="book-reader-divider" />

        <div className="book-reader-section">
          <div className="book-reader-section-label">Stack</div>
          <h3>Skills & Technologies</h3>
          {Object.entries(skills).map(([category, tags]) => (
            <div className="book-reader-skill-group" key={category}>
              <p className="book-reader-inline-label">{category}</p>
              <div className="book-reader-tags">
                {tags.map((tag) => (
                  <span className="book-reader-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="book-reader-divider" />

        <div className="book-reader-section">
          <div className="book-reader-section-label">Journey</div>
          <h3>Education</h3>
          {education.map((entry) => (
            <div className="book-reader-entry" key={entry.school}>
              <p className="book-reader-entry-title">{entry.degree}</p>
              <p className="book-reader-entry-subtitle">
                {entry.school} — {entry.location}
              </p>
              <div className="book-reader-tags book-reader-tags-spaced">
                {entry.meta.map((meta) => (
                  <span className="book-reader-tag" key={meta}>
                    {meta}
                  </span>
                ))}
              </div>
              <p>{entry.description}</p>
              <ul>
                {entry.achievements.slice(0, 4).map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="book-reader-section">
          <div className="book-reader-section-label">Credentials</div>
          <h3>Certifications & Courses</h3>
          <p className="book-reader-inline-label">Certifications</p>
          <ul>
            {certifications.certifications.map((certification) => (
              <li key={certification}>{certification}</li>
            ))}
          </ul>
          <p className="book-reader-inline-label book-reader-inline-label-spaced">
            Courses
          </p>
          <ul>
            {certifications.courses.map((course) => (
              <li key={course}>{course}</li>
            ))}
          </ul>
        </div>

        <div className="book-reader-divider" />

        <div className="book-reader-section">
          <div className="book-reader-section-label">Experience</div>
          <h3>Where I've Worked</h3>
          {experience.map((role) => (
            <div className="book-reader-entry" key={`${role.title}${role.company}`}>
              <p className="book-reader-entry-title">{role.title}</p>
              <p className="book-reader-entry-subtitle">{role.company}</p>
              <p className="book-reader-entry-meta">
                {role.location} — {role.date}
              </p>
              <p>{role.description}</p>
              <ul>
                {role.highlights.slice(0, 4).map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <div className="book-reader-tags">
                {role.skills.map((skill) => (
                  <span className="book-reader-tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="book-reader-divider" />

        <div className="book-reader-section">
          <div className="book-reader-section-label">Featured Work</div>
          <h3>Projects</h3>
          {projectCollections.map((collection) => (
            <div className="book-reader-entry" key={collection.id}>
              <p className="book-reader-entry-title">{collection.title}</p>
              <p>{collection.summary}</p>
              <div className="book-reader-project-grid">
                {collection.projects.map((project) => (
                  <div className="book-reader-project-card" key={project.title}>
                    <p className="book-reader-project-title">{project.title}</p>
                    <p>{project.description}</p>
                    <div className="book-reader-tags">
                      {project.tech.map((tech) => (
                        <span className="book-reader-tag" key={tech}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="book-reader-divider" />

        <div className="book-reader-section">
          <div className="book-reader-section-label">Presence</div>
          <h3>Connect</h3>
          <div className="book-reader-social-grid">
            {socialLinks.map((link) => (
              <a
                className="book-reader-social-link"
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="book-reader-footer">
          <p>{identity.name} Portfolio</p>
        </div>
      </div>
    </div>
  )
}

export default BookReader
