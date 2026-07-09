// CSS via ?inline importieren: Vite verarbeitet + minifiziert die Datei und
// liefert das Ergebnis als String (für die Shadow-DOM-Injection).
declare module '*.css?inline' {
  const css: string
  export default css
}
