import React, { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { initializeApp } from "firebase/app";
import './style.css';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Profile from "./pages/Profile";

// TODO: Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ...
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Auth Context for global user state ---
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sign up
  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  // Sign in
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // Sign in with Google
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

  // Logout
  const logout = () => signOut(auth);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  if (loading) return <div className="loading">Loading...</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Protected Route component ---
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
}

// --- Navbar ---
function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        RPS Flip
      </Link>

      {currentUser ? (
        <ul className="nav-links">
          <li>
            <Link to="/lobby">Lobby</Link>
          </li>
          <li>
            <Link to="/profile">{currentUser.email}</Link>
          </li>
          <li>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </li>
        </ul>
      ) : (
        <ul className="nav-links">
          <li>
            <Link to="/">Login / Signup</Link>
          </li>
        </ul>
      )}
    </nav>
  );
}

// --- Main App ---
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Protected Routes */}
              <Route
                path="/lobby"
                element={
                  <PrivateRoute>
                    <Lobby />
                  </PrivateRoute>
                }
              />
              <Route
                path="/game/:matchId"
                element={
                  <PrivateRoute>
                    <Game />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
