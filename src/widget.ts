import type {
  WidgetConfig,
  WidgetState,
  WidgetFile,
  I18nStrings,
  SubmitPayload,
  WidgetView,
  ApiResponse,
  SuggestResult,
  SuggestResponse,
} from './types'
import CSS from './widget.css?inline'

// ============================================
// I18N STRINGS (embedded)
// ============================================

const STRINGS: Record<string, I18nStrings> = {
  de: {
    buttonText: 'Support',
    title: 'Kontaktieren Sie uns',
    labelEmail: 'E-Mail',
    labelName: 'Name',
    labelSubject: 'Betreff',
    labelMessage: 'Nachricht',
    labelAttachments: 'Anhang',
    placeholderEmail: 'ihre@email.de',
    placeholderName: 'Ihr Name',
    placeholderSubject: 'Worum geht es?',
    placeholderMessage: 'Beschreiben Sie Ihr Anliegen...',
    submit: 'Absenden',
    cancel: 'Abbrechen',
    sending: 'Wird gesendet...',
    successTitle: 'Vielen Dank!',
    successMessage: 'Ihr Ticket wurde erstellt. Wir melden uns so schnell wie möglich.',
    errorTitle: 'Fehler',
    errorRetry: 'Erneut versuchen',
    close: 'Schließen',
    newMessage: 'Neue Nachricht senden',
    dragDrop: 'Dateien hierher ziehen',
    dragDropOr: 'oder',
    browse: 'Datei auswählen',
    remove: 'Entfernen',
    errorRequired: 'Dieses Feld ist erforderlich',
    errorEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    errorMinLength: 'Mindestens 10 Zeichen erforderlich',
    errorFileSize: 'Datei ist zu groß',
    errorFileType: 'Dateityp nicht erlaubt',
    errorMaxFiles: 'Maximale Dateianzahl erreicht',
    errorTotalSize: 'Gesamtgröße der Dateien zu groß',
    suggestHeader: 'Vielleicht hilft das?',
    screenshotCapture: 'Bildschirmfoto aufnehmen',
    screenshotFileName: 'bildschirmfoto',
    errorScreenshot: 'Bildschirmfoto konnte nicht erstellt werden',
  },
  en: {
    buttonText: 'Support',
    title: 'Contact us',
    labelEmail: 'Email',
    labelName: 'Name',
    labelSubject: 'Subject',
    labelMessage: 'Message',
    labelAttachments: 'Attachments',
    placeholderEmail: 'your@email.com',
    placeholderName: 'Your name',
    placeholderSubject: 'What is it about?',
    placeholderMessage: 'Describe your issue...',
    submit: 'Submit',
    cancel: 'Cancel',
    sending: 'Sending...',
    successTitle: 'Thank you!',
    successMessage: 'Your ticket has been created. We will get back to you as soon as possible.',
    errorTitle: 'Error',
    errorRetry: 'Try again',
    close: 'Close',
    newMessage: 'Send another message',
    dragDrop: 'Drag files here',
    dragDropOr: 'or',
    browse: 'Browse files',
    remove: 'Remove',
    errorRequired: 'This field is required',
    errorEmail: 'Please enter a valid email address',
    errorMinLength: 'At least 10 characters required',
    errorFileSize: 'File is too large',
    errorFileType: 'File type not allowed',
    errorMaxFiles: 'Maximum number of files reached',
    errorTotalSize: 'Total file size too large',
    suggestHeader: 'Maybe this helps?',
    screenshotCapture: 'Take a screenshot',
    screenshotFileName: 'screenshot',
    errorScreenshot: 'The screenshot could not be captured',
  },
}

// Sprache aufloesen: leeres/fehlendes Attribut => Browsersprache
// (navigator.language, z.B. "de-DE" -> "de"). Ein explizit gesetzter, aber
// nicht unterstuetzter Wert faellt ebenso auf Deutsch zurueck.
function resolveLanguage(attr: string): string {
  const pick = (raw: string) => raw.trim().slice(0, 2).toLowerCase()
  const wanted = attr ? pick(attr) : pick(navigator.language || '')
  return wanted in STRINGS ? wanted : 'de'
}

// ============================================
// ICONS
// ============================================

