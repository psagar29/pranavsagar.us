import * as THREE from 'three'
import { portfolioData, projectCollections } from './portfolioData.js'

const PAGE_WIDTH = 1200
const PAGE_HEIGHT = 1620
const PAGE_PADDING = 92
const DEFAULT_CONTENT_TEXTURE_SCALE = 1.06
const DEFAULT_INTRO_TEXTURE_SCALE = 1.16
let contentTextureScale = DEFAULT_CONTENT_TEXTURE_SCALE
let introTextureScale = DEFAULT_INTRO_TEXTURE_SCALE

// Bond color palette
const PAPER = '#0a0a0f'
const PAPER_ALT = '#12121a'
const PAPER_LIGHT = '#f5f2ec'
const PAPER_LIGHT_ALT = '#f0ebe3'
const INK_LIGHT = '#111827'
const TEXT_LIGHT = '#e0d8cc'
const TEXT_DIM = '#6b7a8d'
const MUTED_LIGHT = '#4a5568'
const BLUE = '#c9a96e'
const BLUE_DIM = 'rgba(201, 169, 110, 0.7)'
const BLUE_SUBTLE = 'rgba(201, 169, 110, 0.15)'
const DARK = '#0a0a0f'
const BORDER_DARK = 'rgba(201, 169, 110, 0.12)'
const BORDER_LIGHT = '#b0a898'
const ACCENT = '#7a6535'
const SANS = '"Arial", "Helvetica", sans-serif'
const SERIF = '"Georgia", "Times New Roman", serif'

function createPageCanvas({ dark = false, scale = contentTextureScale } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(PAGE_WIDTH * scale)
  canvas.height = Math.round(PAGE_HEIGHT * scale)
  const context = canvas.getContext('2d')
  context.scale(scale, scale)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  const gradient = context.createLinearGradient(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  if (dark) {
    gradient.addColorStop(0, '#08080d')
    gradient.addColorStop(1, '#12121a')
  } else {
    gradient.addColorStop(0, PAPER_LIGHT)
    gradient.addColorStop(1, PAPER_LIGHT_ALT)
  }

  context.fillStyle = gradient
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  if (dark) {
    context.strokeStyle = 'rgba(201, 169, 110, 0.02)'
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
    strokeRoundedRect(context, x, y, width, 44, 22, 'rgba(201, 169, 110, 0.25)')
    context.fillStyle = BLUE
    context.font = `700 18px ${SANS}`
    context.fillText(label, x + 20, y + 28)
  } else {
    fillRoundedRect(context, x, y, width, 44, 22, 'rgba(122, 101, 53, 0.09)')
    strokeRoundedRect(context, x, y, width, 44, 22, 'rgba(122, 101, 53, 0.2)')
    context.fillStyle = ACCENT
    context.font = `700 18px ${SANS}`
    context.fillText(label, x + 20, y + 28)
  }
}

function drawInfoCard(context, label, value, x, y, width, height, { dark = false } = {}) {
  const background = dark ? 'rgba(201, 169, 110, 0.05)' : 'rgba(30, 25, 18, 0.035)'
  const border = dark ? BORDER_DARK : 'rgba(30, 25, 18, 0.08)'
  const labelColor = dark ? BLUE : ACCENT
  const valueColor = dark ? '#f0ebe3' : INK_LIGHT

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
  const fieldBackground = dark ? 'rgba(10, 10, 15, 0.72)' : 'rgba(255, 255, 255, 0.68)'
  const border = dark ? BORDER_DARK : 'rgba(30, 25, 18, 0.12)'
  const placeholderColor = dark ? 'rgba(208, 216, 228, 0.4)' : 'rgba(30, 25, 18, 0.35)'

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
    fillRoundedRect(context, cursorX, cursorY, tagWidth, 34, 17, 'rgba(30, 25, 18, 0.06)')
    strokeRoundedRect(context, cursorX, cursorY, tagWidth, 34, 17, 'rgba(30, 25, 18, 0.1)')
    context.fillStyle = color
    context.fillText(tag, cursorX + 18, cursorY + 22)
    cursorX += tagWidth + 12
  })

  return cursorY + 50
}

function drawSectionHeader(context, kicker, title, x, y, options = {}) {
  const { accent = ACCENT, dark = false } = options
  const headingColor = dark ? '#f0ebe3' : INK_LIGHT
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
  strokeRoundedRect(context, x, y, width, height, radius, 'rgba(30, 25, 18, 0.12)')
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
  const valueMaxWidth = width - 52
  let valueFontSize = 58
  context.font = `700 ${valueFontSize}px ${SANS}`
  while (valueFontSize > 30 && context.measureText(value).width > valueMaxWidth) {
    valueFontSize -= 2
    context.font = `700 ${valueFontSize}px ${SANS}`
  }

  const labelText = label.toUpperCase()
  const labelMaxWidth = width - 56
  let labelFontSize = 18
  context.font = `700 ${labelFontSize}px ${SANS}`
  while (labelFontSize > 12 && context.measureText(labelText).width > labelMaxWidth) {
    labelFontSize -= 1
    context.font = `700 ${labelFontSize}px ${SANS}`
  }

  if (dark) {
    fillRoundedRect(context, x, y, width, 150, 28, '#0a0a0f')
    strokeRoundedRect(context, x, y, width, 150, 28, BORDER_DARK)
    context.fillStyle = BLUE
    context.font = `700 ${valueFontSize}px ${SANS}`
    context.fillText(value, x + 26, y + 74)
    context.fillStyle = BLUE_DIM
    context.font = `700 ${labelFontSize}px ${SANS}`
    context.fillText(labelText, x + 28, y + 112)
  } else {
    fillRoundedRect(context, x, y, width, 150, 28, '#12121a')
    context.fillStyle = '#f0ebe3'
    context.font = `700 ${valueFontSize}px ${SANS}`
    context.fillText(value, x + 26, y + 74)
    context.fillStyle = '#a09888'
    context.font = `700 ${labelFontSize}px ${SANS}`
    context.fillText(labelText, x + 28, y + 112)
  }
}

