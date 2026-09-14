import '@testing-library/jest-dom'

Object.defineProperties(window.HTMLMediaElement.prototype, {
  play: { configurable: true, value: () => Promise.resolve() },
  pause: { configurable: true, value: () => undefined },
})
