import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import "../styles/auth.css";

export default function AlumniDetailsForm({ currentUser, onCompleted }) {
  const existing = currentUser.alumniProfile || {};

  const [form, setForm] = useState({
    gender: existing.gender || "",
    currentCity: existing.currentCity || "",
    company: existing.company || "",
    jobTitle: existing.jobTitle || "",
    phone: existing.phone || "",
    address: existing.address || "",
    photoUrl: existing.photoUrl || "",
    linkedinUrl: existing.linkedinUrl || "",

    // ✅ NEW FIELDS
    education: existing.education || "",
    experience: existing.experience || "",
    technologies: existing.technologies || "",
    skills: existing.skills || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        alumniProfile: { ...form },
      });

      if (onCompleted) {
        onCompleted({ ...currentUser, alumniProfile: form });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* LEFT SIDE SAME */}
        <div className="auth-hero">
          <h1 className="auth-title">Complete your alumni profile</h1>
          <p className="auth-subtitle">
            Add your education, skills and career details.
          </p>
        </div>

        {/* RIGHT FORM */}
        <div className="auth-form-wrapper">
          <div className="auth-card">

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-field" onSubmit={handleSubmit}>

              {/* OLD FIELDS */}
              <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} />
              <input name="currentCity" placeholder="City" value={form.currentCity} onChange={handleChange} />
              <input name="company" placeholder="Company" value={form.company} onChange={handleChange} />
              <input name="jobTitle" placeholder="Job Title" value={form.jobTitle} onChange={handleChange} />
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
              <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} />

              {/* ✅ NEW FIELDS (same UI style) */}
              <input name="education" placeholder="Education (Diploma/Degree/B.Tech)" value={form.education} onChange={handleChange} />
              <input name="experience" placeholder="Experience (e.g. 3 years)" value={form.experience} onChange={handleChange} />
              <input name="technologies" placeholder="Technologies (Java, React, Python)" value={form.technologies} onChange={handleChange} />
              <input name="skills" placeholder="Skills (Communication, Teamwork, etc)" value={form.skills} onChange={handleChange} />

              <input name="photoUrl" placeholder="Photo URL" value={form.photoUrl} onChange={handleChange} />
              <input name="linkedinUrl" placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={handleChange} />

              <button disabled={saving}>
                {saving ? "Saving..." : "Save Details"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
