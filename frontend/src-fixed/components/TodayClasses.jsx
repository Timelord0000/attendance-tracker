import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const STATUSES = [
  { id: "present", label: "Present" },
  { id: "absent", label: "Absent" },
  { id: "cancelled", label: "Cancelled" },
];

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeClass(status) {
  switch (status) {
    case "present":
      return "badge badge-success";
    case "absent":
      return "badge badge-danger";
    case "cancelled":
      return "badge";
    default:
      return "badge badge-warning";
  }
}

export function TodayClasses() {
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateString(new Date()));
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const subjectById = useMemo(() => {
    const map = new Map();
    subjects.forEach((subject) => map.set(subject.id, subject));
    return map;
  }, [subjects]);

  const loadData = useCallback(
    async (dateValue = selectedDate) => {
      if (!dateValue) return;
      setIsLoading(true);
      setError("");
      try {
        const [subjectData, classData] = await Promise.all([
          api.getSubjects(),
          api.getClassesForDate(dateValue),
        ]);
        setSubjects(Array.isArray(subjectData) ? subjectData : []);
        setClasses(Array.isArray(classData) ? classData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load classes.");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (classId, nextStatus) => {
    setSavingId(classId);
    setError("");
    // Optimistic update keeps the UI responsive.
    setClasses((prev) =>
      prev.map((item) => (item.id === classId ? { ...item, status: nextStatus } : item)),
    );
    try {
      await api.updateAttendance(classId, nextStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save attendance.");
      await loadData();
    } finally {
      setSavingId(null);
    }
  };

  const markedCount = classes.filter((item) => item.status !== "unmarked").length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Attendance</h2>
        <p className="page-subtitle">
          {formatDisplayDate(selectedDate)} · {markedCount} of {classes.length} marked
        </p>
      </div>

      <div className="toolbar">
        <div className="field">
          <label className="field-label" htmlFor="attendance-date">
            Date
          </label>
          <input
            id="attendance-date"
            className="input"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSelectedDate(toLocalDateString(new Date()))}
          >
            Today
          </button>
        </div>
      </div>

      {error && (
        <div className="notice notice-error" role="alert" style={{ marginBottom: 16 }}>
          <span>{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => loadData()}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="class-list" aria-busy="true" aria-label="Loading classes">
          {[0, 1, 2].map((key) => (
            <div key={key} className="card class-card">
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 18, width: "45%" }}>&nbsp;</div>
                <div className="skeleton" style={{ height: 14, width: "30%", marginTop: 8 }}>&nbsp;</div>
              </div>
              <div className="skeleton" style={{ height: 36, width: 260 }}>&nbsp;</div>
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="empty">
          <div className="empty-title">No classes on this date</div>
          <p className="empty-text">
            Nothing is scheduled for {formatDisplayDate(selectedDate)}. Holidays are
            skipped automatically — add slots in Setup if something is missing.
          </p>
        </div>
      ) : (
        <div className="class-list">
          {classes.map((classItem) => {
            const subject = subjectById.get(classItem.subject_id);
            const subjectName = subject?.name ?? `Subject #${classItem.subject_id}`;
            const isSaving = savingId === classItem.id;

            return (
              <article key={classItem.id} className="card class-card">
                <div className="class-info">
                  <div className="class-name">
                    {subjectName}
                    {subject?.code && <span className="class-code">{subject.code}</span>}
                  </div>
                  <div className="class-meta">
                    <span className={statusBadgeClass(classItem.status)}>
                      <span className="dot" aria-hidden="true" />
                      {classItem.status}
                    </span>
                    {isSaving && <span>Saving…</span>}
                  </div>
                </div>

                <div
                  className="segmented"
                  role="group"
                  aria-label={`Mark attendance for ${subjectName}`}
                >
                  {STATUSES.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      className={`segmented-btn is-${status.id}`}
                      aria-pressed={classItem.status === status.id}
                      disabled={isSaving}
                      onClick={() => handleStatusChange(classItem.id, status.id)}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
