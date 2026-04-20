import { pages } from './bookData.js'
import { portfolioData, projectCollections } from './portfolioData.js'

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
        subtitle: 'AI systems, product thinking, and end-to-end execution.',
        location: portfolioData.identity.location,
        email: portfolioData.identity.email,
        site: 'pranavsagar.us',
        metrics: portfolioData.metrics,
        summary:
          "An interactive portfolio built as a readable artifact. The work inside reflects real products, real systems, and the execution style behind Pranav Sagar's portfolio.",
        focus:
          'Building AI-native tools, local-first operators, communication systems, and polished software across web, desktop, and mobile.',
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
        title: projectCollections[0].title,
        summary: projectCollections[0].summary,
        projects: projectCollections[0].projects,
      }
    case 6:
      return {
        type: 'projects',
        label,
        title: projectCollections[1].title,
        summary: projectCollections[1].summary,
        projects: projectCollections[1].projects,
      }
    case 7:
      return {
        type: 'projects',
        label,
        title: projectCollections[2].title,
        summary: projectCollections[2].summary,
        projects: projectCollections[2].projects,
      }
    case 8:
      return {
        type: 'projects',
        label,
        title: projectCollections[3].title,
        summary: projectCollections[3].summary,
        projects: projectCollections[3].projects,
      }
    case 9:
      return {
        type: 'contact',
        label,
        title: 'Contact',
        links: portfolioData.links,
        socialLinks: portfolioData.socialLinks,
      }
    case 10:
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
