import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './pages/UserDashboard';
import Home from './pages/Home';
import Navbar from './components/Navbar';

function App() {
  // Load user from localStorage on mount
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <>
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup onSignup={setUser} />} />
        <Route path="/dashboard" element={user ? <UserDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
