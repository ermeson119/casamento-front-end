import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { RSVPForm } from './components/RSVPForm'
import { GiftList } from './components/GiftList'
import { AdminApp } from './components/AdminApp'

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <RSVPForm />
    </div>
  )
}

function GiftPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <GiftList />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/presentes" element={
          <>
            <GiftPage />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '16px',
                },
              }}
            />
          </>
        } />
        <Route path="/*" element={
          <>
            <AppContent />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '16px',
                },
              }}
            />
          </>
        } />
      </Routes>
    </Router>
  )
}

export default App