const ICON_CHAT = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>`
const ICON_CLOSE = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
const ICON_CHECK = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
const ICON_ERROR = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`
const ICON_SCREENSHOT = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>`

// ============================================
// STYLES
// ============================================

// ============================================
// HELPERS
// ============================================

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ---- Kontrast (WCAG AA) --------------------------------------------------
// Das Widget laeuft mit der Markenfarbe des Kunden. Helle Farben reissen als
// Textfarbe auf Weiss bzw. als Flaeche hinter weisser Schrift die
// AA-Schwelle von 4,5:1 — beim eigenen Orange (#FF6E2D) etwa nur 2,79:1.
// Statt das jedem Kunden als Konfiguration aufzubuerden, leiten wir die
// Textfarben hier aus der Primaerfarbe ab.

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim())
  if (!m) return null
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const ch = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [l1, l2] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const WHITE: [number, number, number] = [255, 255, 255]
const NEAR_BLACK: [number, number, number] = [26, 15, 8]

/** Lesbare Schrift AUF der Primaerflaeche: Weiss oder fast-Schwarz. */
export function onPrimary(primary: string): string {
  const rgb = parseHex(primary)
  if (!rgb) return '#fff'
  return contrast(rgb, WHITE) >= contrast(rgb, NEAR_BLACK) ? '#fff' : '#1a0f08'
}

/**
 * Primaerfarbe als TEXT auf hellem Grund: schrittweise abdunkeln, bis 4,5:1
 * gegen Weiss erreicht ist. Der Farbton bleibt erhalten, nur die Helligkeit
 * sinkt — eine blaue Marke bleibt blau.
 */
export function primaryText(primary: string): string {
  const rgb = parseHex(primary)
  if (!rgb) return primary
  let cur = rgb
  for (let i = 0; i < 20 && contrast(cur, WHITE) < 4.5; i++) {
    cur = cur.map((c) => Math.round(c * 0.9)) as [number, number, number]
  }
  return '#' + cur.map((c) => c.toString(16).padStart(2, '0')).join('')
}

// M8f: URL-Scheme-Whitelist. Das Widget laeuft im Origin der einbettenden
// Kundenseite; eine `javascript:`-URL aus Tenant-/Suggest-Daten wuerde dort
// Code ausfuehren. Nur http(s) durchlassen, sonst leer (Link wird inaktiv).
function safeUrl(url: string): string {
  const trimmed = (url || '').trim()
  return /^https?:\/\//i.test(trimmed) ? esc(trimmed) : ''
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// custom-fields Attribut: JSON-Objekt {label: wert}. Nur String/Number-Werte
// werden übernommen; kaputtes JSON ergibt {} (Widget bleibt tolerant).
function parseCustomFields(raw: string): Record<string, string> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, string> = {}
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === 'string' || typeof val === 'number') out[key] = String(val)
    }
    return out
  } catch {
    return {}
  }
}

let fileCounter = 0
let screenshotCounter = 0

// Optionen für die Bildschirm-Freigabe (getDisplayMedia). preferCurrentTab und
// selfBrowserSurface sind Chromium-Erweiterungen (schlagen den aktuellen Tab im
// Freigabe-Dialog vor); Firefox/Safari ignorieren unbekannte Dictionary-Member.
// Eigenes Interface statt DOM-lib-Typ, damit tsc strict ohne `any` auskommt.
interface ScreenCaptureOptions {
  video: boolean
  preferCurrentTab?: boolean
  selfBrowserSurface?: 'include' | 'exclude'
}

// Screen Capture API existiert nur auf Desktop-Browsern in secure contexts —
// auf Mobilgeräten (iOS Safari, Android Chrome) wird der Knopf nicht gerendert.
function canCaptureScreen(): boolean {
  return typeof navigator.mediaDevices?.getDisplayMedia === 'function'
}

// Wartet, bis der Aufnahme-Stream Frames liefert, die nach dem Ausblenden des
// Panels entstanden sind: mindestens FRESH_MIN_MS Zeit und FRESH_MIN_FRAMES neue
// Frames, höchstens FRESH_MAX_MS (ein unbewegter Bildschirm liefert kaum Frames).
// Ohne requestVideoFrameCallback (ältere Browser) bleibt nur die Mindestzeit.
const FRESH_MIN_MS = 300
const FRESH_MIN_FRAMES = 2
const FRESH_MAX_MS = 1500

function waitForFreshFrames(video: HTMLVideoElement): Promise<void> {
  const start = performance.now()
  return new Promise<void>((resolve) => {
    if (typeof video.requestVideoFrameCallback !== 'function') {
      setTimeout(resolve, FRESH_MIN_MS)
      return
    }
    let finished = false
    const done = () => {
      finished = true
      clearTimeout(timeout)
      resolve()
    }
    const timeout = setTimeout(done, FRESH_MAX_MS)
    let frames = 0
    const onFrame = () => {
      if (finished) return
      frames++
      if (frames >= FRESH_MIN_FRAMES && performance.now() - start >= FRESH_MIN_MS) done()
      else video.requestVideoFrameCallback(onFrame)
    }
    video.requestVideoFrameCallback(onFrame)
  })
}

function readFile(file: File): Promise<WidgetFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve({
        id: `f-${++fileCounter}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        data: base64,
      })
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}

