import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

function formatPct(value) {
  const num = Number(value ?? 0);
  return `${Number.isFinite(num) ? num.toFixed(1).replace(/\.0$/, "") : "0"}%`;
}

function StatusBadge({ percentage, target }) {
  const onTrack = Number(percentage) >= Number(target ?? 0);
  return (
    <span className={`badge ${onTrack ? "badge-success" : "badge-danger"}`}>
      <span className="dot" aria-hidden="true" />
      {onTrack ? "On track" : "At risk"}
    </span>
  );
}

function OverallCard({ overall }) {
  if (!overall) return null;

  const pct = Number(overall.percentage ?? 0);
  const barClass = pct >= 75 ? "progress-bar is-good" : "progress-bar is-risk";

  return (
    <section className="card" aria-label="Overall attendance">
      <h3 className="card-title">Overall attendance</h3>
      <p className="card-subtitle">Cancelled and unmarked classes are excluded.</p>

      <div className="overall-value">{formatPct(overall.percentage)}</div>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Overall attendance percentage"
      >
        <div className={barClass} style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
      </div>

      <dl className="overall-meta">
        <div className="meta-row">
          <dt>Present</dt>
          <dd>{overall.present ?? 0}</dd>
        </div>
        <div className="meta-row">
          <dt>Absent</dt>
          <dd>{overall.absent ?? 0}</dd>
        </div>
        <div className="meta-row">
          <dt>Marked total</dt>
          <dd>{overall.total_marked ?? 0}</dd>
        </div>
      </dl>
    </section>
  );
}

function SubjectCard({ subject }) {
  const pct = Number(subject.percentage ?? 0);
  const isAtRisk = pct < Number(subject.target_pct ?? 0);

  return (
    <article className={`card subject-card ${isAtRisk ? "is-at-risk" : ""}`}>
      <div className="subject-head">
        <div>
          <h4 className="subject-name">{subject.subject_name}</h4>
          <div className="subject-target">Target {formatPct(subject.target_pct)}</div>
        </div>
        <StatusBadge percentage={pct} target={subject.target_pct} />
      </div>

      <div className="subject-pct">{formatPct(subject.percentage)}</div>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${subject.subject_name} attendance`}
      >
        <div
          className={`progress-bar ${isAtRisk ? "is-risk" : "is-good"}`}
          style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
        />
      </div>

      <div className="subject-stats">
        <div>
          <strong>{subject.present ?? 0}</strong>
          Present
        </div>
        <div>
          <strong>{subject.absent ?? 0}</strong>
          Absent
        </div>
        <div>
          <strong>{subject.total_marked ?? 0}</strong>
          Marked
        </div>
      </div>
    </article>
  );
}

export function Dashboard() {
  const [overall, setOverall] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [overallData, subjectData] = await Promise.all([
        api.getOverallStats(),
        api.getSubjectStats(),
      ]);
      setOverall(overallData);
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const hasMarkedClasses = (overall?.total_marked ?? 0) > 0;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">
          A clear view of overall attendance and progress per subject.
        </p>
      </div>

      {error && (
        <div className="notice notice-error" role="alert" style={{ marginBottom: 16 }}>
          <span>{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadStats}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="overview-grid" aria-busy="true" aria-label="Loading dashboard">
          <div className="card">
            <div className="skeleton" style={{ height: 18, width: "55%" }}>&nbsp;</div>
            <div className="skeleton" style={{ height: 44, width: "40%", marginTop: 16 }}>&nbsp;</div>
            <div className="skeleton" style={{ height: 8, marginTop: 16 }}>&nbsp;</div>
          </div>
          <div className="card">
            <div className="skeleton" style={{ height: 18, width: "40%" }}>&nbsp;</div>
            <div className="skeleton" style={{ height: 14, marginTop: 12 }}>&nbsp;</div>
            <div className="skeleton" style={{ height: 14, marginTop: 8, width: "80%" }}>&nbsp;</div>
          </div>
        </div>
      ) : (
        <>
          {!hasMarkedClasses && subjects.length === 0 && !error ? (
            <div className="empty">
              <div className="empty-title">No attendance yet</div>
              <p className="empty-text">
                Add subjects and timetable slots in Setup, then mark attendance
                to see your progress here.
              </p>
            </div>
          ) : (
            <>
              <div className="overview-grid">
                <OverallCard overall={overall} />
                <section className="card" aria-label="How this is calculated">
                  <h3 className="card-title">How it works</h3>
                  <p className="card-subtitle">Simple rules, no surprises.</p>
                  <p style={{ fontSize: "0.9rem" }}>
                    Percentage is present divided by marked classes. Cancelled and
                    unmarked classes never lower your score. A subject is flagged
                    “At risk” when it drops below its target.
                  </p>
                </section>
              </div>

              <h3 className="section-title">Subjects</h3>
              <p className="section-subtitle">
                {subjects.length === 0
                  ? "No subjects yet."
                  : `${subjects.length} subject${subjects.length === 1 ? "" : "s"} tracked.`}
              </p>

              {subjects.length > 0 && (
                <div className="subject-grid">
                  {subjects.map((subject) => (
                    <SubjectCard key={subject.subject_id} subject={subject} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
