import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import { useEffect } from 'react'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

function App() {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(API_URL)
    setSocket(newSocket)

    return () => newSocket.close()
  }, [])

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path = "/login" element={<Login/>} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

export default App
