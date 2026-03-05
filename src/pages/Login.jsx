// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db, googleProvider } from "../firebase";
import VPM from "../assets/vpm 1.webp";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import "../styles/reel-login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔐 EMAIL LOGIN
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists() && snap.data().role === "faculty") {
        navigate("/faculty");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  // 🔐 GOOGLE LOGIN
  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      // 🔹 First-time Google login → create user record
      if (!snap.exists()) {
        await setDoc(userRef, {
          full_name: user.displayName || "",
          email: user.email,
          role: "alumni",
          isVerified: false,
          createdAt: serverTimestamp(),
        });
        navigate("/dashboard");
        return;
      }

      // 🔹 Existing user → role-based redirect
      if (snap.data().role === "faculty") {
        navigate("/faculty");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="branding-bar" style={{ display: "flex", alignItems: "center", padding: "12px 20px" }}>
        <img
          src={VPM}
          alt="VPM Logo"
          style={{ width: 68, height: 68, objectFit: "contain", marginRight: 12 }}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: 20 }}>VPM Polytechnic</h1>
          <p style={{ margin: 0, fontSize: 12 }}>VPM Alumni Association</p>
        </div>
      </div>

      {/* ===== Navbar ===== */}
      <nav className="nav-bar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/dashboard">Alumni Directory</Link></li>

        </ul>
      </nav>


      <div className="reel-login-bg">
        <div className="reel-card">
          <h2 className="reel-title">VPM POLYTECHNIC</h2>
          <p className="reel-subtitle">Sign in to your account</p>

          {error && <div className="reel-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="reel-input-group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email address</label>
            </div>

            <div className="reel-input-group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
            </div>

            <button className="reel-btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* 🔹 GOOGLE BUTTON */}
          <button
            className="reel-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />
            Continue with Google
          </button>

          <p className="reel-footer">
            New here? <Link to="/signup">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}