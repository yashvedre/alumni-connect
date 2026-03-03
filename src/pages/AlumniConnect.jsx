import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/alumni-connect.css";

export default function AlumniConnect() {
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentVisibility, setCurrentVisibility] = useState("");

  const [showPrivateDialog, setShowPrivateDialog] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    initialize();
  }, []);

  async function initialize() {
    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    const data = snap.data();

    if (!data?.profileVisibility) {
      setShowPrivacyDialog(true);
    } else {
      setCurrentVisibility(data.profileVisibility);
      loadAlumni();
      loadRequests();
    }
  }

  /* ================= SET VISIBILITY ================= */
  async function setVisibility(type) {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      profileVisibility: type.toLowerCase(),
    });

    setCurrentVisibility(type.toLowerCase());
    setShowPrivacyDialog(false);
    setShowSettings(false);
  }

  /* ================= LOAD ALUMNI WITH DEPARTMENT ================= */
  async function loadAlumni() {
    const q = query(
      collection(db, "users"),
      where("role", "==", "alumni"),
      where("isVerified", "==", true)
    );

    const snap = await getDocs(q);

    const list = await Promise.all(
      snap.docs.map(async (d) => {
        const userData = d.data();
        let department = "";

        if (userData.studentRecordId) {
          try {
            const studentSnap = await getDoc(
              doc(db, "students", userData.studentRecordId)
            );
            if (studentSnap.exists()) {
              department = studentSnap.data().department || "";
            }
          } catch (err) {
            console.error("Department fetch error:", err);
          }
        }

        return {
          id: d.id,
          ...userData,
          department,
        };
      })
    );

    setAlumni(list);
    setFiltered(list);
    setLoading(false);
  }

  /* ================= LOAD REQUESTS ================= */
  async function loadRequests() {
    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    const pending = snap.data()?.pendingRequests || [];

    const enriched = await Promise.all(
      pending.map(async (req) => {
        const userSnap = await getDoc(doc(db, "users", req.from));
        return {
          ...req,
          name: userSnap.data()?.full_name || "Alumni",
        };
      })
    );

    setRequests(enriched);
  }

  /* ================= SEARCH + DEPARTMENT FILTER ================= */
  useEffect(() => {
    const t = search.toLowerCase();

    setFiltered(
      alumni.filter((a) => {
        const matchName =
          (a.full_name || "").toLowerCase().includes(t);

        const matchDept =
          selectedDept === "All"
            ? true
            : a.department === selectedDept;

        return matchName && matchDept;
      })
    );
  }, [search, alumni, selectedDept]);

  const departments = [
    "All",
    ...new Set(alumni.map((a) => a.department).filter(Boolean)),
  ];

  /* ================= VIEW PROFILE ================= */
  function handleView(alumniUser) {
    const currentUid = auth.currentUser.uid;
    const visibility =
      (alumniUser.profileVisibility || "public").toLowerCase();

    const isConnected =
      alumniUser.connections &&
      alumniUser.connections.includes(currentUid);

    if (visibility === "public" || isConnected) {
      navigate(`/alumni/${alumniUser.id}`);
    } else {
      setTargetUser(alumniUser);
      setShowPrivateDialog(true);
    }
  }

  /* ================= SEND PRIVATE REQUEST ================= */
  async function sendRequest() {
    await updateDoc(doc(db, "users", targetUser.id), {
      pendingRequests: arrayUnion({
        from: auth.currentUser.uid,
        createdAt: new Date(),
      }),
    });

    setShowPrivateDialog(false);
  }

  /* ================= ACCEPT REQUEST ================= */
  async function acceptRequest(uid) {
    const myRef = doc(db, "users", auth.currentUser.uid);
    const otherRef = doc(db, "users", uid);

    await updateDoc(myRef, {
      connections: arrayUnion(uid),
    });

    await updateDoc(otherRef, {
      connections: arrayUnion(auth.currentUser.uid),
    });

    const updated = requests.filter((r) => r.from !== uid);

    await updateDoc(myRef, {
      pendingRequests: updated,
    });

    setRequests(updated);
  }

  return (
    <div className="connect-page">
      <div className="connect-container">

        {/* HEADER */}
        <div className="connect-header">
          <div>
            <h2 className="connect-title">Alumni Connect</h2>
            <p className="connect-subtitle">
              Discover alumni by department & connect professionally
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="notification-btn"
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
            >
              🔔 {requests.length > 0 && `(${requests.length})`}
            </button>

            <button
              className="notification-btn"
              onClick={() => setShowSettings(true)}
            >
              ⚙
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {showNotifications && (
          <div className="notification-panel">
            <h4>Connection Requests</h4>
            {requests.length === 0 && <p>No requests</p>}
            {requests.map((req, i) => (
              <div key={i} className="request-card">
                <p>
                  <strong>{req.name}</strong> wants to connect
                </p>
                <button onClick={() => acceptRequest(req.from)}>
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FILTER BAR */}
        <div className="filter-bar">
          <input
            placeholder="Search alumni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {loading && <p>Loading alumni...</p>}

        {/* GRID */}
        <div className="connect-list">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="connect-card"
              onClick={() => handleView(a)}
            >
              <div className="avatar">
                {a.full_name?.slice(0, 2).toUpperCase()}
              </div>

              <div className="connect-name">
                {a.full_name}
              </div>

              <div className="connect-company">
                {a.alumniProfile?.company || "Alumni"}
              </div>

              <div className="dept-tag">
                {a.department || "Department"}
              </div>

              <div style={{ marginTop: 8 }}>
                <span
                  className={
                    a.profileVisibility === "private"
                      ? "status-private"
                      : "status-public"
                  }
                >
                  {a.profileVisibility || "public"}
                </span>
              </div>

              <button className="connect-btn">
                View Dashboard
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PRIVATE PROFILE DIALOG */}
      {showPrivateDialog && (
        <div className="profile-modal-bg">
          <div className="profile-modal">
            <h3>Private Profile</h3>
            <p>
              This alumni requires approval before viewing
              their dashboard.
            </p>
            <button className="connect-btn" onClick={sendRequest}>
              Send Request
            </button>
            <button
              className="profile-close-btn"
              onClick={() => setShowPrivateDialog(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FIRST TIME PRIVACY DIALOG */}
      {showPrivacyDialog && (
        <div className="profile-modal-bg">
          <div className="profile-modal">
            <h3>Select Profile Visibility</h3>
            <p>
              Choose how other alumni can access your profile.
            </p>
            <button
              className="connect-btn"
              onClick={() => setVisibility("public")}
            >
              🌐 Public
            </button>
            <button
              className="profile-close-btn"
              onClick={() => setVisibility("private")}
            >
              🔒 Private
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS DIALOG */}
      {showSettings && (
        <div className="profile-modal-bg">
          <div className="profile-modal">
            <h3>Profile Settings</h3>
            <p>
              Current visibility:{" "}
              <strong>{currentVisibility}</strong>
            </p>
            <button
              className="connect-btn"
              onClick={() => setVisibility("public")}
            >
              Make Public
            </button>
            <button
              className="profile-close-btn"
              onClick={() => setVisibility("private")}
            >
              Make Private
            </button>
            <button
              className="profile-close-btn"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}