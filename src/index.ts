import { AccountdeskWidget } from './widget'

if (!customElements.get('accountdesk-widget')) {
  customElements.define('accountdesk-widget', AccountdeskWidget)
}

export { AccountdeskWidget }
