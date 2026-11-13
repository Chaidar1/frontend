import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

const EMPTY = { name: "", category: "frontend", proficiency: 80, order: 0, icon: "" };
const CATEGORIES = ["frontend", "backend", "database", "tools"];

export default function ManageSkills() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // State untuk custom confirm modal hapus
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    skill: null,
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/skills/");
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal memuat skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    api.get("/skills/")
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.detail || "Gagal memuat skills");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const openComposer = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency ?? 80,
      order: s.order ?? 0,
      icon: s.icon || "",
    });
    setEditingId(s.id);
    setError("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "proficiency" || name === "order" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/skills/${editingId}`, form);
      } else {
        await api.post("/skills/", form);
      }
      setShowModal(false);
      setNotice(editingId ? "Skill berhasil diperbarui." : "Skill baru berhasil ditambahkan.");
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menyimpan skill");
    }
  };

  const confirmDelete = (s) => {
    setConfirmModal({
      isOpen: true,
      skill: s,
    });
  };

  const executeDelete = async () => {
    if (!confirmModal.skill) return;
    const s = confirmModal.skill;
    try {
      await api.delete(`/skills/${s.id}`);
      setNotice(`Skill "${s.name}" berhasil dihapus.`);
      setConfirmModal({ isOpen: false, skill: null });
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menghapus skill");
      setConfirmModal({ isOpen: false, skill: null });
    }
  };

  const grouped = items.reduce((acc, s) => {
    const cat = s.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <AdminLayout
      title="Kelola skill"
      eyebrow="// SKILL"
      action={
        <button className="button primary" type="button" onClick={openComposer}>
          + TAMBAH SKILL
        </button>
      }
    >
      {error && !showModal && (
        <button className="admin-notice" type="button" onClick={() => setError("")}>
          {error} <span>TUTUP</span>
        </button>
      )}
      {notice && (
        <button className="admin-notice" type="button" onClick={() => setNotice("")}>
          {notice} <span>TUTUP</span>
        </button>
      )}

      {loading && <p className="muted">Memuat skills...</p>}
      {!loading && items.length === 0 && <p className="muted">Belum ada skill.</p>}

      <div className="skill-grid">
        {Object.entries(grouped).map(([cat, list], idx) => (
          <article className="skill-card" key={cat} style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p className="eyebrow" style={{ margin: 0 }}>
                {String(idx + 1).padStart(2, "0")} / {cat.toUpperCase()}
              </p>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
                {list.length} SKILL
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "var(--panel-2)",
                    border: "1px solid var(--line)",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 13, color: "var(--cream)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.name}
                    </strong>
                    {s.proficiency !== undefined && s.proficiency !== null && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "var(--gold)",
                          background: "rgba(232, 185, 60, 0.08)",
                          padding: "1px 5px",
                          border: "1px solid rgba(232, 185, 60, 0.2)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.proficiency}%
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleEdit(s)}
                      className="button outline"
                      style={{
                        minHeight: 28,
                        padding: "0 10px",
                        fontSize: 10,
                        letterSpacing: "0.05em",
                      }}
                      title={`Edit ${s.name}`}
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(s)}
                      className="button outline"
                      style={{
                        minHeight: 28,
                        padding: "0 10px",
                        fontSize: 10,
                        letterSpacing: "0.05em",
                        borderColor: "rgba(255, 100, 100, 0.4)",
                        color: "#ff8888",
                      }}
                      title={`Hapus ${s.name}`}
                    >
                      HAPUS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Modal Tambah / Edit Skill */}
      {showModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowModal(false)}>
          <form
            className="project-modal"
            onSubmit={handleSubmit}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ width: "min(460px, 100%)" }}
          >
            <p className="eyebrow">// {editingId ? "EDIT SKILL" : "SKILL BARU"}</p>
            <h2>{editingId ? `Edit skill #${editingId}` : "Tambahkan skill"}</h2>

            {error && (
              <p style={{ color: "var(--gold-bright)", fontSize: 11, margin: 0 }}>{error}</p>
            )}

            <label>
              <span>NAMA SKILL</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="misal: React, Python, PostgreSQL"
                required
                autoFocus
              />
            </label>
            <label>
              <span>KATEGORI</span>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label>
                <span>PROFICIENCY (0-100)</span>
                <input
                  name="proficiency"
                  type="number"
                  min="0"
                  max="100"
                  value={form.proficiency}
                  onChange={handleChange}
                />
              </label>
              <label>
                <span>URUTAN (ORDER)</span>
                <input
                  name="order"
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="button-row" style={{ marginTop: 8 }}>
              <button className="button primary" type="submit">
                {editingId ? "SIMPAN PERUBAHAN" : "TAMBAH SKILL"}
              </button>
              <button
                className="button outline"
                type="button"
                onClick={() => setShowModal(false)}
              >
                BATAL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Confirm Modal Hapus */}
      {confirmModal.isOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setConfirmModal({ isOpen: false, skill: null })}
        >
          <div
            className="project-modal"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ maxWidth: 400, textAlign: "center", alignItems: "center" }}
          >
            <p className="eyebrow" style={{ color: "var(--gold)" }}>// KONFIRMASI</p>
            <h2 style={{ fontSize: 22, marginTop: 4 }}>Hapus Skill?</h2>
            <p className="muted" style={{ marginBottom: 16 }}>
              Skill <strong>"{confirmModal.skill?.name}"</strong> akan dihapus permanen dari portofolio.
            </p>
            <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 8 }}>
              <button
                type="button"
                className="button primary"
                onClick={executeDelete}
                style={{ flex: 1, background: "var(--gold)", color: "#000", border: 0 }}
              >
                YA, HAPUS
              </button>
              <button
                type="button"
                className="button outline"
                onClick={() => setConfirmModal({ isOpen: false, skill: null })}
                style={{ flex: 1 }}
              >
                BATAL
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