function toTexture(canvas, anisotropy = 16) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  texture.generateMipmaps = true
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
  spotlight.addColorStop(0.45, 'rgba(230, 210, 170, 0.24)')
  spotlight.addColorStop(1, 'rgba(230, 210, 170, 0)')
  context.fillStyle = spotlight
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  context.restore()

  const topFade = context.createLinearGradient(0, 0, 0, PAGE_HEIGHT)
  topFade.addColorStop(0, 'rgba(0, 0, 5, 0.03)')
  topFade.addColorStop(0.45, 'rgba(0, 0, 5, 0.01)')
  topFade.addColorStop(1, 'rgba(0, 0, 5, 0.16)')
  context.fillStyle = topFade
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  const lowerGlow = context.createLinearGradient(0, PAGE_HEIGHT * 0.55, 0, PAGE_HEIGHT)
  lowerGlow.addColorStop(0, 'rgba(180, 150, 95, 0)')
  lowerGlow.addColorStop(1, 'rgba(180, 150, 95, 0.18)')
  context.fillStyle = lowerGlow
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  // Blue border
  context.strokeStyle = 'rgba(201, 169, 110, 0.28)'
  context.lineWidth = 3
  context.strokeRect(40, 40, PAGE_WIDTH - 80, PAGE_HEIGHT - 80)

  // Inner border
  context.strokeStyle = 'rgba(220, 200, 160, 0.12)'
  context.lineWidth = 1
  context.strokeRect(50, 50, PAGE_WIDTH - 100, PAGE_HEIGHT - 100)

  // Portrait card
  fillRoundedRect(context, 728, 1038, 274, 432, 22, 'rgba(10, 10, 15, 0.72)')
  strokeRoundedRect(context, 728, 1038, 274, 432, 22, 'rgba(201, 169, 110, 0.32)')
  drawPhoto(context, portraitImage, 746, 1056, 238, 332, 18, { positionY: 0.16 })

  fillRoundedRect(context, 746, 1404, 238, 46, 12, 'rgba(10, 10, 15, 0.78)')
  context.fillStyle = BLUE
  context.font = `700 18px ${SANS}`
  context.textAlign = 'center'
  context.fillText('PRANAV SAGAR', 865, 1433)
  context.textAlign = 'left'

  // Info card
  fillRoundedRect(context, 92, 1288, 420, 182, 18, 'rgba(10, 10, 15, 0.68)')
  strokeRoundedRect(context, 92, 1288, 420, 182, 18, 'rgba(201, 169, 110, 0.22)')
  context.fillStyle = BLUE
  context.font = `700 20px ${SANS}`
  context.fillText('SELECTED WORK', 120, 1332)
  context.fillStyle = '#f0ebe3'
  context.font = `700 46px ${SANS}`
  context.fillText('Pranav Sagar', 120, 1394)
  context.fillStyle = '#b0a898'
  context.font = `400 22px ${SANS}`
  context.fillText('AI systems. Product execution.', 120, 1430)
  context.fillText('pranavsagar.us', 120, 1460)

  return toTexture(canvas)
}

function buildInsideCover(portraitImage) {
  const { canvas, context } = createPageCanvas({ scale: introTextureScale })
  const rightColumnX = 796
  const rightColumnWidth = 258
  const photoY = 258
  const photoWidth = 254
  const photoHeight = 404
  let y = drawSectionHeader(context, 'Pranav Sagar', 'Selected Work', PAGE_PADDING, 96)

  context.fillStyle = INK_LIGHT
  context.font = `700 34px ${SANS}`
  context.fillText('AI systems. Product thinking. End-to-end execution.', PAGE_PADDING, y + 8)

  y = drawParagraphs(
    context,
    [
      "This portfolio is designed as a readable artifact. It captures the products, systems, and execution style behind Pranav Sagar's work across software, interfaces, and AI-native tools.",
    ],
    PAGE_PADDING, y + 74, 628,
    { font: `32px ${SERIF}`, lineHeight: 46, gap: 26 },
  )

  drawChip(context, 'psagar2@asu.edu', PAGE_PADDING, y + 18, 250)
  drawChip(context, 'Tempe, Arizona', PAGE_PADDING + 270, y + 18, 220)
  drawChip(context, 'pranavsagar.us', PAGE_PADDING, y + 82, 220)

  fillRoundedRect(context, rightColumnX - 16, photoY - 16, photoWidth + 32, photoHeight + 32, 36, 'rgba(122, 101, 53, 0.08)')
  strokeRoundedRect(context, rightColumnX - 16, photoY - 16, photoWidth + 32, photoHeight + 32, 36, 'rgba(122, 101, 53, 0.12)')
  drawPhoto(context, portraitImage, rightColumnX, photoY, photoWidth, photoHeight, 28, { positionY: 0.18 })

  context.fillStyle = ACCENT
  context.font = `700 20px ${SANS}`
  context.fillText('CURRENT FOCUS', rightColumnX, 720)
  drawParagraphs(
    context,
    ['Building AI-native software, local-first operators, communication tooling, and polished products across web, desktop, and mobile.'],
    rightColumnX, 760, rightColumnWidth,
    { font: `27px ${SERIF}`, lineHeight: 40 },
  )

  context.fillStyle = MUTED_LIGHT
  context.font = `italic 26px ${SERIF}`
  context.fillText('"Clear systems. Useful products. Real execution."', PAGE_PADDING, 1450)
  return toTexture(canvas)
}

