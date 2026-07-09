export interface WidgetConfig {
  token: string
  apiUrl: string
  language: string
  primaryColor: string
  primaryColorHover: string
  position: 'bottom-right' | 'bottom-left'
  mode: 'floating' | 'inline' | 'modal'
  buttonText: string
  title: string
  showSubject: boolean
  showAttachments: boolean
  showHeader: boolean
  showEmail: boolean
  showName: boolean
  maxFileSize: number
  maxFiles: number
  allowedFileTypes: string[]
  zIndex: number
  offsetX: string
  offsetY: string
  suggestArticles: boolean
  screenshot: boolean
  prefillEmail: string
  prefillName: string
  externalCustomerNr: string
  customFields: Record<string, string>
}

export type WidgetView = 'button' | 'form' | 'loading' | 'success' | 'error' | 'hidden'

export interface WidgetState {
  view: WidgetView
  email: string
  name: string
  subject: string
  message: string
  files: WidgetFile[]
  errors: Record<string, string>
  ticketId: number | null
  errorMessage: string
  suggestResults: SuggestResult[]
  suggestRequestId: number
  suggestDebounceTimer: number | null
}

export interface SuggestResult {
  repo_name: string
  path: string
  snippet: string
  score: number
  url: string
}

export interface SuggestResponse {
  suggest_aa: SuggestResult[]
}

export interface WidgetFile {
  id: string
  name: string
  size: number
  type: string
  data: string // base64
}

export interface SubmitPayload {
  email: string
  name: string
  subject: string
  message: string
  attachments: {
    fileName: string
    mimeType: string
    file: string // base64 without data-uri prefix
  }[]
  external_customer_nr?: string
  custom_fields?: Record<string, string>
}

export interface ApiResponse {
  success: boolean
  ticket_id?: number
  error?: string
}

export interface I18nStrings {
  buttonText: string
  title: string
  labelEmail: string
  labelName: string
  labelSubject: string
  labelMessage: string
  labelAttachments: string
  placeholderEmail: string
  placeholderName: string
  placeholderSubject: string
  placeholderMessage: string
  submit: string
  cancel: string
  sending: string
  successTitle: string
  successMessage: string
  errorTitle: string
  errorRetry: string
  close: string
  newMessage: string
  dragDrop: string
  dragDropOr: string
  browse: string
  remove: string
  errorRequired: string
  errorEmail: string
  errorMinLength: string
  errorFileSize: string
  errorFileType: string
  errorMaxFiles: string
  errorTotalSize: string
  suggestHeader: string
  screenshotCapture: string
  screenshotFileName: string
  errorScreenshot: string
}
