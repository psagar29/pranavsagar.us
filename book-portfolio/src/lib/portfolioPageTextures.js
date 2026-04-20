import * as THREE from 'three'
import { portfolioData } from './portfolioData.js'

const PAGE_WIDTH = 1200
const PAGE_HEIGHT = 1620
const PAGE_PADDING = 92
const INTRO_TEXTURE_SCALE = 1.75

// Bond color palette
const PAPER = '#060d18'
const PAPER_ALT = '#0a1428'
const PAPER_LIGHT = '#f0f2f6'
const PAPER_LIGHT_ALT = '#e4e8f0'
const INK_LIGHT = '#111827'
const TEXT_LIGHT = '#d0d8e4'
const TEXT_DIM = '#6b7a8d'
const MUTED_LIGHT = '#4a5568'
const BLUE = '#4a9eed'
const BLUE_DIM = 'rgba(74, 158, 237, 0.7)'
const BLUE_SUBTLE = 'rgba(74, 158, 237, 0.15)'
const DARK = '#060d18'
const BORDER_DARK = 'rgba(74, 158, 237, 0.12)'
const BORDER_LIGHT = '#b0b8c8'
const ACCENT = '#1e3a5f'
const SANS = '"Arial", "Helvetica", sans-serif'
const SERIF = '"Georgia", "Times New Roman", serif'

