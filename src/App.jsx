import "./App.css";
import ImageCarousel from "./components/ImageCarousel";
import convocationImg from "./assets/vpm-convocation-2.jpg";
import VPM from "./assets/vpm 1.webp";

import FacultyDashboard from "./pages/FacultyDashboard";
import AddFaculty from "./pages/AddFaculty";
import AboutUs from "./pages/AboutUs.jsx";
import AlumniConnect from "./pages/AlumniConnect";
import AlumniDashboard from "./components/AlumniDashboard";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";

import { Routes, Route, Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

import "./styles/auth.css";


function Home() {
  return (
    <div>
      {/* Branding */}
      <div
        className="branding-bar"
        style={{ display: "flex", alignItems: "center", padding: "12px 20px" }}
      >
        <img
          src={VPM}
          alt="VPM Logo"
          style={{
            width: 68,
            height: 68,
            objectFit: "contain",
            marginRight: 12,
          }}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: 20 }}>VPM Polytechnic</h1>
          <p style={{ margin: 0, fontSize: 12 }}>VPM Alumni Association</p>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link to="/login" className="auth-btn">
            Login
          </Link>
          <Link to="/signup" className="auth-btn signup">
            Signup
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-bar">
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            gap: 18,
          }}
        >
          <li>
            <Link style={{ textDecoration: "none" }} to="/">
              Home
            </Link>
          </li>
          <li>
            <Link style={{ textDecoration: "none" }} to="/About">
              About Us
            </Link>
          </li>
          <li>
            <Link style={{ textDecoration: "none" }} to="/dashboard">
              Alumni Directory
            </Link>
          </li>
          <li>
            <Link style={{ textDecoration: "none" }} to="/connect">
              Alumni Connect
            </Link>
          </li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-image-wrap">
            <img
              src={convocationImg}
              alt="Convocation"
              className="hero-image"
            />
            <div className="hero-overlay">
              <h2>Alumni Association</h2>
              <p>students, building the future together.</p>
              <Link to="/login" className="btn">
                WELCOME
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <div style={{ margin: "20px" }}>
        <h3>Highlights</h3>
        <ImageCarousel />
      </div>
    </div>
  );
}

/* ================= DASHBOARD WRAPPER ================= */
/* This fixes same profile showing everywhere */
function AlumniDashboardWrapper({ user }) {
  const { id } = useParams();
  return <AlumniDashboard key={id} currentUser={user} />;
}

/* ================= MAIN APP ================= */
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setUser({ id: u.uid, ...snap.data() });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/faculty" element={<FacultyDashboard />} />
      <Route path="/add-faculty" element={<AddFaculty />} />
      <Route path="/About" element={<AboutUs />} />
      <Route path="/connect" element={<AlumniConnect />} />

      {/* 🔥 THIS FIXES MULTIPLE PROFILE ISSUE */}
      <Route
        path="/alumni/:id"
        element={<AlumniDashboardWrapper user={user} />}
      />
    </Routes>
  );
}