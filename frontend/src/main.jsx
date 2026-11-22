import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/tokens.css'
import './assets/css/components.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