// ============================================
// WIDGET CLASS
// ============================================

export class AccountdeskWidget extends HTMLElement {
  private root: ShadowRoot
  private state: WidgetState = {
    view: 'button',
    email: '',
    name: '',
    subject: '',
    message: '',
    files: [],
    errors: {},
    ticketId: null,
    errorMessage: '',
    suggestResults: [],
    suggestRequestId: 0,
    suggestDebounceTimer: null,
  }
  private config!: WidgetConfig
  private strings: I18nStrings = STRINGS.de
  private container!: HTMLDivElement
  private escKeyHandler: ((e: KeyboardEvent) => void) | null = null
  // Guard gegen Doppelklick auf den Bildschirmfoto-Knopf; bewusst kein State
  // (ein Re-Render während der Freigabe-Dialog offen ist wäre kontraproduktiv).
  private captureBusy = false

  static get observedAttributes() {
    return [
      'token',
      'api-url',
      'language',
      'primary-color',
      'primary-color-hover',
      'position',
      'mode',
      'button-text',
      'title',
      'show-subject',
      'show-attachments',
      'show-header',
      'max-file-size',
      'max-files',
      'allowed-file-types',
      'z-index',
      'offset-x',
      'offset-y',
      'suggest-articles',
      'screenshot',
      'prefill-email',
      'prefill-name',
      'external-customer-nr',
      'show-email',
      'show-name',
      'custom-fields',
    ]
  }

  constructor() {
    super()
    this.root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.config = this.readConfig()
    this.strings = STRINGS[this.config.language] ?? STRINGS.de
    if (this.config.mode === 'inline') this.state.view = 'form'
    if (this.config.mode === 'modal') this.state.view = 'hidden'
    if (this.config.prefillEmail) this.state.email = this.config.prefillEmail
    if (this.config.prefillName) this.state.name = this.config.prefillName

    const style = document.createElement('style')
    style.textContent = CSS
    this.root.appendChild(style)

    this.container = document.createElement('div')
    this.root.appendChild(this.container)
    this.applyProps()
    this.render()
  }

  disconnectedCallback() {
    if (this.escKeyHandler) document.removeEventListener('keydown', this.escKeyHandler)
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    if (oldVal === newVal || !this.container) return
    this.config = this.readConfig()
    this.strings = STRINGS[this.config.language] ?? STRINGS.de
    this.applyProps()
    this.render()
  }

  private readConfig(): WidgetConfig {
    const a = (name: string, def: string) => this.getAttribute(name) ?? def
    const primary = a('primary-color', '#1976D2')
    return {
      token: a('token', ''),
      apiUrl: a('api-url', 'https://my.accountdesk.de/api'),
      language: resolveLanguage(a('language', '')),
      primaryColor: primary,
      primaryColorHover: a('primary-color-hover', primary),
      position: a('position', 'bottom-right') as 'bottom-right' | 'bottom-left',
      mode: a('mode', 'floating') as 'floating' | 'inline' | 'modal',
      buttonText: a('button-text', ''),
      title: a('title', ''),
      showSubject: a('show-subject', 'true') !== 'false',
      showAttachments: a('show-attachments', 'true') !== 'false',
      showHeader: a('show-header', 'true') !== 'false',
      showEmail: a('show-email', 'true') !== 'false',
      showName: a('show-name', 'true') !== 'false',
      maxFileSize: parseInt(a('max-file-size', '10'), 10),
      maxFiles: parseInt(a('max-files', '5'), 10),
      allowedFileTypes: a('allowed-file-types', '.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt,.zip')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      zIndex: parseInt(a('z-index', '9999'), 10),
      offsetX: a('offset-x', '20px'),
      offsetY: a('offset-y', '20px'),
      suggestArticles: a('suggest-articles', 'false') === 'true',
      screenshot: a('screenshot', 'false') === 'true',
      prefillEmail: a('prefill-email', ''),
      prefillName: a('prefill-name', ''),
      externalCustomerNr: a('external-customer-nr', ''),
      customFields: parseCustomFields(a('custom-fields', '')),
    }
  }

