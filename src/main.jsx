import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import { config } from '@gluestack-ui/config'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GluestackUIProvider config={config}>
      <App />
    </GluestackUIProvider>
  </StrictMode>,
)
