import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initScrollReveal } from './utils/scrollReveal'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Start scroll-reveal observer after first render
requestAnimationFrame(() => initScrollReveal())
