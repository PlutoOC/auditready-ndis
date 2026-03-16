import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
// Deploy trigger: Mon Mar 16 09:34:28 UTC 2026
// Force deploy: Mon Mar 16 10:13:48 UTC 2026
// Deploy trigger: Mon Mar 16 17:32:50 UTC 2026
