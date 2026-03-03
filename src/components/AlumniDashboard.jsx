import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import VPM from "../assets/vpm 1.webp";

export default function AlumniDashboard({ currentUser }) {
  const navigate = useNavigate();
  const { id } = useParams(); // route param

  const [studentData, setStudentData] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [savingLinks, setSavingLinks] = useState(false);

  const [linksForm, setLinksForm] = useState({
    photoUrl: "",
    linkedinUrl: "",
  });

  const isOwnProfile = !id || id === auth.currentUser?.uid;

  /* ================= FIXED USER LOAD (ONLY CHANGE) ================= */
  useEffect(() => {
    async function loadUser() {
      if (!currentUser) return;

     
      if (!id) {
        setViewUser(currentUser);
        setLinksForm({
          photoUrl: currentUser?.alumniProfile?.photoUrl || "",
          linkedinUrl: currentUser?.alumniProfile?.linkedinUrl || "",
        });
        return;
      }

      
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) {
          const data = snap.data();
          setViewUser(data);
          setLinksForm({
            photoUrl: data.alumniProfile?.photoUrl || "",
            linkedinUrl: data.alumniProfile?.linkedinUrl || "",
          });
        }
      } catch (err) {
        console.error("Failed to load alumni:", err);
      }
    }

    loadUser();
  }, [id, currentUser]);

  /* ================= LOAD STUDENT RECORD ================= */
  useEffect(() => {
    async function fetchStudent() {
      if (!viewUser?.studentRecordId) return;

      try {
        const ref = doc(db, "students", viewUser.studentRecordId);
        const snap = await getDoc(ref);
        if (snap.exists()) setStudentData(snap.data());
      } catch (err) {
        console.error("Failed to load student record:", err);
      }
    }

    fetchStudent();
  }, [viewUser?.studentRecordId]);

  if (!viewUser) return null;

  const alumni = viewUser.alumniProfile || {};

  function handleLinksChange(e) {
    setLinksForm({ ...linksForm, [e.target.name]: e.target.value });
  }

  async function handleSaveLinks(e) {
    e.preventDefault();
    if (!isOwnProfile) return;

    setSavingLinks(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        alumniProfile: {
          ...alumni,
          photoUrl: linksForm.photoUrl,
          linkedinUrl: linksForm.linkedinUrl,
        },
      });
      alert("Profile links updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile links");
    } finally {
      setSavingLinks(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  function handleBackHome() {
    navigate("/");
  }

  const initials = (viewUser.full_name || "A")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "16px 12px 32px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        {/* HEADER */}
        <header
          style={{
            backgroundColor: "#003366",
            color: "#ffffff",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={VPM}
              alt="VPM Logo"
              style={{
                width: 50,
                height: 50,
                objectFit: "contain",
                borderRadius: 6,
                backgroundColor: "#ffffff",
                padding: 4,
              }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                Vidya Prasarak Mandal Polytechnic
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                Alumni Portal
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleBackHome}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid #ffffff",
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                ← Back to Home
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#1a73e8",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </header>

        
        <section
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            padding: 16,
            marginBottom: 18,
            border: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #1a73e8",
                backgroundColor: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {linksForm.photoUrl ? (
                <img
                  src={linksForm.photoUrl}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {initials}
                </span>
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  marginBottom: 2,
                }}
              >
                Logged in as
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {viewUser.full_name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#374151",
                  marginTop: 2,
                }}
              >
                {alumni.jobTitle || "Alumni"}
                {alumni.company ? ` · ${alumni.company}` : ""}
              </div>
              {alumni.currentCity && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginTop: 2,
                  }}
                >
                  📍 {alumni.currentCity}
                </div>
              )}
            </div>
          </div>

          
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 6,
              fontSize: 12,
            }}
          >
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid #16a34a",
                backgroundColor: "#dcfce7",
                color: "#14532d",
                fontWeight: 500,
              }}
            >
              ✅ Verified Alumni
            </span>
            {studentData && (
              <>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    backgroundColor: "#e0f2fe",
                    color: "#1d4ed8",
                  }}
                >
                  🎓 Batch {studentData.passingYear}
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    backgroundColor: "#eef2ff",
                    color: "#4338ca",
                  }}
                >
                  🏫 Dept {studentData.department}
                </span>
              </>
            )}
          </div>
        </section>

        
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: 16,
          }}
        >
          
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: 14,
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 15,
                  color: "#111827",
                }}
              >
                Profile summary
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
                <strong>Email:</strong> {viewUser.email}
              </p>
              {alumni.phone && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#374151" }}>
                  <strong>Phone:</strong> {alumni.phone}
                </p>
              )}
              {alumni.address && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#374151" }}>
                  <strong>Address:</strong> {alumni.address}
                </p>
              )}
            </div>

            
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: 14,
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 15,
                  color: "#111827",
                }}
              >
                Online presence
              </h3>

              {linksForm.linkedinUrl && (
                <a
                  href={linksForm.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    marginBottom: 8,
                    fontSize: 13,
                    color: "#1a73e8",
                    textDecoration: "none",
                  }}
                >
                  Open LinkedIn profile ↗
                </a>
              )}

              <form
                onSubmit={handleSaveLinks}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 3,
                      color: "#374151",
                    }}
                  >
                    Profile photo URL
                  </label>
                  <input
                    name="photoUrl"
                    value={linksForm.photoUrl}
                    onChange={handleLinksChange}
                    placeholder="https://..."
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 12,
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 3,
                      color: "#374151",
                    }}
                  >
                    LinkedIn profile URL
                  </label>
                  <input
                    name="linkedinUrl"
                    value={linksForm.linkedinUrl}
                    onChange={handleLinksChange}
                    placeholder="https://linkedin.com/in/username"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 12,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingLinks}
                  style={{
                    marginTop: 6,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: savingLinks ? "#9ca3af" : "#1a73e8",
                    color: "#ffffff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: savingLinks ? "default" : "pointer",
                    alignSelf: "flex-start",
                  }}
                >
                  {savingLinks ? "Saving..." : "Save links"}
                </button>
              </form>
            </div>
          </div>

          
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: 14,
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 15,
                  color: "#111827",
                }}
              >
                Professional details
              </h3>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
                <p>
                  <strong>Company:</strong> {alumni.company || "-"}
                </p>
                <p>
                  <strong>Role:</strong> {alumni.jobTitle || "-"}
                </p>
                <p>
                  <strong>Location:</strong> {alumni.currentCity || "-"}
                </p>
                <p>
                  <strong>Gender:</strong> {alumni.gender || "-"}
                </p>
              </div>
            </div>

            {/* College record */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: 14,
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 15,
                  color: "#111827",
                }}
              >
                College record
              </h3>
              {studentData ? (
                <div
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    lineHeight: 1.5,
                  }}
                >
                  <p>
                    <strong>Department:</strong> {studentData.department}
                  </p>
                  <p>
                    <strong>Passing year:</strong> {studentData.passingYear}
                  </p>
                  <p>
                    <strong>Class:</strong> {studentData.className}
                  </p>
                  <p>
                    <strong>Percentage:</strong> {studentData.percentage}%
                  </p>
                  <p>
                    <strong>Roll no:</strong> {studentData.rollNo}
                  </p>
                  <p>
                    <strong>Enrollment no:</strong>{" "}
                    {studentData.enrollmentNo}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  College record not found or not linked.
                </p>
              )}
            </div>

            {/* Next steps */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: 14,
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "0 0 6px",
                  fontSize: 15,
                  color: "#111827",
                }}
              >
                Next steps
              </h3>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                • Later you can show upcoming alumni events and campus news
                here. <br />
                • You can also extend this page with alumni directory, job
                postings or messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