  private applyProps() {
    const h = this.root.host as HTMLElement
    h.style.setProperty('--ad-primary', this.config.primaryColor)
    h.style.setProperty('--ad-primary-hover', this.config.primaryColorHover)
    // Aus der Markenfarbe abgeleitete Kontrastfarben — siehe onPrimary/
    // primaryText. Ohne sie reissen helle Markenfarben WCAG AA: weisse Schrift
    // auf der Flaeche und die Farbe selbst als Linktext liegen dann unter 4,5:1.
    h.style.setProperty('--ad-on-primary', onPrimary(this.config.primaryColor))
    h.style.setProperty('--ad-primary-text', primaryText(this.config.primaryColor))
    h.style.setProperty('--ad-z', String(this.config.zIndex))
    h.style.setProperty('--ad-offset-x', this.config.offsetX)
    h.style.setProperty('--ad-offset-y', this.config.offsetY)
    if (this.config.mode === 'inline') h.style.display = 'block'
    // Modal: Host erzeugt keine eigene Box — das fixed Overlay ist sein Child.
    if (this.config.mode === 'modal') h.style.display = 'contents'
  }

  // ---- Public API (z.B. via Template-Ref im Host-Frontend) ----

  /** Öffnet das Formular. Im Modal-Modus erscheint das zentrierte Overlay. */
  open() {
    if (!this.state.email && this.config.prefillEmail) this.state.email = this.config.prefillEmail
    if (!this.state.name && this.config.prefillName) this.state.name = this.config.prefillName
    this.setView('form')
  }

  /** Schließt das Widget zurück in seinen Ruhezustand (Modal → unsichtbar). */
  close() {
    this.setView(this.idleView())
  }

  /** Ruhe-View je nach Modus: inline bleibt am Formular, modal wird unsichtbar. */
  private idleView(): WidgetView {
    if (this.config.mode === 'inline') return 'form'
    if (this.config.mode === 'modal') return 'hidden'
    return 'button'
  }

  // ---- Rendering ----

