import React from 'react'
import { createRoot } from 'react-dom/client'
import ReadabilityFRApp from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReadabilityFRApp />
  </React.StrictMode>
)
