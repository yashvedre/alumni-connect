import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import "../styles/reel-login.css";

export default function Signup() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    batch: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        full_name: form.full_name,
        email: form.email,
        batch: Number(form.batch),
        role: "alumni",
        isVerified: false,
        alumniProfile: null,
        createdAt: serverTimestamp(),
      });

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reel-login-bg">
      <div className="reel-card">
        <h2 className="reel-title">VPM POLYTECHNIIC</h2>
        <p className="reel-subtitle">Create your alumni account</p>

        {error && <div className="reel-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="reel-input-group">
            <input
              name="full_name"
              required
              value={form.full_name}
              onChange={handleChange}
            />
            <label>Full name</label>
          </div>

          <div className="reel-input-group">
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
            />
            <label>Email address</label>
          </div>

          <div className="reel-input-group">
            <input
              type="number"
              name="batch"
              required
              value={form.batch}
              onChange={handleChange}
            />
            <label>Passing year</label>
          </div>

          <div className="reel-input-group">
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
            />
            <label>Password</label>
          </div>

          <div className="reel-input-group">
            <input
              type="password"
              name="confirmPassword"
              required
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <label>Confirm password</label>
          </div>

          <button className="reel-btn" disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        <p className="reel-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}