function createPageCanvas({ dark = false, scale = 1 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(PAGE_WIDTH * scale)
  canvas.height = Math.round(PAGE_HEIGHT * scale)
  const context = canvas.getContext('2d')
  context.scale(scale, scale)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  const gradient = context.createLinearGradient(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  if (dark) {
    gradient.addColorStop(0, '#040a14')
    gradient.addColorStop(1, '#0a1428')
  } else {
    gradient.addColorStop(0, PAPER_LIGHT)
    gradient.addColorStop(1, PAPER_LIGHT_ALT)
  }

  context.fillStyle = gradient
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  if (dark) {
    context.strokeStyle = 'rgba(74, 158, 237, 0.02)'
    context.lineWidth = 1
    for (let i = 0; i < PAGE_WIDTH; i += 40) {
      context.beginPath()
      context.moveTo(i, 0)
      context.lineTo(i, PAGE_HEIGHT)
      context.stroke()
    }
    for (let i = 0; i < PAGE_HEIGHT; i += 40) {
      context.beginPath()
      context.moveTo(0, i)
      context.lineTo(PAGE_WIDTH, i)
      context.stroke()
    }
  } else {
    for (let index = 0; index < 250; index += 1) {
      const x = ((index * 187) % PAGE_WIDTH) + 0.5
      const y = ((index * 97) % PAGE_HEIGHT) + 0.5
      const size = (index % 3) + 1
      context.fillStyle = `rgba(40, 50, 70, ${0.012 + (index % 5) * 0.003})`
      context.fillRect(x, y, size, size)
    }
  }

  return { canvas, context }
}

function roundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + safeRadius, y)
  context.lineTo(x + width - safeRadius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  context.lineTo(x + width, y + height - safeRadius)
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  context.lineTo(x + safeRadius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  context.lineTo(x, y + safeRadius)
  context.quadraticCurveTo(x, y, x + safeRadius, y)
  context.closePath()
}

function fillRoundedRect(context, x, y, width, height, radius, fillStyle) {
  context.save()
  roundedRect(context, x, y, width, height, radius)
  context.fillStyle = fillStyle
  context.fill()
  context.restore()
}

function strokeRoundedRect(context, x, y, width, height, radius, strokeStyle) {
  context.save()
  roundedRect(context, x, y, width, height, radius)
  context.strokeStyle = strokeStyle
  context.stroke()
  context.restore()
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines = Number.POSITIVE_INFINITY) {
  const words = text.split(' ')
  let line = ''
  let linesDrawn = 0

  for (let index = 0; index < words.length; index += 1) {
    const testLine = line ? `${line} ${words[index]}` : words[index]
    const metrics = context.measureText(testLine)

    if (metrics.width > maxWidth && line) {
      context.fillText(line, x, y)
      line = words[index]
      y += lineHeight
      linesDrawn += 1
      if (linesDrawn + 1 >= maxLines) {
        context.fillText(`${line}...`, x, y)
        return y + lineHeight
      }
    } else {
      line = testLine
    }
  }

  context.fillText(line, x, y)
  return y + lineHeight
}

function drawParagraphs(context, paragraphs, x, y, width, options = {}) {
  const {
    font = `30px ${SERIF}`,
    fillStyle = MUTED_LIGHT,
    lineHeight = 42,
    gap = 22,
    maxLinesPerParagraph,
  } = options

  context.fillStyle = fillStyle
  context.font = font

  paragraphs.forEach((paragraph) => {
    y = drawWrappedText(context, paragraph, x, y, width, lineHeight, maxLinesPerParagraph)
    y += gap
  })

  return y
}

function drawBulletList(context, items, x, y, maxWidth, options = {}) {
  const {
    font = `24px ${SERIF}`,
    fillStyle = MUTED_LIGHT,
    bulletColor = ACCENT,
    lineHeight = 32,
    gap = 10,
    maxLinesPerItem = 3,
  } = options

  context.font = font
  context.fillStyle = fillStyle

  items.forEach((item) => {
    context.fillStyle = bulletColor
    context.beginPath()
    context.arc(x + 8, y - 8, 4, 0, Math.PI * 2)
    context.fill()

    context.fillStyle = fillStyle
    y = drawWrappedText(context, item, x + 24, y, maxWidth - 24, lineHeight, maxLinesPerItem)
    y += gap
  })

  return y
}

function displayValue(value) {
  return value
    .replace(/^https?:\/\//, '')
    .replace(/^mailto:/, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

function drawChip(context, label, x, y, width, { dark = false } = {}) {
  if (dark) {
    fillRoundedRect(context, x, y, width, 44, 22, BLUE_SUBTLE)
    strokeRoundedRect(context, x, y, width, 44, 22, 'rgba(74, 158, 237, 0.25)')
    context.fillStyle = BLUE
    context.font = `700 18px ${SANS}`
    context.fillText(label, x + 20, y + 28)
  } else {
    fillRoundedRect(context, x, y, width, 44, 22, 'rgba(30, 58, 95, 0.09)')
    strokeRoundedRect(context, x, y, width, 44, 22, 'rgba(30, 58, 95, 0.2)')
    context.fillStyle = ACCENT
    context.font = `700 18px ${SANS}`
    context.fillText(label, x + 20, y + 28)
  }
}

function drawInfoCard(context, label, value, x, y, width, height, { dark = false } = {}) {
  const background = dark ? 'rgba(74, 158, 237, 0.05)' : 'rgba(17, 24, 39, 0.035)'
  const border = dark ? BORDER_DARK : 'rgba(17, 24, 39, 0.08)'
  const labelColor = dark ? BLUE : ACCENT
  const valueColor = dark ? '#e4e8f0' : INK_LIGHT

  fillRoundedRect(context, x, y, width, height, 24, background)
  strokeRoundedRect(context, x, y, width, height, 24, border)

  context.fillStyle = labelColor
  context.font = `700 18px ${SANS}`
  context.fillText(label.toUpperCase(), x + 24, y + 34)

  context.fillStyle = valueColor
  context.font = `600 25px ${SANS}`
  drawWrappedText(context, displayValue(value), x + 24, y + 70, width - 48, 30, 2)
}

function drawFormField(context, label, placeholder, x, y, width, height, { dark = false } = {}) {
  const labelColor = dark ? BLUE : ACCENT
  const fieldBackground = dark ? 'rgba(4, 8, 18, 0.72)' : 'rgba(255, 255, 255, 0.68)'
  const border = dark ? BORDER_DARK : 'rgba(17, 24, 39, 0.12)'
  const placeholderColor = dark ? 'rgba(208, 216, 228, 0.4)' : 'rgba(17, 24, 39, 0.35)'

  context.fillStyle = labelColor
  context.font = `700 16px ${SANS}`
  context.fillText(label.toUpperCase(), x, y)

  fillRoundedRect(context, x, y + 16, width, height, 18, fieldBackground)
  strokeRoundedRect(context, x, y + 16, width, height, 18, border)

  context.fillStyle = placeholderColor
  context.font = `500 22px ${SANS}`
  context.fillText(placeholder, x + 20, y + 16 + height / 2 + 8)
}

function drawTagRow(context, tags, x, y, maxWidth, color = INK_LIGHT) {
  let cursorX = x
  let cursorY = y
  context.font = `700 18px ${SANS}`

  tags.forEach((tag) => {
    const tagWidth = context.measureText(tag).width + 36
    if (cursorX + tagWidth > x + maxWidth) {
      cursorX = x
      cursorY += 46
    }
    fillRoundedRect(context, cursorX, cursorY, tagWidth, 34, 17, 'rgba(17, 24, 39, 0.06)')
    strokeRoundedRect(context, cursorX, cursorY, tagWidth, 34, 17, 'rgba(17, 24, 39, 0.1)')
    context.fillStyle = color
    context.fillText(tag, cursorX + 18, cursorY + 22)
    cursorX += tagWidth + 12
  })

  return cursorY + 50
}

function drawSectionHeader(context, kicker, title, x, y, options = {}) {
  const { accent = ACCENT, dark = false } = options
  const headingColor = dark ? '#e4e8f0' : INK_LIGHT
  const kickerColor = dark ? BLUE : accent

  context.fillStyle = kickerColor
  context.font = `700 18px ${SANS}`
  context.fillText(kicker.toUpperCase(), x, y)
  context.fillRect(x, y + 12, 120, 4)
  context.fillStyle = headingColor
  context.font = `700 72px ${SANS}`
  context.fillText(title, x, y + 84)
  return y + 118
}

function drawPhoto(context, image, x, y, width, height, radius = 24, options = {}) {
  const { positionX = 0.5, positionY = 0.5, scale = 1 } = options
  context.save()
  roundedRect(context, x, y, width, height, radius)
  context.clip()

  const drawScale = Math.max(width / image.width, height / image.height) * scale
  const drawWidth = image.width * drawScale
  const drawHeight = image.height * drawScale
  const overflowX = Math.max(0, drawWidth - width)
  const overflowY = Math.max(0, drawHeight - height)
  const offsetX = x - overflowX * positionX
  const offsetY = y - overflowY * positionY

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
  context.restore()
  strokeRoundedRect(context, x, y, width, height, radius, 'rgba(17, 24, 39, 0.12)')
}

function drawFullBleedImage(context, image, options = {}) {
  const { x = 0, y = 0, width = PAGE_WIDTH, height = PAGE_HEIGHT, positionX = 0.5, positionY = 0.5 } = options
  const drawScale = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * drawScale
  const drawHeight = image.height * drawScale
  const overflowX = Math.max(0, drawWidth - width)
  const overflowY = Math.max(0, drawHeight - height)
  const offsetX = x - overflowX * positionX
  const offsetY = y - overflowY * positionY
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
}

function drawMetricCard(context, value, label, x, y, width, { dark = true } = {}) {
  if (dark) {
    fillRoundedRect(context, x, y, width, 150, 28, '#060d18')
    strokeRoundedRect(context, x, y, width, 150, 28, BORDER_DARK)
    context.fillStyle = BLUE
    context.font = `700 58px ${SANS}`
    context.fillText(value, x + 26, y + 74)
    context.fillStyle = BLUE_DIM
    context.font = `700 18px ${SANS}`
    context.fillText(label.toUpperCase(), x + 28, y + 112)
  } else {
    fillRoundedRect(context, x, y, width, 150, 28, '#0a1428')
    context.fillStyle = '#e4e8f0'
    context.font = `700 58px ${SANS}`
    context.fillText(value, x + 26, y + 74)
    context.fillStyle = '#8899aa'
    context.font = `700 18px ${SANS}`
    context.fillText(label.toUpperCase(), x + 28, y + 112)
  }
}

function toTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

// ── Cover pages ───────────────────────────────────────────

function buildCoverFront(portraitImage, coverArtImage) {
  const { canvas, context } = createPageCanvas({ dark: true })
  drawFullBleedImage(context, coverArtImage, { positionY: 0.14 })

  // Lift the comic art so the closed cover reads clearly at a distance.
  context.save()
  context.globalCompositeOperation = 'screen'
  const spotlight = context.createRadialGradient(
    PAGE_WIDTH * 0.6,
    PAGE_HEIGHT * 0.4,
    80,
    PAGE_WIDTH * 0.62,
    PAGE_HEIGHT * 0.44,
    900,
  )
  spotlight.addColorStop(0, 'rgba(255, 255, 255, 0.24)')
  spotlight.addColorStop(0.45, 'rgba(168, 203, 255, 0.24)')
  spotlight.addColorStop(1, 'rgba(168, 203, 255, 0)')
  context.fillStyle = spotlight
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  context.restore()

  const topFade = context.createLinearGradient(0, 0, 0, PAGE_HEIGHT)
  topFade.addColorStop(0, 'rgba(0, 4, 12, 0.03)')
  topFade.addColorStop(0.45, 'rgba(0, 4, 12, 0.01)')
  topFade.addColorStop(1, 'rgba(0, 4, 12, 0.16)')
  context.fillStyle = topFade
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  const lowerGlow = context.createLinearGradient(0, PAGE_HEIGHT * 0.55, 0, PAGE_HEIGHT)
  lowerGlow.addColorStop(0, 'rgba(84, 132, 220, 0)')
  lowerGlow.addColorStop(1, 'rgba(84, 132, 220, 0.18)')
  context.fillStyle = lowerGlow
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  // Blue border
  context.strokeStyle = 'rgba(112, 178, 255, 0.28)'
  context.lineWidth = 3
  context.strokeRect(40, 40, PAGE_WIDTH - 80, PAGE_HEIGHT - 80)

  // Inner border
  context.strokeStyle = 'rgba(200, 220, 255, 0.12)'
  context.lineWidth = 1
  context.strokeRect(50, 50, PAGE_WIDTH - 100, PAGE_HEIGHT - 100)

  // Portrait card
  fillRoundedRect(context, 728, 1038, 274, 432, 22, 'rgba(4, 8, 18, 0.72)')
  strokeRoundedRect(context, 728, 1038, 274, 432, 22, 'rgba(112, 178, 255, 0.32)')
  drawPhoto(context, portraitImage, 746, 1056, 238, 332, 18, { positionY: 0.16 })

  fillRoundedRect(context, 746, 1404, 238, 46, 12, 'rgba(4, 8, 18, 0.78)')
  context.fillStyle = BLUE
  context.font = `700 18px ${SANS}`
  context.textAlign = 'center'
  context.fillText('PRANAV SAGAR', 865, 1433)
  context.textAlign = 'left'

  // Info card
  fillRoundedRect(context, 92, 1288, 420, 182, 18, 'rgba(4, 8, 18, 0.68)')
  strokeRoundedRect(context, 92, 1288, 420, 182, 18, 'rgba(112, 178, 255, 0.22)')
  context.fillStyle = BLUE
  context.font = `700 20px ${SANS}`
  context.fillText('PORTFOLIO EDITION', 120, 1332)
  context.fillStyle = '#e4e8f0'
  context.font = `700 46px ${SANS}`
  context.fillText('Pranav Sagar', 120, 1394)
  context.fillStyle = '#b0b8c8'
  context.font = `400 22px ${SANS}`
  context.fillText('Full-stack systems. AI products.', 120, 1430)
  context.fillText('pranavsagar.us', 120, 1460)

  return toTexture(canvas)
}

function buildInsideCover(portraitImage) {
  const { canvas, context } = createPageCanvas({ scale: INTRO_TEXTURE_SCALE })
  const rightColumnX = 796
  const rightColumnWidth = 258
  const photoY = 258
  const photoWidth = 254
  const photoHeight = 404
  let y = drawSectionHeader(context, 'Pranav Sagar', 'Portfolio Book', PAGE_PADDING, 96)

  context.fillStyle = INK_LIGHT
  context.font = `700 34px ${SANS}`
  context.fillText('Full-stack systems. AI products. Real execution.', PAGE_PADDING, y + 8)

  y = drawParagraphs(
    context,
    [
      'This portfolio presents a personal artifact and interactive portfolio experience built from the real content projects in my son and work by Pranav Sagar.',
    ],
    PAGE_PADDING, y + 74, 628,
    { font: `32px ${SERIF}`, lineHeight: 46, gap: 26 },
  )

  drawChip(context, 'psagar2@asu.edu', PAGE_PADDING, y + 18, 250)
  drawChip(context, 'Tempe, Arizona', PAGE_PADDING + 270, y + 18, 220)
  drawChip(context, 'pranavsagar.us', PAGE_PADDING, y + 82, 220)

  fillRoundedRect(context, rightColumnX - 16, photoY - 16, photoWidth + 32, photoHeight + 32, 36, 'rgba(30, 58, 95, 0.08)')
  strokeRoundedRect(context, rightColumnX - 16, photoY - 16, photoWidth + 32, photoHeight + 32, 36, 'rgba(30, 58, 95, 0.12)')
  drawPhoto(context, portraitImage, rightColumnX, photoY, photoWidth, photoHeight, 28, { positionY: 0.18 })

  context.fillStyle = ACCENT
  context.font = `700 20px ${SANS}`
  context.fillText('CURRENT FOCUS', rightColumnX, 720)
  drawParagraphs(
    context,
    ['Building local-first AI operators, multi-platform communication tools, autonomous academic agents, and production-grade portfolio systems.'],
    rightColumnX, 760, rightColumnWidth,
    { font: `27px ${SERIF}`, lineHeight: 40 },
  )

  context.fillStyle = MUTED_LIGHT
  context.font = `italic 26px ${SERIF}`
  context.fillText('"Building the future, one system at a time."', PAGE_PADDING, 1450)
  return toTexture(canvas)
}

// ── Content pages ─────────────────────────────────────────

function buildHeroPage() {
  const { canvas, context } = createPageCanvas({ scale: INTRO_TEXTURE_SCALE })
  const gradient = context.createLinearGradient(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  gradient.addColorStop(0, '#f0f2f6')
  gradient.addColorStop(1, '#dce2ee')
  context.fillStyle = gradient
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  context.fillStyle = ACCENT
  context.font = `700 20px ${SANS}`
  context.fillText('INTRO', PAGE_PADDING, 110)

  context.fillStyle = INK_LIGHT
  context.font = `700 110px ${SANS}`
  context.fillText('Building', PAGE_PADDING, 245)
  context.fillText('the future.', PAGE_PADDING, 350)

  context.fillStyle = MUTED_LIGHT
  context.font = `400 34px ${SERIF}`
  context.fillText('Computer Science @ Arizona State', PAGE_PADDING, 430)
  context.fillText('Full-stack developer. AI enthusiast. Entrepreneur.', PAGE_PADDING, 470)

  const metricY = 590
  const metricWidth = 224
  portfolioData.metrics.forEach(([value, label], index) => {
    drawMetricCard(context, value, label, PAGE_PADDING + index * (metricWidth + 18), metricY, metricWidth, { dark: false })
  })

  context.fillStyle = '#1c2333'
  context.font = `700 38px ${SANS}`
  context.fillText('Roles', PAGE_PADDING, 960)
  drawTagRow(context, portfolioData.identity.roles, PAGE_PADDING, 995, 980, '#1c2333')

  drawParagraphs(
    context,
    [
      'From teaching theoretical computer science to shipping AI-driven products, the work spans engineering depth and product ambition.',
      'The common thread is systems thinking: design the interface carefully, build the workflow rigorously, and make the result feel inevitable.',
    ],
    PAGE_PADDING, 1135, 980,
    { font: `30px ${SERIF}`, lineHeight: 42 },
  )

  return toTexture(canvas)
}

function buildAboutPage() {
  const { canvas, context } = createPageCanvas()
  let y = drawSectionHeader(context, 'About', 'Pranav Sagar', PAGE_PADDING, 96)
  y = drawParagraphs(
    context,
    portfolioData.about.paragraphs,
    PAGE_PADDING, y + 10, 980,
    { font: `31px ${SERIF}`, lineHeight: 44, gap: 18 },
  )

  context.fillStyle = INK_LIGHT
  context.font = `700 40px ${SANS}`
  context.fillText('Fun Facts', PAGE_PADDING, y + 30)

  context.fillStyle = MUTED_LIGHT
  context.font = `28px ${SERIF}`
  let bulletY = y + 84
  portfolioData.about.funFacts.forEach((fact) => {
    context.fillStyle = ACCENT
    context.beginPath()
    context.arc(PAGE_PADDING + 10, bulletY - 10, 5, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = MUTED_LIGHT
    bulletY = drawWrappedText(context, fact, PAGE_PADDING + 28, bulletY, 930, 38)
    bulletY += 10
  })

  return toTexture(canvas)
}

function buildGalleryPage(galleryImages) {
  const { canvas, context } = createPageCanvas({ dark: true })

  context.fillStyle = BLUE
  context.font = `700 18px ${SANS}`
  context.fillText('MOMENTS', PAGE_PADDING, 110)
  context.fillStyle = '#e4e8f0'
  context.font = `700 76px ${SANS}`
  context.fillText('Beyond the build', PAGE_PADDING, 198)
  context.fillStyle = 'rgba(228, 232, 240, 0.76)'
  context.font = `400 28px ${SERIF}`
  context.fillText('Travel, performance, discipline, and range.', PAGE_PADDING, 246)

  drawPhoto(context, galleryImages[0], 90, 320, 510, 560, 24)
  drawPhoto(context, galleryImages[1], 630, 320, 480, 260, 24, { positionY: 0.08 })
  drawPhoto(context, galleryImages[2], 630, 620, 230, 260, 24)
  drawPhoto(context, galleryImages[3], 880, 620, 230, 260, 24)
  drawPhoto(context, galleryImages[4] || galleryImages[0], 90, 910, 1020, 520, 24)

  context.fillStyle = BLUE_DIM
  context.font = `700 18px ${SANS}`
  context.fillText('10+ countries', 100, 1456)
  context.fillText('Guitar, tabla, drums', 430, 1456)
  context.fillText('Learning Mandarin', 820, 1456)
  return toTexture(canvas)
}

function buildSkillsPage() {
  const { canvas, context } = createPageCanvas()
  drawSectionHeader(context, 'Stack', 'Skills & Technologies', PAGE_PADDING, 96)

  const groups = [
    ['Frontend', portfolioData.skills.frontend],
    ['Backend & Data', portfolioData.skills.backend],
    ['Systems & Tools', portfolioData.skills.systems],
  ]

  let y = 250
  groups.forEach(([title, tags]) => {
    fillRoundedRect(context, PAGE_PADDING, y, 1020, 250, 30, 'rgba(17, 24, 39, 0.035)')
    strokeRoundedRect(context, PAGE_PADDING, y, 1020, 250, 30, 'rgba(17, 24, 39, 0.08)')
    context.fillStyle = INK_LIGHT
    context.font = `700 42px ${SANS}`
    context.fillText(title, PAGE_PADDING + 30, y + 64)
    drawTagRow(context, tags, PAGE_PADDING + 30, y + 96, 960)
    y += 286
  })

  return toTexture(canvas)
}

function buildEducationPage() {
  const { canvas, context } = createPageCanvas()
  drawSectionHeader(context, 'Journey', 'Education', PAGE_PADDING, 96)

  const primary = portfolioData.education[0]
  const secondary = portfolioData.education[1]
  const cardX = 148
  const cardWidth = 966
  const mainY = 228
  const mainHeight = 630
  const subY = 896
  const subHeight = 352

  const drawMetaRow = (entry, x, y) => {
    context.font = `700 18px ${SANS}`
    const widths = entry.meta.map((item, index) => {
      const padding = index === 0 ? 48 : 42
      return Math.max(164, Math.min(280, context.measureText(item).width + padding))
    })
    drawChip(context, entry.meta[0], x, y, widths[0])
    drawChip(context, entry.meta[1], x + widths[0] + 18, y, widths[1])
  }

  fillRoundedRect(context, cardX, mainY, cardWidth, mainHeight, 32, 'rgba(17, 24, 39, 0.035)')
  strokeRoundedRect(context, cardX, mainY, cardWidth, mainHeight, 32, 'rgba(17, 24, 39, 0.08)')

  context.fillStyle = ACCENT
  context.font = `700 16px ${SANS}`
  context.fillText('PRIMARY EDUCATION', cardX + 36, mainY + 44)

  context.fillStyle = INK_LIGHT
  context.font = `700 40px ${SANS}`
  const primaryTitleEndY = drawWrappedText(
    context,
    primary.degree,
    cardX + 36,
    mainY + 100,
    cardWidth - 72,
    44,
    3,
  )

  context.fillStyle = MUTED_LIGHT
  context.font = `600 28px ${SANS}`
  context.fillText(primary.school, cardX + 36, primaryTitleEndY + 8)
  context.font = `400 22px ${SANS}`
  context.fillText(primary.location, cardX + 36, primaryTitleEndY + 40)

  const primaryMetaY = primaryTitleEndY + 68
  drawMetaRow(primary, cardX + 36, primaryMetaY)

  const primaryBodyY = drawParagraphs(
    context,
    [primary.description],
    cardX + 36,
    primaryMetaY + 90,
    cardWidth - 72,
    { font: `29px ${SERIF}`, lineHeight: 40, gap: 0, maxLinesPerParagraph: 3 },
  )

  context.fillStyle = ACCENT
  context.font = `700 18px ${SANS}`
  context.fillText('CORE FOCUS', cardX + 36, primaryBodyY + 12)
  const primaryTagEndY = drawTagRow(
    context,
    primary.highlights.slice(0, 5),
    cardX + 36,
    primaryBodyY + 42,
    cardWidth - 72,
    '#1c2333',
  )

  context.fillStyle = ACCENT
  context.font = `700 18px ${SANS}`
  context.fillText('STANDOUTS', cardX + 36, primaryTagEndY + 12)
  drawBulletList(
    context,
    primary.achievements.slice(0, 2),
    cardX + 36,
    primaryTagEndY + 44,
    cardWidth - 72,
    { font: `23px ${SERIF}`, lineHeight: 30, gap: 8, maxLinesPerItem: 2 },
  )

  fillRoundedRect(context, cardX, subY, cardWidth, subHeight, 30, 'rgba(30, 58, 95, 0.05)')
  strokeRoundedRect(context, cardX, subY, cardWidth, subHeight, 30, 'rgba(30, 58, 95, 0.14)')

  context.fillStyle = ACCENT
  context.font = `700 16px ${SANS}`
  context.fillText('EARLIER FOUNDATION', cardX + 36, subY + 42)

  context.fillStyle = INK_LIGHT
  context.font = `700 32px ${SANS}`
  const secondaryTitleEndY = drawWrappedText(
    context,
    secondary.degree,
    cardX + 36,
    subY + 88,
    cardWidth - 72,
    36,
    2,
  )

  context.fillStyle = MUTED_LIGHT
  context.font = `600 24px ${SANS}`
  context.fillText(secondary.school, cardX + 36, secondaryTitleEndY + 4)
  context.font = `400 20px ${SANS}`
  context.fillText(secondary.location, cardX + 36, secondaryTitleEndY + 32)

  const secondaryMetaY = secondaryTitleEndY + 52
  drawMetaRow(secondary, cardX + 36, secondaryMetaY)

  const secondaryBodyY = drawParagraphs(
    context,
    [secondary.description],
    cardX + 36,
    secondaryMetaY + 84,
    cardWidth - 72,
    { font: `24px ${SERIF}`, lineHeight: 34, gap: 0, maxLinesPerParagraph: 2 },
  )

  context.fillStyle = ACCENT
  context.font = `700 17px ${SANS}`
  context.fillText('FOCUS', cardX + 36, secondaryBodyY + 10)
  drawTagRow(
    context,
    secondary.highlights.slice(0, 4),
    cardX + 36,
    secondaryBodyY + 36,
    620,
    '#1c2333',
  )

  return toTexture(canvas)
}

function buildCertificationPage() {
  const { canvas, context } = createPageCanvas({ dark: true })
  drawSectionHeader(context, 'Always Learning', 'Certifications', PAGE_PADDING, 96, {
    accent: BLUE, dark: true,
  })

  context.fillStyle = BLUE
  context.font = `700 28px ${SANS}`
  context.fillText('Certifications', PAGE_PADDING, 260)
  context.fillText('Online Courses', PAGE_PADDING, 860)

  context.fillStyle = '#e4e8f0'
  context.font = `28px ${SERIF}`

  let y = 320
  portfolioData.certifications.certifications.forEach((item) => {
    context.fillStyle = BLUE
    context.beginPath()
    context.arc(PAGE_PADDING + 8, y - 8, 5, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#d0d8e4'
    y = drawWrappedText(context, item, PAGE_PADDING + 28, y, 980, 38)
    y += 14
  })

  y = 920
  portfolioData.certifications.courses.forEach((item) => {
    context.fillStyle = BLUE
    context.beginPath()
    context.arc(PAGE_PADDING + 8, y - 8, 5, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#d0d8e4'
    y = drawWrappedText(context, item, PAGE_PADDING + 28, y, 980, 38)
    y += 14
  })

  return toTexture(canvas)
}

function buildExperiencePage() {
  const { canvas, context } = createPageCanvas()
  drawSectionHeader(context, "Where I've Worked", 'Experience', PAGE_PADDING, 96)

  const primaryRoles = portfolioData.experience.slice(0, 2)
  let y = 250
  primaryRoles.forEach((role) => {
    fillRoundedRect(context, PAGE_PADDING, y, 1020, 470, 30, 'rgba(17, 24, 39, 0.035)')
    strokeRoundedRect(context, PAGE_PADDING, y, 1020, 470, 30, 'rgba(17, 24, 39, 0.08)')
    context.fillStyle = INK_LIGHT
    context.font = `700 38px ${SANS}`
    context.fillText(role.title, PAGE_PADDING + 32, y + 58)
    context.fillStyle = MUTED_LIGHT
    context.font = `600 27px ${SANS}`
    context.fillText(role.company, PAGE_PADDING + 32, y + 98)
    context.font = `400 22px ${SANS}`
    context.fillText(`${role.location}  |  ${role.date}`, PAGE_PADDING + 32, y + 130)
    drawParagraphs(
      context, [role.description],
      PAGE_PADDING + 32, y + 184, 590,
      { font: `26px ${SERIF}`, lineHeight: 36, gap: 0 },
    )
    context.fillStyle = INK_LIGHT
    context.font = `700 22px ${SANS}`
    context.fillText('Highlights', PAGE_PADDING + 670, y + 184)
    let bulletY = y + 224
    context.fillStyle = MUTED_LIGHT
    context.font = `24px ${SERIF}`
    role.highlights.forEach((item) => {
      context.fillStyle = ACCENT
      context.beginPath()
      context.arc(PAGE_PADDING + 680, bulletY - 9, 4, 0, Math.PI * 2)
      context.fill()
      context.fillStyle = MUTED_LIGHT
      bulletY = drawWrappedText(context, item, PAGE_PADDING + 696, bulletY, 300, 32, 3)
      bulletY += 6
    })
    y += 510
  })

  return toTexture(canvas)
}

function buildImpactPage() {
  const { canvas, context } = createPageCanvas()
  drawSectionHeader(context, 'Execution', 'Impact & Range', PAGE_PADDING, 96)

  context.fillStyle = INK_LIGHT
  context.font = `700 34px ${SANS}`
  context.fillText('Additional Roles', PAGE_PADDING, 260)

  let y = 310
  portfolioData.experience.slice(2).forEach((role) => {
    fillRoundedRect(context, PAGE_PADDING, y, 1020, 250, 26, 'rgba(17, 24, 39, 0.035)')
    context.fillStyle = INK_LIGHT
    context.font = `700 30px ${SANS}`
    context.fillText(role.title, PAGE_PADDING + 26, y + 48)
    context.fillStyle = MUTED_LIGHT
    context.font = `600 22px ${SANS}`
    context.fillText(`${role.company}  |  ${role.date}`, PAGE_PADDING + 26, y + 84)
    drawParagraphs(
      context, [role.description],
      PAGE_PADDING + 26, y + 128, 960,
      { font: `24px ${SERIF}`, lineHeight: 34, gap: 0, maxLinesPerParagraph: 3 },
    )
    y += 280
  })

  context.fillStyle = INK_LIGHT
  context.font = `700 34px ${SANS}`
  context.fillText('Key Numbers', PAGE_PADDING, 930)

  portfolioData.metrics.forEach(([value, label], index) => {
    drawMetricCard(context, value, label,
      PAGE_PADDING + (index % 2) * 500,
      980 + Math.floor(index / 2) * 180,
      470, { dark: false },
    )
  })

  return toTexture(canvas)
}

function drawProjectPage(title, projects) {
  const { canvas, context } = createPageCanvas()
  drawSectionHeader(context, 'Featured Work', title, PAGE_PADDING, 96)

  const isGrid = projects.length >= 4
  const cardWidth = isGrid ? 492 : 1020
  const cardHeight = isGrid ? 360 : 350

  projects.forEach((project, index) => {
    const column = isGrid ? index % 2 : 0
    const row = isGrid ? Math.floor(index / 2) : index
    const x = PAGE_PADDING + column * 528
    const y = 250 + row * (cardHeight + 28)

    fillRoundedRect(context, x, y, cardWidth, cardHeight, 26, 'rgba(17, 24, 39, 0.035)')
    strokeRoundedRect(context, x, y, cardWidth, cardHeight, 26, 'rgba(17, 24, 39, 0.08)')
    context.fillStyle = ACCENT
    context.font = `700 16px ${SANS}`
    context.fillText('PROJECT', x + 24, y + 32)
    context.fillStyle = INK_LIGHT
    context.font = `700 32px ${SANS}`
    context.fillText(project.title, x + 24, y + 70)
    drawParagraphs(
      context, [project.description],
      x + 24, y + 112, cardWidth - 48,
      { font: `23px ${SERIF}`, lineHeight: 31, gap: 0, maxLinesPerParagraph: 5 },
    )
    drawTagRow(context, project.tech, x + 24, y + cardHeight - 88, cardWidth - 48, '#1c2333')
  })

  return toTexture(canvas)
}

function buildContactPage() {
  const { canvas, context } = createPageCanvas()
  let y = drawSectionHeader(context, 'Direct Channel', 'Contact Me', PAGE_PADDING, 96)

  context.fillStyle = MUTED_LIGHT
  context.font = `400 30px ${SERIF}`
  context.fillText('Open to internships, ambitious products, and systems work worth building.', PAGE_PADDING, y + 8)

  fillRoundedRect(context, 92, 328, 380, 1060, 32, 'rgba(17, 24, 39, 0.03)')
  strokeRoundedRect(context, 92, 328, 380, 1060, 32, 'rgba(17, 24, 39, 0.08)')

  context.fillStyle = INK_LIGHT
  context.font = `700 34px ${SANS}`
  context.fillText('Preferred Routes', 124, 392)

  drawParagraphs(
    context,
    [
      'The fastest way to start something is a clear brief. Reach out with the problem, the timeline, and the outcome you want.',
    ],
    124, 442, 316,
    { font: `25px ${SERIF}`, lineHeight: 34, gap: 0, maxLinesPerParagraph: 4 },
  )

  drawInfoCard(context, 'Website', portfolioData.links[0][1], 124, 560, 316, 120)
  drawInfoCard(context, 'Email', portfolioData.links[1][1], 124, 700, 316, 120)
  drawInfoCard(context, 'Location', portfolioData.links[2][1], 124, 840, 316, 120)

  context.fillStyle = ACCENT
  context.font = `700 22px ${SANS}`
  context.fillText('Best Fits', 124, 1034)
  drawTagRow(
    context,
    ['Internships', 'AI Products', 'Full-stack Systems', 'Design Engineering', 'Operators'],
    124,
    1068,
    316,
    '#1c2333',
  )

  fillRoundedRect(context, 520, 328, 588, 1060, 32, 'rgba(30, 58, 95, 0.06)')
  strokeRoundedRect(context, 520, 328, 588, 1060, 32, 'rgba(30, 58, 95, 0.18)')

  context.fillStyle = ACCENT
  context.font = `700 18px ${SANS}`
  context.fillText('MESSAGE FORM', 556, 392)
  context.fillStyle = INK_LIGHT
  context.font = `700 44px ${SANS}`
  context.fillText('Send the brief', 556, 446)
  context.fillStyle = MUTED_LIGHT
  context.font = `26px ${SERIF}`
  context.fillText('A clear note beats a long pitch.', 556, 486)

  drawFormField(context, 'Name', portfolioData.contactForm.fields[0].placeholder, 556, 546, 250, 66)
  drawFormField(context, 'Email', portfolioData.contactForm.fields[1].placeholder, 830, 546, 242, 66)
  drawFormField(context, 'Subject', portfolioData.contactForm.fields[2].placeholder, 556, 658, 516, 66)
  drawFormField(context, 'Message', portfolioData.contactForm.fields[3].placeholder, 556, 770, 516, 290)

  fillRoundedRect(context, 556, 1098, 516, 86, 24, ACCENT)
  context.fillStyle = '#f0f2f6'
  context.font = `700 24px ${SANS}`
  context.textAlign = 'center'
  context.fillText('SEND MESSAGE', 814, 1150)
  context.textAlign = 'left'

  context.fillStyle = MUTED_LIGHT
  context.font = `italic 22px ${SERIF}`
  context.fillText('Usually responds within 24 hours.', 556, 1238)
  context.fillText('Form powered by Formspree.', 556, 1274)

  return toTexture(canvas)
}

function buildSocialPage() {
  const { canvas, context } = createPageCanvas()
  drawSectionHeader(context, 'Presence', 'Open Channels', PAGE_PADDING, 96)

  context.fillStyle = MUTED_LIGHT
  context.font = `400 28px ${SERIF}`
  context.fillText('Reach out wherever the conversation already lives.', PAGE_PADDING, 238)

  portfolioData.socialLinks.forEach((item, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = PAGE_PADDING + column * 510
    const y = 300 + row * 188

    fillRoundedRect(context, x, y, 480, 158, 28, 'rgba(17, 24, 39, 0.035)')
    strokeRoundedRect(context, x, y, 480, 158, 28, 'rgba(17, 24, 39, 0.08)')
    context.fillStyle = ACCENT
    context.font = `700 18px ${SANS}`
    context.fillText(item.label.toUpperCase(), x + 26, y + 36)
    context.fillStyle = INK_LIGHT
    context.font = `700 30px ${SANS}`
    context.fillText(item.label, x + 26, y + 82)
    context.fillStyle = MUTED_LIGHT
    context.font = `500 22px ${SANS}`
    drawWrappedText(context, displayValue(item.href), x + 26, y + 122, 428, 28, 2)
  })

  context.fillStyle = INK_LIGHT
  context.font = `700 34px ${SANS}`
  context.fillText('Languages & Interests', PAGE_PADDING, 960)
  drawTagRow(
    context,
    ['English', 'Hindi', 'Punjabi', 'Learning Mandarin', 'Travel', 'Fitness', 'Music', 'Sci-fi'],
    PAGE_PADDING,
    996,
    1020,
    '#1c2333',
  )

  fillRoundedRect(context, PAGE_PADDING, 1136, 1020, 220, 28, 'rgba(30, 58, 95, 0.06)')
  strokeRoundedRect(context, PAGE_PADDING, 1136, 1020, 220, 28, 'rgba(30, 58, 95, 0.14)')
  context.fillStyle = ACCENT
  context.font = `700 22px ${SANS}`
  context.fillText('Availability', PAGE_PADDING + 28, 1182)
  drawParagraphs(
    context,
    [
      'Best for internship opportunities, builder conversations, design-engineering collaborations, and ambitious AI product work.',
    ],
    PAGE_PADDING + 28,
    1224,
    964,
    { font: `26px ${SERIF}`, lineHeight: 36, gap: 0, maxLinesPerParagraph: 4 },
  )

  return toTexture(canvas)
}

function buildFinalePage(portraitImage) {
  const { canvas, context } = createPageCanvas()
  drawPhoto(context, portraitImage, 90, 100, 420, 560, 28)

  context.fillStyle = ACCENT
  context.font = `700 18px ${SANS}`
  context.fillText('FINALE', 580, 130)
  context.fillStyle = INK_LIGHT
  context.font = `700 74px ${SANS}`
  context.fillText('What matters', 580, 220)
  context.fillText('is shipping.', 580, 305)

  drawParagraphs(
    context,
    [
      "The through-line across Pranav's work is not just taste or technical range. It is momentum.",
      'Ideas become systems. Systems become products. Products become artifacts that people can actually use.',
      'This book is one more example: taking an existing interactive concept and bending it into a portfolio object with its own voice.',
    ],
    580, 390, 520,
    { font: `28px ${SERIF}`, lineHeight: 38, gap: 14 },
  )

  context.fillStyle = BLUE
  context.font = `700 22px ${SANS}`
  context.fillText('Code available upon request.', 90, 1450)
  context.fillStyle = MUTED_LIGHT
  context.font = `italic 26px ${SERIF}`
  context.fillText('Pranav Sagar', 90, 1492)

  return toTexture(canvas)
}

function buildBackCover(backArtImage) {
  const { canvas, context } = createPageCanvas({ dark: true })
  drawFullBleedImage(context, backArtImage, { positionY: 0.14 })

  const footerFade = context.createLinearGradient(0, 0, 0, PAGE_HEIGHT)
  footerFade.addColorStop(0, 'rgba(0, 4, 12, 0)')
  footerFade.addColorStop(0.66, 'rgba(0, 4, 12, 0.15)')
  footerFade.addColorStop(1, 'rgba(0, 4, 12, 0.65)')
  context.fillStyle = footerFade
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  fillRoundedRect(context, 116, 1300, 968, 176, 20, 'rgba(4, 8, 18, 0.7)')
  strokeRoundedRect(context, 116, 1300, 968, 176, 20, 'rgba(74, 158, 237, 0.15)')
  context.textAlign = 'center'
  context.fillStyle = BLUE
  context.font = `700 52px ${SANS}`
  context.fillText('Pranav Sagar', PAGE_WIDTH / 2, 1374)
  context.fillStyle = BLUE_DIM
  context.font = `700 22px ${SANS}`
  context.fillText('PORTFOLIO EDITION', PAGE_WIDTH / 2, 1412)
  context.fillStyle = '#d0d8e4'
  context.font = `500 24px ${SANS}`
  context.fillText('pranavsagar.us  |  psagar2@asu.edu', PAGE_WIDTH / 2, 1450)

  context.strokeStyle = 'rgba(74, 158, 237, 0.15)'
  context.lineWidth = 3
  context.strokeRect(40, 40, PAGE_WIDTH - 80, PAGE_HEIGHT - 80)
  context.textAlign = 'left'

  return toTexture(canvas)
}

// ── Export ─────────────────────────────────────────────────

export function createPortfolioPageTextures({ portraitImage, galleryImages, coverArtImage, backArtImage }) {
  const projectChunks = [
    portfolioData.projects.slice(0, 4),
    portfolioData.projects.slice(4, 8),
    portfolioData.projects.slice(8, 11),
    portfolioData.projects.slice(11, 14),
  ]

  return {
    coverFront: buildCoverFront(portraitImage, coverArtImage),
    insideCover: buildInsideCover(portraitImage),
    hero: buildHeroPage(),
    about: buildAboutPage(),
    gallery: buildGalleryPage(galleryImages),
    skills: buildSkillsPage(),
    education: buildEducationPage(),
    certifications: buildCertificationPage(),
    experience: buildExperiencePage(),
    impact: buildImpactPage(),
    projectsA: drawProjectPage('Projects I', projectChunks[0]),
    projectsB: drawProjectPage('Projects II', projectChunks[1]),
    projectsC: drawProjectPage('Projects III', projectChunks[2]),
    projectsD: drawProjectPage('Projects IV', projectChunks[3]),
    contact: buildContactPage(),
    social: buildSocialPage(),
    finale: buildFinalePage(portraitImage),
    backCover: buildBackCover(backArtImage),
  }
}
