import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { secondaryAuth, db } from "../firebase";
import "./faculty.css";

export default function AddFaculty({ currentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    setMsg("");

    if (!currentUser?.isMaster) {
      setMsg("❌ Only master faculty can add new faculty");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role: "faculty",
        isMaster: false,
        createdAt: serverTimestamp(),
      });

      setMsg("✅ Faculty added successfully");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMsg("❌ " + err.message);
    }
  }

  return (
  <div className="faculty-card">
  <h3>Add Faculty (Master only)</h3>
  <p className="faculty-subtext">
    Create login access for new faculty members
  </p>

  <form onSubmit={handleAdd} className="faculty-form">
    <input
      type="email"
      placeholder="Faculty email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <input
      type="password"
      placeholder="Temporary password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <button className="faculty-btn">Add Faculty</button>
  </form>

  {msg && <div className="faculty-msg">{msg}</div>}
</div>

  );
}