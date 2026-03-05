import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function AlumniProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "users", id));
      if (snap.exists()) {
        setUser(snap.data());
      }
    }
    load();
  }, [id]);

  if (!user) return <div style={{ padding: 40 }}>Loading...</div>;

  const p = user.alumniProfile || {};

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1>{user.full_name}</h1>
      <div style={{ marginTop: 20 }}>
        <p><strong>Company:</strong> {p.company || "-"}</p>
        <p><strong>Job Title:</strong> {p.jobTitle || "-"}</p>
        <p><strong>Experience:</strong> {p.workExperience || "-"}</p>
        <p><strong>City:</strong> {p.currentCity || "-"}</p>
        <p><strong>Phone:</strong> {p.phone || "-"}</p>
      </div>
    </div>
  );
}