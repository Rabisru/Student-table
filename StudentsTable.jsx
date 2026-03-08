import { useState, useEffect, useRef } from "react";

const INITIAL_STUDENTS = [
  { id: 1, name: "Aria Chen", email: "aria.chen@university.edu", age: 21 },
  { id: 2, name: "Marcus Webb", email: "m.webb@university.edu", age: 23 },
  { id: 3, name: "Siona Patel", email: "siona.p@university.edu", age: 20 },
  { id: 4, name: "Declan Ross", email: "d.ross@university.edu", age: 22 },
  { id: 5, name: "Yuki Tanaka", email: "y.tanaka@university.edu", age: 24 },
];

let nextId = 6;

function validateForm({ name, email, age }) {
  const errors = {};
  if (!name.trim()) errors.name = "Name is required";
  else if (name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
  if (!age) errors.age = "Age is required";
  else if (isNaN(age) || Number(age) < 16 || Number(age) > 100) errors.age = "Age must be between 16 and 100";
  return errors;
}

function exportToCSV(students) {
  const header = ["Name", "Email", "Age"];
  const rows = students.map(s => [s.name, s.email, s.age]);
  const csvContent = [header, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Modal({ children, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(8, 6, 18, 0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.18s ease"
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "linear-gradient(145deg, #13102a 0%, #0e0c22 100%)",
        border: "1px solid rgba(139,92,246,0.35)",
        borderRadius: "20px", padding: "40px", minWidth: "420px",
        boxShadow: "0 30px 80px rgba(139,92,246,0.2), 0 0 0 1px rgba(255,255,255,0.04)",
        animation: "slideUp 0.22s cubic-bezier(0.16,1,0.3,1)"
      }}>
        {children}
      </div>
    </div>
  );
}

function StudentForm({ initial, onSubmit, onCancel, isEdit }) {
  const [form, setForm] = useState(initial || { name: "", email: "", age: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const nameRef = useRef();

  useEffect(() => { nameRef.current?.focus(); }, []);

  const handle = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (touched[field]) {
      const errs = validateForm({ ...form, [field]: value });
      setErrors(errs);
    }
  };

  const blur = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    const errs = validateForm(form);
    setErrors(errs);
  };

  const submit = () => {
    setTouched({ name: true, email: true, age: true });
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit(form);
  };

  const inputStyle = (field) => ({
    width: "100%", padding: "12px 16px", borderRadius: "10px",
    border: `1.5px solid ${errors[field] && touched[field] ? "#f87171" : "rgba(139,92,246,0.3)"}`,
    background: "rgba(255,255,255,0.04)", color: "#e2d9f3",
    fontSize: "15px", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border-color 0.2s",
  });

  return (
    <>
      <h2 style={{ margin: "0 0 28px", color: "#e2d9f3", fontSize: "22px", fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>
        {isEdit ? "✦ Edit Student" : "✦ New Student"}
      </h2>
      {["name", "email", "age"].map(field => (
        <div key={field} style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "6px", color: "#a78bfa", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {field}
          </label>
          <input
            ref={field === "name" ? nameRef : null}
            type={field === "age" ? "number" : field === "email" ? "email" : "text"}
            value={form[field]}
            onChange={e => handle(field, e.target.value)}
            onBlur={() => blur(field)}
            placeholder={field === "name" ? "Full name" : field === "email" ? "email@domain.com" : "Age"}
            style={inputStyle(field)}
          />
          {errors[field] && touched[field] && (
            <div style={{ color: "#f87171", fontSize: "12px", marginTop: "5px" }}>⚠ {errors[field]}</div>
          )}
        </div>
      ))}
      <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
        <button onClick={submit} style={{
          flex: 1, padding: "13px", borderRadius: "10px", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff",
          fontWeight: 700, fontSize: "15px", fontFamily: "inherit",
          boxShadow: "0 4px 20px rgba(139,92,246,0.4)", transition: "transform 0.15s, box-shadow 0.15s"
        }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 28px rgba(139,92,246,0.55)"; }}
          onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = "0 4px 20px rgba(139,92,246,0.4)"; }}
        >
          {isEdit ? "Save Changes" : "Add Student"}
        </button>
        <button onClick={onCancel} style={{
          padding: "13px 20px", borderRadius: "10px", cursor: "pointer",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#a78bfa", fontWeight: 600, fontSize: "15px", fontFamily: "inherit",
          transition: "background 0.15s"
        }}
          onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.06)"}
        >Cancel</button>
      </div>
    </>
  );
}

function DeleteDialog({ student, onConfirm, onCancel }) {
  return (
    <>
      <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h2 style={{ color: "#f87171", margin: "0 0 10px", fontFamily: "'DM Serif Display', serif", fontSize: "22px" }}>Delete Student</h2>
        <p style={{ color: "#c4b5fd", margin: "0 0 6px", fontSize: "15px" }}>Are you sure you want to remove</p>
        <p style={{ color: "#e2d9f3", margin: 0, fontWeight: 700, fontSize: "17px" }}>{student.name}?</p>
        <p style={{ color: "#7c6fa0", fontSize: "13px", marginTop: "6px" }}>This action cannot be undone.</p>
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={onConfirm} style={{
          flex: 1, padding: "13px", borderRadius: "10px", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #dc2626, #ef4444)", color: "#fff",
          fontWeight: 700, fontSize: "15px", fontFamily: "inherit",
          boxShadow: "0 4px 20px rgba(239,68,68,0.35)", transition: "transform 0.15s"
        }}
          onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.target.style.transform = ""}
        >Yes, Delete</button>
        <button onClick={onCancel} style={{
          padding: "13px 20px", borderRadius: "10px", cursor: "pointer",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#a78bfa", fontWeight: 600, fontSize: "15px", fontFamily: "inherit"
        }}>Cancel</button>
      </div>
    </>
  );
}

export default function StudentsTable() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "delete"
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const simulate = (fn) => {
    setLoading(true);
    setTimeout(() => { fn(); setLoading(false); }, 700);
  };

  const filtered = students
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      String(s.age).includes(search)
    )
    .sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleAdd = (form) => {
    simulate(() => {
      setStudents(s => [...s, { id: nextId++, name: form.name.trim(), email: form.email.trim(), age: Number(form.age) }]);
      setModal(null);
      showToast("Student added successfully");
    });
  };

  const handleEdit = (form) => {
    simulate(() => {
      setStudents(s => s.map(st => st.id === selected.id ? { ...st, name: form.name.trim(), email: form.email.trim(), age: Number(form.age) } : st));
      setModal(null);
      showToast("Student updated successfully");
    });
  };

  const handleDelete = () => {
    simulate(() => {
      setStudents(s => s.filter(st => st.id !== selected.id));
      setModal(null);
      showToast("Student removed", "error");
    });
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
    return <span style={{ color: "#a78bfa", marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Syne:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080615; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes slideDown { from { transform: translateY(-12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes shimmer {
          0% { background-position: -200% center }
          100% { background-position: 200% center }
        }
        .row-hover:hover { background: rgba(139,92,246,0.07) !important; }
        .row-hover { transition: background 0.15s; }
        input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.18); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#080615",
        backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.15) 0%, transparent 60%)",
        fontFamily: "'Syne', sans-serif", padding: "40px 24px", color: "#e2d9f3"
      }}>
        {/* Header */}
        <div style={{ maxWidth: 900, margin: "0 auto 36px", animation: "slideDown 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "10px",
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", boxShadow: "0 4px 16px rgba(139,92,246,0.4)"
                }}>🎓</div>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#f5f0ff", letterSpacing: "-0.5px" }}>
                  Students Registry
                </h1>
              </div>
              <p style={{ color: "#7c6fa0", fontSize: "14px" }}>
                {students.length} enrolled · {filtered.length} shown
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button onClick={() => exportToCSV(filtered)} style={{
                padding: "11px 18px", borderRadius: "10px", cursor: "pointer",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#c4b5fd", fontSize: "13px", fontWeight: 600, fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                ↓ Export CSV
              </button>
              <button onClick={() => setModal("add")} style={{
                padding: "11px 22px", borderRadius: "10px", border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff",
                fontWeight: 700, fontSize: "14px", fontFamily: "inherit",
                boxShadow: "0 4px 20px rgba(139,92,246,0.4)", transition: "transform 0.15s, box-shadow 0.15s",
                display: "flex", alignItems: "center", gap: "6px"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(139,92,246,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.4)"; }}
              >
                + Add Student
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginTop: "24px" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#7c6fa0", fontSize: "16px" }}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or age…"
              style={{
                width: "100%", padding: "13px 16px 13px 42px", borderRadius: "12px",
                border: "1.5px solid rgba(139,92,246,0.2)", background: "rgba(255,255,255,0.04)",
                color: "#e2d9f3", fontSize: "14px", fontFamily: "inherit", outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.6)"}
              onBlur={e => e.target.style.borderColor = "rgba(139,92,246,0.2)"}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{
          maxWidth: 900, margin: "0 auto",
          background: "linear-gradient(145deg, rgba(19,16,42,0.95), rgba(14,12,34,0.95))",
          border: "1px solid rgba(139,92,246,0.2)", borderRadius: "20px",
          overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
          animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)"
        }}>
          {loading && (
            <div style={{
              height: "3px",
              background: "linear-gradient(90deg, transparent, #7c3aed, #a855f7, #7c3aed, transparent)",
              backgroundSize: "200% auto",
              animation: "shimmer 1.2s linear infinite"
            }} />
          )}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
                {[["name","Name"],["email","Email"],["age","Age"]].map(([field,label]) => (
                  <th key={field} onClick={() => handleSort(field)} style={{
                    padding: "16px 20px", textAlign: "left", cursor: "pointer",
                    color: "#a78bfa", fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.12em", userSelect: "none",
                    background: "rgba(139,92,246,0.05)"
                  }}>
                    {label}<SortIcon field={field} />
                  </th>
                ))}
                <th style={{
                  padding: "16px 20px", textAlign: "right",
                  color: "#a78bfa", fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.12em", background: "rgba(139,92,246,0.05)"
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "60px", textAlign: "center", color: "#4a4060" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>◦</div>
                    <div style={{ fontSize: "15px" }}>No students found</div>
                  </td>
                </tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} className="row-hover" style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(139,92,246,0.08)" : "none",
                  animation: `slideDown 0.3s ease ${i * 0.04}s both`
                }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: `linear-gradient(135deg, hsl(${(s.id * 57) % 360},60%,45%), hsl(${(s.id * 57 + 60) % 360},70%,60%))`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                      }}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "#e2d9f3" }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#9d8ec4", fontSize: "14px" }}>{s.email}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{
                      background: "rgba(139,92,246,0.15)", color: "#c4b5fd",
                      padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 600,
                      border: "1px solid rgba(139,92,246,0.25)"
                    }}>{s.age}</span>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button onClick={() => { setSelected(s); setModal("edit"); }} style={{
                        padding: "7px 16px", borderRadius: "8px", cursor: "pointer",
                        background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                        color: "#a78bfa", fontSize: "13px", fontWeight: 600, fontFamily: "inherit",
                        transition: "all 0.15s"
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.25)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; }}
                      >Edit</button>
                      <button onClick={() => { setSelected(s); setModal("delete"); }} style={{
                        padding: "7px 16px", borderRadius: "8px", cursor: "pointer",
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                        color: "#f87171", fontSize: "13px", fontWeight: 600, fontFamily: "inherit",
                        transition: "all 0.15s"
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div style={{ maxWidth: 900, margin: "16px auto 0", textAlign: "right", color: "#4a4060", fontSize: "12px" }}>
          {filtered.length} of {students.length} students
        </div>
      </div>

      {/* Modals */}
      {modal === "add" && (
        <Modal onClose={() => setModal(null)}>
          <StudentForm onSubmit={handleAdd} onCancel={() => setModal(null)} isEdit={false} />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal onClose={() => setModal(null)}>
          <StudentForm initial={selected} onSubmit={handleEdit} onCancel={() => setModal(null)} isEdit={true} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <Modal onClose={() => setModal(null)}>
          <DeleteDialog student={selected} onConfirm={handleDelete} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          background: toast.type === "error" ? "linear-gradient(135deg,#7f1d1d,#991b1b)" : "linear-gradient(135deg,#1e1b4b,#312e81)",
          border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(139,92,246,0.4)"}`,
          color: "#fff", padding: "12px 24px", borderRadius: "12px",
          fontSize: "14px", fontWeight: 600, fontFamily: "'Syne', sans-serif",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideUp 0.2s ease",
          zIndex: 2000, whiteSpace: "nowrap"
        }}>
          {toast.type === "error" ? "🗑 " : "✓ "}{toast.msg}
        </div>
      )}
    </>
  );
}