  private render() {
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler)
      this.escKeyHandler = null
    }

    // Modal geschlossen → nichts rendern (Overlay würde sonst die Seite blockieren).
    if (this.config.mode === 'modal' && this.state.view === 'hidden') {
      this.container.innerHTML = ''
      return
    }

    const isInline = this.config.mode === 'inline'
    const isModal = this.config.mode === 'modal'
    const classes = ['acd-widget']
    classes.push(isInline ? 'acd-mode-inline' : isModal ? 'acd-mode-modal' : 'acd-mode-floating')
    if (!isInline && !isModal)
      classes.push(this.config.position === 'bottom-left' ? 'acd-bottom-left' : 'acd-bottom-right')
    const s = this.strings
    const st = this.state
    // 'hidden' wird oben abgefangen; Default '' hält tsc bei der View-Union zufrieden.
    let html = ''

    switch (st.view) {
      case 'button':
        html = `<button class="acd-button" type="button" aria-label="${esc(this.config.buttonText || s.buttonText)}">
          ${ICON_CHAT}<span>${esc(this.config.buttonText || s.buttonText)}</span></button>`
        break
      case 'form':
        html = this.renderForm()
        break
      case 'loading':
        html = `<div class="acd-panel"><div class="acd-loading">
          <div class="acd-spinner"></div><div class="acd-loading-text">${s.sending}</div></div></div>`
        break
      case 'success': {
        const tid = st.ticketId ? ` (#${esc(String(st.ticketId))})` : ''
        const closeLabel = isInline ? s.newMessage : s.close
        html = `<div class="acd-panel"><div class="acd-result">
          <div class="acd-result-icon acd-icon-success">${ICON_CHECK}</div>
          <div class="acd-result-title">${s.successTitle}</div>
          <div class="acd-result-text">${s.successMessage}${tid}</div>
          <button class="acd-btn acd-btn-primary" type="button" data-action="close">${closeLabel}</button>
        </div></div>`
        break
      }
      case 'error':
        html = `<div class="acd-panel"><div class="acd-result">
          <div class="acd-result-icon acd-icon-error">${ICON_ERROR}</div>
          <div class="acd-result-title">${s.errorTitle}</div>
          <div class="acd-result-text">${esc(st.errorMessage)}</div>
          <button class="acd-btn acd-btn-primary" type="button" data-action="retry">${s.errorRetry}</button>
        </div></div>`
        break
    }

    this.container.innerHTML = `<div class="${classes.join(' ')}">${html}</div>`
    this.bindEvents()
  }

  private renderForm(): string {
    const s = this.strings
    const st = this.state
    const cfg = this.config
    const err = (f: string) =>
      st.errors[f] ? `<div class="acd-error-text">${st.errors[f]}</div>` : ''
    const cls = (f: string) => (st.errors[f] ? ' acd-has-error' : '')

    // show-email/show-name=false blendet die Felder nur aus, wenn ein gültiger
    // Prefill-Wert existiert — sonst wäre das Pflichtfeld unausfüllbar.
    const hideEmail = !cfg.showEmail && EMAIL_RE.test(st.email.trim())
    const hideName = !cfg.showName && st.name.trim() !== ''

    let fields = ''
    if (!hideEmail) {
      fields += `
      <div class="acd-field">
        <label class="acd-label" for="acd-email">${s.labelEmail} *</label>
        <input class="acd-input${cls('email')}" id="acd-email" type="email"
          placeholder="${s.placeholderEmail}" value="${esc(st.email)}" data-field="email">
        ${err('email')}
      </div>`
    }
    if (!hideName) {
      fields += `
      <div class="acd-field">
        <label class="acd-label" for="acd-name">${s.labelName} *</label>
        <input class="acd-input${cls('name')}" id="acd-name" type="text"
          placeholder="${s.placeholderName}" value="${esc(st.name)}" data-field="name">
        ${err('name')}
      </div>`
    }

    if (cfg.showSubject) {
      fields += `
      <div class="acd-field">
        <label class="acd-label" for="acd-subject">${s.labelSubject}</label>
        <input class="acd-input${cls('subject')}" id="acd-subject" type="text"
          placeholder="${s.placeholderSubject}" value="${esc(st.subject)}" data-field="subject">
        ${err('subject')}
      </div>`
    }

    fields += `
      <div class="acd-field">
        <label class="acd-label" for="acd-message">${s.labelMessage} *</label>
        <textarea class="acd-textarea${cls('message')}" id="acd-message"
          placeholder="${s.placeholderMessage}" data-field="message">${esc(st.message)}</textarea>
        ${err('message')}
      </div>`

    if (cfg.suggestArticles && st.suggestResults.length > 0) {
      const items = st.suggestResults
        .slice(0, 3)
        .map((r) => {
          const title = esc(r.repo_name + ' / ' + r.path)
          const snippet = esc(r.snippet)
          if (r.url) {
            return `<a class="acd-suggest-item" href="${safeUrl(r.url)}" target="_blank" rel="noopener noreferrer">
            <div class="acd-suggest-title">${title}</div>
            <div class="acd-suggest-snippet">${snippet}</div>
          </a>`
          }
          return `<div class="acd-suggest-item-static">
          <div class="acd-suggest-title">${title}</div>
          <div class="acd-suggest-snippet">${snippet}</div>
        </div>`
        })
        .join('')
      fields += `<div class="acd-suggest" role="region" aria-label="${esc(s.suggestHeader)}">
        <div class="acd-suggest-header">${esc(s.suggestHeader)}</div>
        <div class="acd-suggest-list">${items}</div>
      </div>`
    }

    // Bildschirmfoto-Knopf nur wenn per Attribut aktiviert UND der Browser
    // Screen Capture kann (Desktop, secure context) — sonst gar nicht rendern.
    const showScreenshot = cfg.screenshot && canCaptureScreen()
    if (cfg.showAttachments || showScreenshot) {
      const fileList = st.files
        .map(
          (f) => `
        <div class="acd-file-item" data-file-id="${f.id}">
          <span class="acd-file-info">${esc(f.name)}<span class="acd-file-size">${formatSize(f.size)}</span></span>
          <button class="acd-file-remove" type="button" data-remove="${f.id}">${s.remove}</button>
        </div>`,
        )
        .join('')
      const dropzone = cfg.showAttachments
        ? `
        <div class="acd-dropzone" id="acd-dropzone">
          <div class="acd-dropzone-text">${s.dragDrop} ${s.dragDropOr}
            <span class="acd-browse-link">${s.browse}</span></div>
          <input class="acd-file-input" id="acd-file-input" type="file" multiple
            accept="${cfg.allowedFileTypes.join(',')}">
        </div>`
        : ''
      const screenshotBtn = showScreenshot
        ? `
        <button class="acd-screenshot-btn" type="button" data-action="screenshot">
          ${ICON_SCREENSHOT}<span>${s.screenshotCapture}</span></button>`
        : ''
      fields += `
      <div class="acd-field">
        <label class="acd-label">${s.labelAttachments}</label>
        ${dropzone}
        ${screenshotBtn}
        ${err('screenshot')}
        ${st.files.length ? `<div class="acd-file-list">${fileList}</div>` : ''}
      </div>`
    }

    const isInline = cfg.mode === 'inline'
    const showHeader = cfg.showHeader && !isInline
    const header = showHeader
      ? `<div class="acd-panel-header">
          <span class="acd-panel-title">${esc(cfg.title || s.title)}</span>
          <button class="acd-close-btn" type="button" aria-label="${s.close}">${ICON_CLOSE}</button>
        </div>`
      : ''
    const cancelBtn = isInline
      ? ''
      : `<button class="acd-btn acd-btn-secondary" type="button" data-action="cancel">${s.cancel}</button>`

    return `
    <div class="acd-panel" role="${isInline ? 'form' : 'dialog'}" aria-label="${esc(cfg.title || s.title)}">
      ${header}
      <div class="acd-form">${fields}</div>
      <div class="acd-form-footer">
        ${cancelBtn}
        <button class="acd-btn acd-btn-primary" type="button" data-action="submit">${s.submit}</button>
      </div>
    </div>`
  }

  // ---- Event binding ----

  private bindEvents() {
    const w = this.container.querySelector('.acd-widget')!
    const idle: WidgetView = this.idleView()

    // Open form
    w.querySelector('.acd-button')?.addEventListener('click', () => this.setView('form'))

    // Modal: Klick auf den Backdrop (außerhalb des Panels) schließt.
    if (this.config.mode === 'modal') {
      w.addEventListener('click', (e: Event) => {
        if (e.target === w) this.close()
      })
    }

    // Close / Cancel
    w.querySelector('.acd-close-btn')?.addEventListener('click', () => this.setView(idle))
    w.querySelector('[data-action="cancel"]')?.addEventListener('click', () => this.setView(idle))

    // Submit
    w.querySelector('[data-action="submit"]')?.addEventListener('click', () => this.handleSubmit())

    // Success close → reset
    w.querySelector('[data-action="close"]')?.addEventListener('click', () => this.resetAndClose())

    // Error retry
    w.querySelector('[data-action="retry"]')?.addEventListener('click', () => this.setView('form'))

    // Input binding
    w.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field]').forEach((el) => {
      el.addEventListener('input', () => {
        const f = el.dataset.field!
        ;(this.state as unknown as Record<string, string>)[f] = el.value
        if (this.state.errors[f]) {
          const newErr = { ...this.state.errors }
          delete newErr[f]
          this.state.errors = newErr
          el.classList.remove('acd-has-error')
          el.parentElement?.querySelector('.acd-error-text')?.remove()
        }
        if (this.config.suggestArticles && (f === 'subject' || f === 'message')) {
          this.scheduleSuggest()
        }
      })
    })

    // File upload
    const dropzone = w.querySelector<HTMLElement>('#acd-dropzone')
    const fileInput = w.querySelector<HTMLInputElement>('#acd-file-input')
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click())
      dropzone.addEventListener('dragover', (e: Event) => {
        e.preventDefault()
        dropzone.classList.add('acd-dragover')
      })
      dropzone.addEventListener('dragleave', (e: Event) => {
        e.preventDefault()
        dropzone.classList.remove('acd-dragover')
      })
      dropzone.addEventListener('drop', (e: Event) => {
        e.preventDefault()
        dropzone.classList.remove('acd-dragover')
        const dt = (e as DragEvent).dataTransfer
        if (dt?.files) this.handleFiles(Array.from(dt.files))
      })
      fileInput.addEventListener('change', () => {
        if (fileInput.files) this.handleFiles(Array.from(fileInput.files))
        fileInput.value = ''
      })
    }

    // Bildschirmfoto aufnehmen
    w.querySelector('[data-action="screenshot"]')?.addEventListener('click', () =>
      this.captureScreenshot(),
    )

    // File remove
    w.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.files = this.state.files.filter((f) => f.id !== btn.dataset.remove)
        this.render()
      })
    })

    // Escape key — in Floating- und Modal-Modus; inline würde ESC nur die Form leeren.
    // Während einer laufenden Bildschirmfoto-Aufnahme nicht schließen (ESC gehört
    // dort dem Freigabe-Dialog des Browsers).
    if (this.config.mode !== 'inline' && this.state.view !== idle) {
      this.escKeyHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !this.captureBusy) this.close()
      }
      document.addEventListener('keydown', this.escKeyHandler)
    }

    // Focus first input when form opens (Textarea als Fallback, falls
    // E-Mail/Name/Betreff per show-*-Attribut ausgeblendet sind)
    if (this.state.view === 'form') {
      setTimeout(
        () => this.root.querySelector<HTMLInputElement>('.acd-input, .acd-textarea')?.focus(),
        50,
      )
    }
  }

  // ---- Actions ----

  private setView(view: WidgetView) {
    this.state = { ...this.state, view, errors: {} }
    this.render()
  }

  private resetAndClose() {
    if (this.state.suggestDebounceTimer !== null) {
      clearTimeout(this.state.suggestDebounceTimer)
    }
    this.state = {
      view: this.idleView(),
      email: '',
      name: '',
      subject: '',
      message: '',
      files: [],
      errors: {},
      ticketId: null,
      errorMessage: '',
      suggestResults: [],
      suggestRequestId: 0,
      suggestDebounceTimer: null,
    }
    this.render()
  }

  // ---- Article suggestions (live during typing) ----

  private scheduleSuggest() {
    if (this.state.suggestDebounceTimer !== null) {
      clearTimeout(this.state.suggestDebounceTimer)
    }
    const combined = `${this.state.subject} ${this.state.message}`.trim().slice(0, 500)
    if (combined.length < 3) {
      if (this.state.suggestResults.length > 0) {
        this.state.suggestResults = []
        this.renderSuggestOnly()
      }
      this.state.suggestDebounceTimer = null
      return
    }
    this.state.suggestDebounceTimer = window.setTimeout(() => {
      this.state.suggestDebounceTimer = null
      this.fetchSuggestions(combined)
    }, 300)
  }

  private async fetchSuggestions(query: string) {
    const reqId = ++this.state.suggestRequestId
    let results: SuggestResult[] = []
    try {
      const res = await fetch(`${this.config.apiUrl}/v1/widget/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.token}`,
        },
        body: JSON.stringify({ query, lang: this.config.language }),
      })
      if (res.ok) {
        const data = (await res.json()) as SuggestResponse
        if (Array.isArray(data?.suggest_aa)) {
          results = data.suggest_aa
        }
      }
    } catch {
      // Service down — silently keep empty
    }
    if (reqId !== this.state.suggestRequestId) return // veraltete Response
    this.state.suggestResults = results
    this.renderSuggestOnly()
  }

  private renderSuggestOnly() {
    // Reines DOM-Update des Suggest-Containers ohne Full-Render
    // (sonst verliert das Textarea den Fokus und springt zum Anfang).
    const form = this.root.querySelector<HTMLElement>('.acd-form')
    if (!form) return
    const existing = form.querySelector('.acd-suggest')
    const st = this.state
    const s = this.strings
    if (!this.config.suggestArticles || st.suggestResults.length === 0) {
      existing?.remove()
      return
    }
    const items = st.suggestResults
      .slice(0, 3)
      .map((r) => {
        const title = esc(r.repo_name + ' / ' + r.path)
        const snippet = esc(r.snippet)
        if (r.url) {
          return `<a class="acd-suggest-item" href="${safeUrl(r.url)}" target="_blank" rel="noopener noreferrer">
          <div class="acd-suggest-title">${title}</div>
          <div class="acd-suggest-snippet">${snippet}</div>
        </a>`
        }
        return `<div class="acd-suggest-item-static">
        <div class="acd-suggest-title">${title}</div>
        <div class="acd-suggest-snippet">${snippet}</div>
      </div>`
      })
      .join('')
    const html = `<div class="acd-suggest" role="region" aria-label="${esc(s.suggestHeader)}">
      <div class="acd-suggest-header">${esc(s.suggestHeader)}</div>
      <div class="acd-suggest-list">${items}</div>
    </div>`
    if (existing) {
      existing.outerHTML = html
    } else {
      // Direkt nach dem Message-Feld einsetzen
      const msgField = form.querySelector('[data-field="message"]')?.closest('.acd-field')
      if (msgField) {
        msgField.insertAdjacentHTML('afterend', html)
      } else {
        form.insertAdjacentHTML('beforeend', html)
      }
    }
  }

  private async handleFiles(files: File[], opts?: { imagesOnly?: boolean }) {
    const cfg = this.config
    for (const file of files) {
      if (this.state.files.length >= cfg.maxFiles) break
      if (file.size > cfg.maxFileSize * 1024 * 1024) continue
      if (opts?.imagesOnly) {
        // Bildschirmfotos: MIME-Check statt Endungs-Whitelist — der Betreiber hat
        // das Feature explizit aktiviert, auch wenn .png nicht in allowed-file-types steht.
        if (!file.type.startsWith('image/')) continue
      } else if (cfg.allowedFileTypes.length) {
        const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
        if (!cfg.allowedFileTypes.includes(ext)) continue
      }
      try {
        this.state.files = [...this.state.files, await readFile(file)]
      } catch {
        /* skip */
      }
    }
    this.render()
  }

  // Nimmt ein Bildschirmfoto über die Bildschirm-Freigabe des Browsers auf:
  // getDisplayMedia liefert einen Video-Stream der gewählten Quelle, davon wird
  // genau ein Frame in ein Canvas gezeichnet und als PNG an state.files angehängt.
  // Der Stream wird sofort danach beendet (kein dauerhaftes "teilt Bildschirm").
  private async captureScreenshot() {
    if (this.captureBusy) return
    this.captureBusy = true
    this.container.querySelector('[data-action="screenshot"]')?.setAttribute('aria-busy', 'true')
    const widgetEl = this.container.querySelector<HTMLElement>('.acd-widget')
    let stream: MediaStream | null = null
    try {
      const opts: ScreenCaptureOptions = {
        video: true,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
      }
      stream = await navigator.mediaDevices.getDisplayMedia(opts)

      // Erst NACH erfolgreicher Freigabe verstecken (Panel + Modal-Backdrop),
      // damit das Widget nicht selbst im Bild ist.
      if (widgetEl) widgetEl.style.visibility = 'hidden'

      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      await video.play()
      // Die Bildschirmaufnahme hinkt dem Bildschirm hinterher: die ersten Frames
      // zeigen das Panel oft noch. Zwei requestAnimationFrame reichten dafür
      // nicht (Meldung: das Kontaktfenster war mit auf dem Bild).
      await waitForFreshFrames(video)

      const width = video.videoWidth
      const height = video.videoHeight
      if (!width || !height) throw new Error('empty frame')
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('no canvas context')
      ctx.drawImage(video, 0, 0)

      // Stream sofort beenden und Panel zurückholen — noch bevor handleFiles()
      // per render() das DOM ersetzt (widgetEl wäre danach eine stale Referenz).
      video.pause()
      video.srcObject = null
      stream.getTracks().forEach((t) => t.stop())
      stream = null
      if (widgetEl) widgetEl.style.visibility = ''

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('toBlob failed')
      const file = new File(
        [blob],
        `${this.strings.screenshotFileName}-${++screenshotCounter}.png`,
        { type: 'image/png' },
      )

      const before = this.state.files.length
      await this.handleFiles([file], { imagesOnly: true })
      if (this.state.files.length === before) {
        // Von maxFiles/maxFileSize verworfen — sichtbares Feedback statt Stille.
        const msg =
          before >= this.config.maxFiles ? this.strings.errorMaxFiles : this.strings.errorFileSize
        this.state.errors = { ...this.state.errors, screenshot: msg }
        this.render()
      }
    } catch (err) {
      // Abbruch im Freigabe-Dialog (NotAllowedError) ist kein Fehler.
      if ((err as DOMException | null)?.name !== 'NotAllowedError') {
        this.state.errors = { ...this.state.errors, screenshot: this.strings.errorScreenshot }
        this.render()
      }
    } finally {
      stream?.getTracks().forEach((t) => t.stop())
      if (widgetEl) widgetEl.style.visibility = ''
      this.container.querySelector('[data-action="screenshot"]')?.removeAttribute('aria-busy')
      this.captureBusy = false
    }
  }

  private async handleSubmit() {
    // Validate
    const s = this.strings
    const st = this.state
    const errors: Record<string, string> = {}
    if (!st.email.trim()) errors.email = s.errorRequired
    else if (!EMAIL_RE.test(st.email.trim())) errors.email = s.errorEmail
    if (!st.name.trim()) errors.name = s.errorRequired
    if (this.config.showSubject && !st.subject.trim()) errors.subject = s.errorRequired
    if (!st.message.trim()) errors.message = s.errorRequired
    else if (st.message.trim().length < 10) errors.message = s.errorMinLength

    if (Object.keys(errors).length) {
      this.state = { ...st, errors }
      this.render()
      const firstField = Object.keys(errors)[0]
      this.root.querySelector<HTMLElement>(`[data-field="${firstField}"]`)?.focus()
      return
    }

    this.state = { ...st, view: 'loading', errors: {} }
    this.render()

    const payload: SubmitPayload = {
      email: st.email.trim(),
      name: st.name.trim(),
      subject: this.config.showSubject ? st.subject.trim() : '',
      message: st.message.trim(),
      attachments: st.files.map((f) => ({ fileName: f.name, mimeType: f.type, file: f.data })),
    }
    if (this.config.externalCustomerNr) {
      payload.external_customer_nr = this.config.externalCustomerNr
    }
    if (Object.keys(this.config.customFields).length > 0) {
      payload.custom_fields = this.config.customFields
    }

    try {
      const url = `${this.config.apiUrl.replace(/\/$/, '')}/v1/widget/ticket`
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.token}`,
        },
        body: JSON.stringify(payload),
      })
      const data: ApiResponse = await resp.json()

      if (resp.ok && data.success) {
        this.state = { ...this.state, view: 'success', ticketId: data.ticket_id ?? null }
      } else {
        this.state = {
          ...this.state,
          view: 'error',
          errorMessage: data.error || `HTTP ${resp.status}`,
        }
      }
    } catch (err) {
      this.state = {
        ...this.state,
        view: 'error',
        errorMessage: err instanceof Error ? err.message : 'Network error',
      }
    }

    this.render()
  }
}
