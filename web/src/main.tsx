import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'

// Fonts are self-hosted (no external requests). A build with VITE_FONTS=google
// skips them and relies on a Google Fonts <link> in the host page instead.
if (import.meta.env.VITE_FONTS !== 'google') import('./fonts')
import { Shell } from './components/Layout'
import { FlagProvider } from './components/ui'
import { StoreProvider } from './lib/store'
import Home from './pages/Home'
import WhatsOn from './pages/WhatsOn'
import Checkout, { Confirmation } from './pages/Checkout'
import Learn from './pages/Learn'
import Venue from './pages/Venue'
import Friends from './pages/Friends'
import Support from './pages/Support'
import Impact from './pages/Impact'
import Press from './pages/Press'
import Community from './pages/Community'
import Privacy from './pages/Privacy'
import MyHillview from './pages/MyHillview'
import Console from './pages/console/Console'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <FlagProvider>
        <HashRouter>
          <ScrollTop />
          <Shell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/whats-on" element={<WhatsOn />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation/:ref" element={<Confirmation />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/venue" element={<Venue />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/support" element={<Support />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/press" element={<Press />} />
              <Route path="/community" element={<Community />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/me" element={<MyHillview />} />
              <Route path="/console" element={<Console />} />
              <Route path="/console/:tab" element={<Console />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Shell>
        </HashRouter>
      </FlagProvider>
    </StoreProvider>
  </StrictMode>,
)
