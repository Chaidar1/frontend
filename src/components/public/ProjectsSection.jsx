import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import { resolveImageUrl } from "../../services/api";

const CATEGORIES = [
  { value: "all", label: "Semua" },
  { value: "fullstack", label: "Fullstack" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
];

const CATEGORY_LABEL = {
  fullstack: "FULLSTACK",
  frontend: "FRONTEND",
  backend: "BACKEND",
};

export default function ProjectsSection() {
  const { data: projects, loading, error } = useFetch("/projects/");
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const visible = (projects || []).filter(
    (p) => p.is_published && (filter === "all" || p.category === filter)
  );

  const INITIAL_COUNT = 3;
  const displayed = showAll ? visible : visible.slice(0, INITIAL_COUNT);
  const hasMore = visible.length > INITIAL_COUNT;

  const handleToggle = () => {
    if (showAll) {
      setShowAll(false);
      const section = document.getElementById("projects");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setShowAll(true);
    }
  };

  return (
    <section className="section content-wrap" id="projects">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">01 // PROJECT UNGGULAN</p>
          <h2>Bukti, bukan klaim.</h2>
        </div>
        <div className="filter-row" aria-label="Filter project">
          {CATEGORIES.map((c) => (
            <button
              className={filter === c.value ? "filter active" : "filter"}
              key={c.value}
              type="button"
              onClick={() => {
                setFilter(c.value);
                setShowAll(false);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="muted">Memuat projects...</p>}
      {error && <p className="muted">Gagal memuat: {error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="muted">Belum ada project.</p>
      )}

      <div className="project-grid">
        {displayed.map((p, idx) => (
          <article className="project-card" key={p.id}>
            <div className="project-visual">
              <div className="window-dots">
                <i />
                <i />
                <i />
              </div>
              {p.image_url ? (
                <img src={resolveImageUrl(p.image_url)} alt={p.title} />
              ) : (
                <div className="visual-ui">
                  <span />
                  <span />
                  <span />
                  <b>
                    [ PRODUCT INTERFACE /{" "}
                    {CATEGORY_LABEL[p.category] || "WEB"} ]
                  </b>
                </div>
              )}
            </div>
            <div className="project-info">
              <p className="eyebrow">
                {String(idx + 1).padStart(2, "0")} ·{" "}
                {p.is_featured
                  ? "FEATURED"
                  : CATEGORY_LABEL[p.category] || "PROJECT"}
              </p>
              <h3>{p.title}</h3>
              {p.description && <p className="muted">{p.description}</p>}
              {p.slug && <p className="project-role">/{p.slug}</p>}
              {p.tech_stack?.length > 0 && (
                <div className="tag-row">
                  {p.tech_stack.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="card-links">
                {p.demo_url && (
                  <a href={p.demo_url} target="_blank" rel="noreferrer">
                    LIVE DEMO ↗
                  </a>
                )}
                {p.repo_url && (
                  <a href={p.repo_url} target="_blank" rel="noreferrer">
                    REPOSITORY ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <button
            type="button"
            className="button outline"
            onClick={handleToggle}
            style={{
              minHeight: 48,
              padding: "0 28px",
              letterSpacing: "0.06em",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {showAll ? (
              <>
                TUTUP SEBAGIAN <span style={{ fontSize: 10 }}>▲</span>
              </>
            ) : (
              <>
                TAMPILKAN SEMUA ({visible.length} PROJECT){" "}
                <span style={{ fontSize: 10 }}>▼</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}