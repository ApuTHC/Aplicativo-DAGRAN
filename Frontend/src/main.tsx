import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MainRouter } from "./routers/MainRouter";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainRouter />
  </StrictMode>,
)
