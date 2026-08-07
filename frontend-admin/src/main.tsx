import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { installButtonRipple } from '@/shared/ui/button-ripple'
import './styles/global.css'

installButtonRipple()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
