import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const user = auth.currentUser;

      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      if (!requiredRole) {
        setAllowed(true);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();

      if (data?.role === requiredRole) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setLoading(false);
    }

    checkUser();
  }, [requiredRole]);

  if (loading) return <p>Checking access...</p>;

  if (!allowed) return <Navigate to="/login" replace />;

  return children;
}