import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App.jsx'

// ── Restore persisted appearance settings before first render ──────────────
const savedTheme = localStorage.getItem('theme') || 'dark';
const savedCompact = localStorage.getItem('compactMode') === 'true';
const savedFont = localStorage.getItem('fontSize') || 'medium';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const useDark = savedTheme === 'dark' || (savedTheme === 'auto' && prefersDark);
document.documentElement.classList.toggle('dark', useDark);
document.documentElement.classList.toggle('compact', savedCompact);
document.documentElement.setAttribute('data-font-size', savedFont);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

