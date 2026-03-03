
import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import "../styles/auth.css";

export default function VerificationForm({ currentUser, onVerified }) {
  const [form, setForm] = useState({
    full_name: currentUser.full_name || "",
    department: "",
    passingYear: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const studentsRef = collection(db, "students");

      const q = query(
        studentsRef,
        where("full_name", "==", form.full_name.trim()),
        where("department", "==", form.department),
        where("passingYear", "==", Number(form.passingYear))
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setError(
          "Details do not match college records. Please check name, department and passing year."
        );
        setLoading(false);
        return;
      }

      const studentDoc = snap.docs[0];
      if (!studentDoc) {
        setError("No matching student record found.");
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        isVerified: true,
        verifiedAt: serverTimestamp(),
        studentRecordId: studentDoc.id,
      });

      const updatedUser = {
        ...currentUser,
        isVerified: true,
        studentRecordId: studentDoc.id,
      };

      onVerified(updatedUser);
    } catch (err) {
      console.error("Verification error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        <div className="auth-hero">
          <div>
            <div className="auth-logo">
              <div className="auth-logo-badge">V</div>
              <div className="auth-logo-text">VPM POLYTECHNIC</div>
            </div>
            <h1 className="auth-title">Steps to verify your record</h1>
            <p className="auth-subtitle">
              Fill this form using the same details that appear in your college
              records.
            </p>

            <ol
              style={{
                marginTop: 12,
                paddingLeft: 20,
                fontSize: 14,
                color: "#e5e7eb",
                lineHeight: 1.6,
              }}
            >
              <li>
                Check that your <strong>full name</strong> matches your mark
                sheet.
              </li>
              <li>
                Select the correct <strong>department</strong> (CO, IF, IE,
                etc.).
              </li>
              <li>
                Enter your final <strong>passing year</strong> (e.g. 2022,
                2023, 2024).
              </li>
              <li>Click on <strong>Verify and continue</strong>.</li>
              <li>
                If details are correct, you will move to the alumni profile
                form.
              </li>
            </ol>

            <p
              style={{
                marginTop: 16,
                fontSize: 12,
                color: "#cbd5f5",
              }}
            >
              If verification fails, re-check spelling of your name and passing
              year. For issues, contact the department or admin.
            </p>
          </div>

          <p className="auth-footer-text">
            This is a one-time step to confirm you studied at the college.
          </p>
        </div>

        
        <div className="auth-form-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-heading">Student verification</h2>
              <p className="auth-caption">
                Enter the same details as present in your final mark sheet.
              </p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Full name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">👤</span>
                  <input
                    name="full_name"
                    className="auth-input"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Department</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🏫</span>
                  <select
                    name="department"
                    className="auth-input"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select department</option>
                    <option value="CO">Computer (CO)</option>
                    <option value="IF">Information Tech (IF)</option>
                    <option value="IE">Industrial (IE)</option>
                    <option value="ME">Mechanical (ME)</option>
                    <option value="CE">Civil (CE)</option>
                  </select>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Passing year</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🎓</span>
                  <input
                    type="number"
                    name="passingYear"
                    className="auth-input"
                    placeholder="e.g. 2024"
                    value={form.passingYear}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify and continue"}
              </button>
            </form>

            <p className="auth-bottom-hint">
              Once verified, you can complete your alumni details and access
              your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
