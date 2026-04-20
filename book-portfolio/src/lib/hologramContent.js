import { pages } from './bookData.js'
import { portfolioData } from './portfolioData.js'

export function getHologramContent(currentPage) {
  if (currentPage <= 0 || currentPage >= pages.length) {
    return null
  }

  const label = pages[currentPage].label

  switch (currentPage) {
    case 1:
      return {
        type: 'intro',
        label,
        title: 'Pranav Sagar',
        subtitle: 'Full-stack systems. AI products. Real execution.',
        location: portfolioData.identity.location,
        email: portfolioData.identity.email,
        site: 'pranavsagar.us',
        metrics: portfolioData.metrics,
        summary:
          'This portfolio presents a personal artifact and interactive portfolio experience built from the real content projects in my son and work by Pranav Sagar.',
        focus:
          'Building local-first AI operators, communication tools, academic agents, and production-grade portfolio systems.',
      }
    case 2:
      return {
        type: 'about',
        label,
        title: 'About',
        paragraphs: portfolioData.about.paragraphs,
        funFacts: portfolioData.about.funFacts,
        skills: portfolioData.skills,
      }
    case 3:
      return {
        type: 'education',
        label,
        title: 'Education & Certifications',
        education: portfolioData.education,
        certifications: portfolioData.certifications.certifications.slice(0, 4),
      }
    case 4:
      return {
        type: 'experience',
        label,
        title: 'Experience',
        experience: portfolioData.experience,
        metrics: portfolioData.metrics,
      }
    case 5:
      return {
        type: 'projects',
        label,
        title: 'Projects I',
        projects: portfolioData.projects.slice(0, 4),
      }
    case 6:
      return {
        type: 'projects',
        label,
        title: 'Projects II',
        projects: portfolioData.projects.slice(8, 12),
      }
    case 7:
      return {
        type: 'contact',
        label,
        title: 'Contact',
        links: portfolioData.links,
        socialLinks: portfolioData.socialLinks,
      }
    case 8:
      return {
        type: 'finale',
        label,
        title: 'Finale',
        paragraphs: [
          "The through-line across Pranav's work is not just taste or technical range. It is momentum.",
          'Ideas become systems. Systems become products. Products become artifacts that people can actually use.',
        ],
        links: portfolioData.socialLinks,
      }
    default:
      return {
        type: 'generic',
        label,
        title: label,
        bullets: [],
      }
  }
}
