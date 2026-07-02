import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Timeline from './pages/Timeline'
import Catering from './pages/Catering'
import Suggestions from './pages/Suggestions'
import Tasks from './pages/Tasks'
import Gallery from './pages/Gallery'
import './index.css'

// HashRouter → works on GitHub Pages with zero server config.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="catering" element={<Catering />} />
            <Route path="suggestions" element={<Suggestions />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="gallery" element={<Gallery />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>,
)
