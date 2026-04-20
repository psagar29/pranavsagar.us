export const bookMeta = {
  title: 'Pranav Sagar',
  year: '',
  subtitle: 'Pranav Sagar Portfolio',
  linkLabel: 'PranavSagar.us',
  linkHref: 'https://pranavsagar.us',
}

export const pages = [
  { label: 'Cover', frontId: 'coverFront', backId: 'insideCover' },
  { label: 'Intro', frontId: 'hero', backId: 'about' },
  { label: 'About', frontId: 'gallery', backId: 'skills' },
  { label: 'Education', frontId: 'education', backId: 'certifications' },
  { label: 'Experience', frontId: 'experience', backId: 'projectNotesA' },
  { label: 'Projects I', frontId: 'projectsA', backId: 'projectNotesB' },
  { label: 'Projects II', frontId: 'projectsB', backId: 'projectNotesC' },
  { label: 'Projects III', frontId: 'projectsC', backId: 'projectNotesD' },
  { label: 'Projects IV', frontId: 'projectsD', backId: 'contactPrelude' },
  { label: 'Contact', frontId: 'contact', backId: 'social' },
  { label: 'Finale', frontId: 'finale', backId: 'backCover' },
]

export const navigationItems = [
  ...pages.map((page, index) => ({
    label: page.label,
    target: index,
  })),
  {
    label: 'Back Cover',
    target: pages.length,
  },
]

export const menuLinks = [
  { label: 'Website', href: 'https://pranavsagar.us' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/pranav-sagar-whythisurlissolong/',
  },
  { label: 'GitHub', href: 'https://github.com/psagar29' },
  { label: 'Instagram', href: 'https://www.instagram.com/perhapspranav' },
  { label: 'Email', href: 'mailto:psagar2@asu.edu' },
]
