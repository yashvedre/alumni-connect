import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function PrivacyDialog({ onClose }) {
  const [loading, setLoading] = useState(false);

  async function setVisibility(type) {
    setLoading(true);

    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      profileVisibility: type,
    });

    setLoading(false);
    onClose();
  }

  return (
    <div className="profile-modal-bg">
      <div className="profile-modal">
        <h3>Choose Your Profile Visibility</h3>

        <p>
          Is it okay to share your information with other alumni?
          Your old friends may reconnect with you.
        </p>

        <div style={{ marginTop: "15px" }}>
          <h4>Public Profile</h4>
          <p>
            Any verified alumni can see your profile and connect with you.
          </p>
          <button
            className="connect-btn"
            disabled={loading}
            onClick={() => setVisibility("public")}
          >
            Make Public
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h4>Private Profile</h4>
          <p>
            Only approved alumni can see your profile.
          </p>
          <button
            className="profile-close-btn"
            disabled={loading}
            onClick={() => setVisibility("private")}
          >
            Make Private
          </button>
        </div>
      </div>
    </div>
  );
}