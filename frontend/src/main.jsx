import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode is intentionally omitted: its dev-mode double-invoke of effects
// is incompatible with browser MediaStream APIs (camera, WebRTC). Two
// concurrent ZXing readers on the same <video> element cause AbortError.
createRoot(document.getElementById('root')).render(<App />)
