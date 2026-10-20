import { test } from 'node:test'
import assert from 'node:assert/strict'
import { acceptAttr, checkApiUrl, esc } from '../src/safety.ts'

test('api-url: https wird angenommen und normalisiert', () => {
  assert.equal(checkApiUrl('https://my.accountdesk.de/api'), 'https://my.accountdesk.de/api')
  assert.equal(checkApiUrl(' https://my.accountdesk.de/api/ '), 'https://my.accountdesk.de/api')
  assert.equal(checkApiUrl('HTTPS://Example.com:8443/x'), 'https://example.com:8443/x')
})

test('api-url: http nur für localhost und 127.0.0.1', () => {
  assert.equal(checkApiUrl('http://localhost:8080/api'), 'http://localhost:8080/api')
  assert.equal(checkApiUrl('http://127.0.0.1/api'), 'http://127.0.0.1/api')
  assert.equal(checkApiUrl('http://my.accountdesk.de/api'), null)
  assert.equal(checkApiUrl('http://localhost.example.com/api'), null)
  assert.equal(checkApiUrl('http://192.168.1.10/api'), null)
})

test('api-url: andere Schemata und Unsinn werden abgelehnt', () => {
  for (const bad of [
    'javascript:alert(1)',
    'data:text/plain,x',
    'ftp://example.com/api',
    'ws://localhost/api',
    '//evil.example',
    'kein url',
    '',
  ]) {
    assert.equal(checkApiUrl(bad), null, bad)
  }
})

test('api-url: Zugangsdaten in der Adresse werden abgelehnt', () => {
  assert.equal(checkApiUrl('https://user:pass@example.com/api'), null)
})

test('api-url: relative Angabe folgt dem Schema der Seite', () => {
  assert.equal(checkApiUrl('/api', 'https://shop.example/kontakt'), 'https://shop.example/api')
  assert.equal(checkApiUrl('/api', 'http://localhost:5180/'), 'http://localhost:5180/api')
  assert.equal(checkApiUrl('/api', 'http://shop.example/kontakt'), null)
  assert.equal(
    checkApiUrl('//evil.example/api', 'https://shop.example/'),
    'https://evil.example/api',
  )
})

test('allowed-file-types: Wert im accept-Attribut ist maskiert', () => {
  assert.equal(acceptAttr(['.pdf', '.png']), '.pdf,.png')
  const injected = acceptAttr(['.pdf"><img src=x onerror=alert(1)>'])
  assert.ok(!injected.includes('"'))
  assert.ok(!injected.includes('<'))
  assert.equal(injected, '.pdf&quot;&gt;&lt;img src=x onerror=alert(1)&gt;')
})

test('esc maskiert &, <, > und "', () => {
  assert.equal(esc(`a&b<c>"d"`), 'a&amp;b&lt;c&gt;&quot;d&quot;')
})