// ── Content pages ─────────────────────────────────────────

function buildHeroPage() {
  const { canvas, context } = createPageCanvas({ scale: introTextureScale })
  const gradient = context.createLinearGradient(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  gradient.addColorStop(0, '#f5f2ec')
  gradient.addColorStop(1, '#ece6dc')
  context.fillStyle = gradient
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  context.fillStyle = ACCENT
  context.font = `700 20px ${SANS}`
  context.fillText('INTRO', PAGE_PADDING, 110)

  context.fillStyle = INK_LIGHT
  context.font = `700 110px ${SANS}`
  context.fillText('Build systems.', PAGE_PADDING, 245)
  context.fillText('Ship products.', PAGE_PADDING, 350)

  context.fillStyle = MUTED_LIGHT
  context.font = `400 34px ${SERIF}`
  context.fillText('AI-native software across web, macOS, and iOS.', PAGE_PADDING, 430)
  context.fillText('Product engineer with an execution-first approach.', PAGE_PADDING, 470)

  const metricY = 590
  const metricWidth = 224
  portfolioData.metrics.forEach(([value, label], index) => {
    drawMetricCard(context, value, label, PAGE_PADDING + index * (metricWidth + 18), metricY, metricWidth, { dark: false })
  })

  context.fillStyle = '#2a2520'
  context.font = `700 38px ${SANS}`
  context.fillText('Operating Profile', PAGE_PADDING, 960)
  drawTagRow(context, portfolioData.identity.roles, PAGE_PADDING, 995, 980, '#2a2520')

  drawParagraphs(
    context,
    [
      'The work spans AI products, custom interfaces, and multi-platform systems that have to be both technically sound and commercially legible.',
      'The through-line is execution: define the leverage point, build the right workflow, and ship something people can actually use.',
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
  context.fillText('Operating Notes', PAGE_PADDING, y + 30)

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
  context.fillStyle = '#f0ebe3'
  context.font = `700 76px ${SANS}`
  context.fillText('Outside the product', PAGE_PADDING, 198)
  context.fillStyle = 'rgba(240, 235, 227, 0.76)'
  context.font = `400 28px ${SERIF}`
  context.fillText('Perspective, rhythm, discipline, and range.', PAGE_PADDING, 246)

  drawPhoto(context, galleryImages[0], 90, 320, 510, 560, 24)
  drawPhoto(context, galleryImages[1], 630, 320, 480, 260, 24, { positionY: 0.08 })
  drawPhoto(context, galleryImages[2], 630, 620, 230, 260, 24)
  drawPhoto(context, galleryImages[3], 880, 620, 230, 260, 24)
  drawPhoto(context, galleryImages[4] || galleryImages[0], 90, 910, 1020, 520, 24)

  context.fillStyle = BLUE_DIM
  context.font = `700 18px ${SANS}`
  context.fillText('India ↔ United States', 100, 1456)
  context.fillText('Music, movement, routine', 430, 1456)
  context.fillText('Taste beyond software', 820, 1456)
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
    fillRoundedRect(context, PAGE_PADDING, y, 1020, 250, 30, 'rgba(30, 25, 18, 0.035)')
    strokeRoundedRect(context, PAGE_PADDING, y, 1020, 250, 30, 'rgba(30, 25, 18, 0.08)')
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
  const mainHeight = 708
  const subY = 962
  const subHeight = 376

  const drawMetaRow = (entry, x, y, maxWidth) => {
    context.font = `700 18px ${SANS}`
    const widths = entry.meta.map((item, index) => {
      const padding = index === 0 ? 48 : 42
      return Math.max(164, Math.min(280, context.measureText(item).width + padding))
    })
    drawChip(context, entry.meta[0], x, y, widths[0])
    const secondX = x + widths[0] + 18
    if (secondX + widths[1] > x + maxWidth) {
      drawChip(context, entry.meta[1], x, y + 56, widths[1])
      return y + 100
    }
    drawChip(context, entry.meta[1], secondX, y, widths[1])
    return y + 44
  }

  fillRoundedRect(context, cardX, mainY, cardWidth, mainHeight, 32, 'rgba(30, 25, 18, 0.035)')
  strokeRoundedRect(context, cardX, mainY, cardWidth, mainHeight, 32, 'rgba(30, 25, 18, 0.08)')

  context.fillStyle = ACCENT
  context.font = `700 16px ${SANS}`
  context.fillText('PRIMARY EDUCATION', cardX + 36, mainY + 44)

  context.fillStyle = INK_LIGHT
  context.font = `700 38px ${SANS}`
  const primaryTitleEndY = drawWrappedText(
    context,
    primary.degree,
    cardX + 36,
    mainY + 100,
    cardWidth - 72,
    42,
    3,
  )

  context.fillStyle = MUTED_LIGHT
  context.font = `600 26px ${SANS}`
  const primarySchoolEndY = drawWrappedText(
    context,
    primary.school,
    cardX + 36,
    primaryTitleEndY + 2,
    cardWidth - 72,
    30,
    2,
  )
  context.font = `400 21px ${SANS}`
  const primaryLocationEndY = drawWrappedText(
    context,
    primary.location,
    cardX + 36,
    primarySchoolEndY - 2,
    cardWidth - 72,
    26,
    2,
  )

  const primaryMetaY = primaryLocationEndY + 18
  const primaryMetaEndY = drawMetaRow(primary, cardX + 36, primaryMetaY, cardWidth - 72)

  const primaryBodyY = drawParagraphs(
    context,
    [primary.description],
    cardX + 36,
    primaryMetaEndY + 48,
    cardWidth - 72,
    { font: `24px ${SERIF}`, lineHeight: 34, gap: 0, maxLinesPerParagraph: 3 },
  )

  context.fillStyle = ACCENT
  context.font = `700 18px ${SANS}`
  context.fillText('CORE FOCUS', cardX + 36, primaryBodyY + 12)
  const primaryTagEndY = drawTagRow(
    context,
    primary.highlights.slice(0, 4),
    cardX + 36,
    primaryBodyY + 42,
    cardWidth - 72,
    '#2a2520',
  )

  context.fillStyle = ACCENT
  context.font = `700 18px ${SANS}`
  context.fillText('STANDOUTS', cardX + 36, primaryTagEndY + 12)
  drawBulletList(
    context,
    primary.achievements.slice(0, 3),
    cardX + 36,
    primaryTagEndY + 44,
    cardWidth - 72,
    { font: `20px ${SERIF}`, lineHeight: 26, gap: 8, maxLinesPerItem: 2 },
  )

  fillRoundedRect(context, cardX, subY, cardWidth, subHeight, 30, 'rgba(122, 101, 53, 0.05)')
  strokeRoundedRect(context, cardX, subY, cardWidth, subHeight, 30, 'rgba(122, 101, 53, 0.14)')

  context.fillStyle = ACCENT
  context.font = `700 16px ${SANS}`
  context.fillText('EARLIER FOUNDATION', cardX + 36, subY + 42)

  context.fillStyle = INK_LIGHT
  context.font = `700 31px ${SANS}`
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
  context.font = `600 22px ${SANS}`
  const secondarySchoolEndY = drawWrappedText(
    context,
    secondary.school,
    cardX + 36,
    secondaryTitleEndY + 2,
    cardWidth - 72,
    28,
    2,
  )
  context.font = `400 19px ${SANS}`
  const secondaryLocationEndY = drawWrappedText(
    context,
    secondary.location,
    cardX + 36,
    secondarySchoolEndY - 2,
    cardWidth - 72,
    24,
    2,
  )

  const secondaryMetaY = secondaryLocationEndY + 14
  const secondaryMetaEndY = drawMetaRow(secondary, cardX + 36, secondaryMetaY, cardWidth - 72)

  const secondaryBodyY = drawParagraphs(
    context,
    [secondary.description],
    cardX + 36,
    secondaryMetaEndY + 40,
    cardWidth - 72,
    { font: `20px ${SERIF}`, lineHeight: 27, gap: 0, maxLinesPerParagraph: 3 },
  )

  context.fillStyle = ACCENT
  context.font = `700 17px ${SANS}`
  context.fillText('FOCUS', cardX + 36, secondaryBodyY + 10)
  const secondaryTagEndY = drawTagRow(
    context,
    secondary.highlights.slice(0, 3),
    cardX + 36,
    secondaryBodyY + 36,
    cardWidth - 72,
    '#2a2520',
  )

  context.fillStyle = ACCENT
  context.font = `700 17px ${SANS}`
  context.fillText('ACHIEVEMENTS', cardX + 36, secondaryTagEndY + 10)
  drawBulletList(
    context,
    secondary.achievements.slice(0, 2),
    cardX + 36,
    secondaryTagEndY + 38,
    cardWidth - 72,
    { font: `19px ${SERIF}`, lineHeight: 24, gap: 6, maxLinesPerItem: 2 },
  )

  return toTexture(canvas)
}

function buildCertificationPage() {
  const { canvas, context } = createPageCanvas({ dark: true })
  drawSectionHeader(context, 'Always Learning', 'Certifications', PAGE_PADDING, 96, {
    accent: BLUE, dark: true,
  })

  const panels = [
    {
      title: 'Certifications',
      subtitle: 'Core credentials across cloud, frontend, and data tooling.',
      items: portfolioData.certifications.certifications,
      x: PAGE_PADDING,
    },
    {
      title: 'Online Courses',
      subtitle: 'Focused coursework that supported product and systems execution.',
      items: portfolioData.certifications.courses,
      x: PAGE_PADDING + 510,
    },
  ]

  panels.forEach(({ title, subtitle, items, x }) => {
    fillRoundedRect(context, x, 250, 470, 1120, 30, 'rgba(240, 235, 227, 0.04)')
    strokeRoundedRect(context, x, 250, 470, 1120, 30, 'rgba(201, 169, 110, 0.14)')

    context.fillStyle = BLUE
    context.font = `700 18px ${SANS}`
    context.fillText(title.toUpperCase(), x + 28, 294)

    context.fillStyle = '#f0ebe3'
    context.font = `700 34px ${SANS}`
    context.fillText(title, x + 28, 342)

    context.fillStyle = 'rgba(224, 216, 204, 0.78)'
    context.font = `25px ${SERIF}`
    drawParagraphs(
      context,
      [subtitle],
      x + 28,
      392,
      414,
      { font: `25px ${SERIF}`, fillStyle: 'rgba(224, 216, 204, 0.78)', lineHeight: 34, gap: 0, maxLinesPerParagraph: 3 },
    )

    drawBulletList(
      context,
      items,
      x + 28,
      500,
      414,
      {
        font: `25px ${SERIF}`,
        fillStyle: '#e0d8cc',
        bulletColor: BLUE,
        lineHeight: 34,
        gap: 12,
        maxLinesPerItem: 2,
      },
    )
  })

  return toTexture(canvas)
}

function buildExperiencePage() {
  const { canvas, context } = createPageCanvas()
  drawSectionHeader(context, "Where I've Worked", 'Experience', PAGE_PADDING, 96)

  const currentRole = portfolioData.experience[0]
  const supportingRoles = portfolioData.experience.slice(1)

  fillRoundedRect(context, PAGE_PADDING, 250, 1020, 428, 30, 'rgba(30, 25, 18, 0.035)')
  strokeRoundedRect(context, PAGE_PADDING, 250, 1020, 428, 30, 'rgba(30, 25, 18, 0.08)')

  context.fillStyle = ACCENT
  context.font = `700 16px ${SANS}`
  context.fillText('CURRENT ROLE', PAGE_PADDING + 32, 286)

  context.fillStyle = INK_LIGHT
  context.font = `700 34px ${SANS}`
  const currentTitleEndY = drawWrappedText(
    context,
    currentRole.title,
    PAGE_PADDING + 32,
    334,
    580,
    34,
    2,
  )

  context.fillStyle = MUTED_LIGHT
  context.font = `600 23px ${SANS}`
  const currentCompanyEndY = drawWrappedText(
    context,
    currentRole.company,
    PAGE_PADDING + 32,
    currentTitleEndY - 2,
    580,
    25,
    2,
  )

  context.font = `400 21px ${SANS}`
  const currentMetaEndY = drawWrappedText(
    context,
    `${currentRole.location} | ${currentRole.date}`,
    PAGE_PADDING + 32,
    currentCompanyEndY + 4,
    580,
    23,
    2,
  )

  const currentBodyEndY = drawParagraphs(
    context,
    [currentRole.description],
    PAGE_PADDING + 32,
    currentMetaEndY + 20,
    580,
    { font: `21px ${SERIF}`, lineHeight: 28, gap: 0, maxLinesPerParagraph: 4 },
  )

  drawTagRow(
    context,
    currentRole.skills.slice(0, 4),
    PAGE_PADDING + 32,
    currentBodyEndY + 10,
    580,
    '#2a2520',
  )

  context.fillStyle = INK_LIGHT
  context.font = `700 22px ${SANS}`
  context.fillText('Teaching Scope', PAGE_PADDING + 670, 340)
  drawBulletList(
    context,
    currentRole.highlights.slice(0, 3),
    PAGE_PADDING + 670,
    382,
    294,
    {
      font: `20px ${SERIF}`,
      lineHeight: 25,
      gap: 9,
      maxLinesPerItem: 3,
    },
  )

  supportingRoles.forEach((role, index) => {
    const x = PAGE_PADDING + index * 348
    const y = 714
    const width = 324
    const height = 504

    fillRoundedRect(context, x, y, width, height, 26, 'rgba(30, 25, 18, 0.035)')
    strokeRoundedRect(context, x, y, width, height, 26, 'rgba(30, 25, 18, 0.08)')

    context.fillStyle = ACCENT
    context.font = `700 15px ${SANS}`
    context.fillText('SELECTED ROLE', x + 22, y + 32)

    context.fillStyle = INK_LIGHT
    context.font = `700 25px ${SANS}`
    const titleEndY = drawWrappedText(
      context,
      role.title,
      x + 22,
      y + 72,
      width - 44,
      28,
      3,
    )

    context.fillStyle = MUTED_LIGHT
    context.font = `600 17px ${SANS}`
    const companyEndY = drawWrappedText(
      context,
      role.company,
      x + 22,
      titleEndY - 2,
      width - 44,
      20,
      3,
    )

    context.font = `400 16px ${SANS}`
    const metaEndY = drawWrappedText(
      context,
      `${role.location} | ${role.date}`,
      x + 22,
      companyEndY + 2,
      width - 44,
      18,
      3,
    )

    const bodyEndY = drawParagraphs(
      context,
      [role.description],
      x + 22,
      metaEndY + 16,
      width - 44,
      { font: `18px ${SERIF}`, lineHeight: 24, gap: 0, maxLinesPerParagraph: 4 },
    )

    context.fillStyle = INK_LIGHT
    context.font = `700 17px ${SANS}`
    context.fillText('Highlights', x + 22, bodyEndY + 8)
    const bulletEndY = drawBulletList(
      context,
      role.highlights.slice(0, 2),
      x + 22,
      bodyEndY + 36,
      width - 44,
      {
        font: `17px ${SERIF}`,
        lineHeight: 22,
        gap: 6,
        maxLinesPerItem: 2,
      },
    )

    drawTagRow(
      context,
      role.skills.slice(0, 2),
      x + 22,
      Math.min(bulletEndY + 4, y + height - 58),
      width - 44,
      '#2a2520',
    )
  })

  return toTexture(canvas)
}

function buildImpactPage() {
  const { canvas, context } = createPageCanvas()
  drawSectionHeader(context, 'Execution', 'Impact & Range', PAGE_PADDING, 96)

  context.fillStyle = INK_LIGHT
  context.font = `700 34px ${SANS}`
  context.fillText('Additional Roles', PAGE_PADDING, 250)

  let y = 300
  portfolioData.experience.slice(2).forEach((role) => {
    fillRoundedRect(context, PAGE_PADDING, y, 1020, 248, 26, 'rgba(30, 25, 18, 0.035)')
    strokeRoundedRect(context, PAGE_PADDING, y, 1020, 248, 26, 'rgba(30, 25, 18, 0.08)')

    context.fillStyle = ACCENT
    context.font = `700 16px ${SANS}`
    context.fillText('OPERATING ROLE', PAGE_PADDING + 26, y + 34)

    context.fillStyle = INK_LIGHT
    context.font = `700 30px ${SANS}`
    const titleEndY = drawWrappedText(
      context,
      role.title,
      PAGE_PADDING + 26,
      y + 78,
      600,
      32,
      2,
    )

    context.fillStyle = MUTED_LIGHT
    context.font = `600 22px ${SANS}`
    const companyEndY = drawWrappedText(
      context,
      role.company,
      PAGE_PADDING + 26,
      titleEndY - 2,
      600,
      24,
      2,
    )

    context.font = `400 20px ${SANS}`
    drawWrappedText(
      context,
      `${role.location} | ${role.date}`,
      PAGE_PADDING + 26,
      companyEndY + 2,
      600,
      22,
      2,
    )

    drawParagraphs(
      context,
      [role.description],
      PAGE_PADDING + 26,
      y + 160,
      600,
      { font: `22px ${SERIF}`, lineHeight: 30, gap: 0, maxLinesPerParagraph: 2 },
    )

    context.fillStyle = INK_LIGHT
    context.font = `700 20px ${SANS}`
    context.fillText('Highlights', PAGE_PADDING + 692, y + 78)

    drawBulletList(
      context,
      role.highlights.slice(0, 2),
      PAGE_PADDING + 692,
      y + 118,
      270,
      {
        font: `22px ${SERIF}`,
        fillStyle: MUTED_LIGHT,
        bulletColor: ACCENT,
        lineHeight: 28,
        gap: 8,
        maxLinesPerItem: 2,
      },
    )

    drawTagRow(
      context,
      role.skills.slice(0, 3),
      PAGE_PADDING + 692,
      y + 202,
      270,
      '#2a2520',
    )

    y += 280
  })

  context.fillStyle = INK_LIGHT
  context.font = `700 34px ${SANS}`
  context.fillText('Operating Profile', PAGE_PADDING, 920)

  portfolioData.metrics.forEach(([value, label], index) => {
    drawMetricCard(
      context,
      value,
      label,
      PAGE_PADDING + (index % 2) * 500,
      970 + Math.floor(index / 2) * 180,
      470,
      { dark: false },
    )
  })

  return toTexture(canvas)
}

function drawProjectPage(title, projects) {
  const { canvas, context } = createPageCanvas()
  drawSectionHeader(context, 'Featured Work', title, PAGE_PADDING, 96)

  const isGrid = projects.length >= 3
  const cardWidth = isGrid ? 492 : 1020
  const cardHeight = isGrid ? 344 : 356

  projects.forEach((project, index) => {
    const column = isGrid ? index % 2 : 0
    const row = isGrid ? Math.floor(index / 2) : index
    const x = PAGE_PADDING + column * 528
    const y = 250 + row * (cardHeight + 24)

    fillRoundedRect(context, x, y, cardWidth, cardHeight, 26, 'rgba(30, 25, 18, 0.035)')
    strokeRoundedRect(context, x, y, cardWidth, cardHeight, 26, 'rgba(30, 25, 18, 0.08)')
    context.fillStyle = ACCENT
    context.font = `700 16px ${SANS}`
    context.fillText('PROJECT', x + 24, y + 32)
    context.fillStyle = INK_LIGHT
    context.font = `700 30px ${SANS}`
    const titleEndY = drawWrappedText(
      context,
      project.title,
      x + 24,
      y + 70,
      cardWidth - 48,
      34,
      2,
    )
    const bodyEndY = drawParagraphs(
      context, [project.description],
      x + 24, titleEndY + 10, cardWidth - 48,
      { font: `21px ${SERIF}`, lineHeight: 28, gap: 0, maxLinesPerParagraph: isGrid ? 5 : 4 },
    )
    drawTagRow(
      context,
      project.tech.slice(0, 3),
      x + 24,
      Math.min(bodyEndY + 18, y + cardHeight - 84),
      cardWidth - 48,
      '#2a2520',
    )
  })

  return toTexture(canvas)
}

function drawProjectNotesPage(kicker, title, summary, bullets, tags) {
  const { canvas, context } = createPageCanvas({ dark: true })
  drawSectionHeader(context, kicker, title, PAGE_PADDING, 96, { accent: BLUE, dark: true })

  fillRoundedRect(context, PAGE_PADDING, 250, 1020, 250, 30, 'rgba(240, 235, 227, 0.04)')
  strokeRoundedRect(context, PAGE_PADDING, 250, 1020, 250, 30, 'rgba(201, 169, 110, 0.14)')
  context.fillStyle = '#f0ebe3'
  context.font = `700 36px ${SANS}`
  context.fillText('Context', PAGE_PADDING + 30, 308)
  drawParagraphs(
    context,
    [summary],
    PAGE_PADDING + 30,
    360,
    960,
    {
      font: `28px ${SERIF}`,
      fillStyle: 'rgba(224, 216, 204, 0.8)',
      lineHeight: 37,
      gap: 0,
      maxLinesPerParagraph: 4,
    },
  )

  fillRoundedRect(context, PAGE_PADDING, 544, 492, 694, 28, 'rgba(240, 235, 227, 0.04)')
  strokeRoundedRect(context, PAGE_PADDING, 544, 492, 694, 28, 'rgba(201, 169, 110, 0.14)')
  context.fillStyle = BLUE
  context.font = `700 18px ${SANS}`
  context.fillText('FOCUS AREAS', PAGE_PADDING + 28, 584)
  context.fillStyle = '#f0ebe3'
  context.font = `700 34px ${SANS}`
  context.fillText('What This Section Covers', PAGE_PADDING + 28, 632)
  drawBulletList(
    context,
    bullets,
    PAGE_PADDING + 28,
    694,
    430,
    {
      font: `24px ${SERIF}`,
      fillStyle: 'rgba(224, 216, 204, 0.8)',
      bulletColor: BLUE,
      lineHeight: 32,
      gap: 12,
      maxLinesPerItem: 3,
    },
  )

  fillRoundedRect(context, PAGE_PADDING + 528, 544, 492, 694, 28, 'rgba(240, 235, 227, 0.04)')
  strokeRoundedRect(context, PAGE_PADDING + 528, 544, 492, 694, 28, 'rgba(201, 169, 110, 0.14)')
  context.fillStyle = BLUE
  context.font = `700 18px ${SANS}`
  context.fillText('STACK SIGNALS', PAGE_PADDING + 556, 584)
  context.fillStyle = '#f0ebe3'
  context.font = `700 34px ${SANS}`
  context.fillText('Themes & Tools', PAGE_PADDING + 556, 632)
  drawTagRow(
    context,
    tags,
    PAGE_PADDING + 556,
    690,
    436,
    '#f0ebe3',
  )

  context.fillStyle = 'rgba(224, 216, 204, 0.72)'
  context.font = `italic 23px ${SERIF}`
  context.fillText('Turn the page for the next build set.', PAGE_PADDING + 556, 1166)

  return toTexture(canvas)
}

function buildContactPage() {
  const { canvas, context } = createPageCanvas()
  let y = drawSectionHeader(context, 'Direct Channel', 'Contact Me', PAGE_PADDING, 96)

  context.fillStyle = MUTED_LIGHT
  context.font = `400 30px ${SERIF}`
  context.fillText('Open to product engineering roles, collaborations, and systems worth building.', PAGE_PADDING, y + 8)

  fillRoundedRect(context, 92, 328, 380, 1060, 32, 'rgba(30, 25, 18, 0.03)')
  strokeRoundedRect(context, 92, 328, 380, 1060, 32, 'rgba(30, 25, 18, 0.08)')

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
    ['Product Engineering', 'AI Systems', '0-to-1 Builds', 'Design Engineering', 'Operator Workflows'],
    124,
    1068,
    316,
    '#2a2520',
  )

  fillRoundedRect(context, 520, 328, 588, 1060, 32, 'rgba(122, 101, 53, 0.06)')
  strokeRoundedRect(context, 520, 328, 588, 1060, 32, 'rgba(122, 101, 53, 0.18)')

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
  context.fillStyle = '#f5f2ec'
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

    fillRoundedRect(context, x, y, 480, 158, 28, 'rgba(30, 25, 18, 0.035)')
    strokeRoundedRect(context, x, y, 480, 158, 28, 'rgba(30, 25, 18, 0.08)')
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
  context.fillText('Working Style', PAGE_PADDING, 960)
  drawTagRow(
    context,
    ['Clarity', 'Speed', 'Systems Thinking', 'Product Taste', 'Iteration', 'Positioning', 'Reliability', 'Range'],
    PAGE_PADDING,
    996,
    1020,
    '#2a2520',
  )

  fillRoundedRect(context, PAGE_PADDING, 1136, 1020, 220, 28, 'rgba(122, 101, 53, 0.06)')
  strokeRoundedRect(context, PAGE_PADDING, 1136, 1020, 220, 28, 'rgba(122, 101, 53, 0.14)')
  context.fillStyle = ACCENT
  context.font = `700 22px ${SANS}`
  context.fillText('Availability', PAGE_PADDING + 28, 1182)
  drawParagraphs(
    context,
    [
      'Best for product engineering roles, AI systems work, founder conversations, and design-engineering collaborations.',
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
  footerFade.addColorStop(0, 'rgba(0, 0, 5, 0)')
  footerFade.addColorStop(0.66, 'rgba(0, 0, 5, 0.15)')
  footerFade.addColorStop(1, 'rgba(0, 0, 5, 0.65)')
  context.fillStyle = footerFade
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  fillRoundedRect(context, 116, 1300, 968, 176, 20, 'rgba(10, 10, 15, 0.7)')
  strokeRoundedRect(context, 116, 1300, 968, 176, 20, 'rgba(201, 169, 110, 0.15)')
  context.textAlign = 'center'
  context.fillStyle = BLUE
  context.font = `700 52px ${SANS}`
  context.fillText('Pranav Sagar', PAGE_WIDTH / 2, 1374)
  context.fillStyle = BLUE_DIM
  context.font = `700 22px ${SANS}`
  context.fillText('SELECTED WORK', PAGE_WIDTH / 2, 1412)
  context.fillStyle = '#e0d8cc'
  context.font = `500 24px ${SANS}`
  context.fillText('pranavsagar.us  |  psagar2@asu.edu', PAGE_WIDTH / 2, 1450)

  context.strokeStyle = 'rgba(201, 169, 110, 0.15)'
  context.lineWidth = 3
  context.strokeRect(40, 40, PAGE_WIDTH - 80, PAGE_HEIGHT - 80)
  context.textAlign = 'left'

  return toTexture(canvas)
}

// ── Export ─────────────────────────────────────────────────

export function createPortfolioPageTextures({
  portraitImage,
  galleryImages,
  coverArtImage,
  backArtImage,
  anisotropy = 16,
  contentScale = DEFAULT_CONTENT_TEXTURE_SCALE,
  introScale = DEFAULT_INTRO_TEXTURE_SCALE,
  generateMipmaps = true,
}) {
  const previousContentScale = contentTextureScale
  const previousIntroScale = introTextureScale
  contentTextureScale = contentScale
  introTextureScale = introScale

  try {
    const textures = {
      coverFront: buildCoverFront(portraitImage, coverArtImage, anisotropy),
      insideCover: buildInsideCover(portraitImage, anisotropy),
      hero: buildHeroPage(anisotropy),
      about: buildAboutPage(anisotropy),
      gallery: buildGalleryPage(galleryImages, anisotropy),
      skills: buildSkillsPage(anisotropy),
      education: buildEducationPage(anisotropy),
      certifications: buildCertificationPage(anisotropy),
      experience: buildExperiencePage(anisotropy),
      impact: buildImpactPage(anisotropy),
      projectsA: drawProjectPage(projectCollections[0].title, projectCollections[0].projects, anisotropy),
      projectsB: drawProjectPage(projectCollections[1].title, projectCollections[1].projects, anisotropy),
      projectsC: drawProjectPage(projectCollections[2].title, projectCollections[2].projects, anisotropy),
      projectsD: drawProjectPage(projectCollections[3].title, projectCollections[3].projects, anisotropy),
      projectNotesA: drawProjectNotesPage(
        'Build Notes',
        projectCollections[0].title,
        projectCollections[0].summary,
        projectCollections[0].focusAreas,
        projectCollections[0].stackSignals,
        anisotropy,
      ),
      projectNotesB: drawProjectNotesPage(
        'Build Notes',
        projectCollections[1].title,
        projectCollections[1].summary,
        projectCollections[1].focusAreas,
        projectCollections[1].stackSignals,
        anisotropy,
      ),
      projectNotesC: drawProjectNotesPage(
        'Build Notes',
        projectCollections[2].title,
        projectCollections[2].summary,
        projectCollections[2].focusAreas,
        projectCollections[2].stackSignals,
        anisotropy,
      ),
      projectNotesD: drawProjectNotesPage(
        'Build Notes',
        projectCollections[3].title,
        projectCollections[3].summary,
        projectCollections[3].focusAreas,
        projectCollections[3].stackSignals,
        anisotropy,
      ),
      contactPrelude: drawProjectNotesPage(
        'Direct Channel',
        'Reach Out',
        'This transition page sets up the closing section: where to contact Pranav, what kinds of work fit best, and how the conversation should start.',
        [
          'Best routes for outreach, collaboration, and role discussions',
          'Signals around fit, working style, and product-minded execution',
          'A clean handoff into open channels and the final close',
        ],
        ['Website', 'Email', 'LinkedIn', 'GitHub', 'Tempe', 'Product Engineering', 'AI Systems'],
        anisotropy,
      ),
      contact: buildContactPage(anisotropy),
      social: buildSocialPage(anisotropy),
      finale: buildFinalePage(portraitImage, anisotropy),
      backCover: buildBackCover(backArtImage, anisotropy),
    }

    Object.values(textures).forEach((texture) => {
      texture.anisotropy = anisotropy
      texture.generateMipmaps = generateMipmaps
      texture.minFilter = generateMipmaps
        ? THREE.LinearMipmapLinearFilter
        : THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    })

    return textures
  } finally {
    contentTextureScale = previousContentScale
    introTextureScale = previousIntroScale
  }
}
