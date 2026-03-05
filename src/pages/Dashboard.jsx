import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import VerificationForm from "../components/VerificationForm";
import AlumniDetailsForm from "../components/AlumniDetailsForm";
import AlumniDashboard from "../components/AlumniDashboard";

export default function Dashboard() {
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        
        if (!snap.exists()) {
          await setDoc(ref, {
            full_name: user.displayName || "",
            email: user.email || "",
            role: "alumni",
            isVerified: false,
            alumniProfile: null,
            createdAt: serverTimestamp(),
          });

          const newSnap = await getDoc(ref);
          setUserDoc({ id: newSnap.id, ...newSnap.data() });
        } else {
          setUserDoc({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!userDoc) return <div style={{ padding: 24 }}>Unable to load user.</div>;

  if (!userDoc.isVerified) {
    return <VerificationForm currentUser={userDoc} onVerified={setUserDoc} />;
  }

  if (!userDoc.alumniProfile) {
    return (
      <AlumniDetailsForm
        currentUser={userDoc}
        onCompleted={(updated) => setUserDoc(updated)}
      />
    );
  }

  return <AlumniDashboard currentUser={userDoc} />;
}