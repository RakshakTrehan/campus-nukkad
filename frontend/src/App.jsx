import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthProvider, AuthContext } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import IssueDetail from './pages/IssueDetail'
import Report from './pages/Report'
import Admin from './pages/Admin'
import LostFound from './pages/LostFound'
import MessPulse from './pages/MessPulse'
import Login from './pages/Login'
import Signup from './pages/Signup'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useContext(AuthContext)
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/lost-found" element={<LostFound />} />
        <Route path="/mess-pulse" element={<MessPulse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
