import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_TARGET = 75;

function todayWeekdayIndex() {
  // JS: 0 = Sunday. App: 0 = Monday.
  return (new Date().getDay() + 6) % 7;
}

function sortSlots(slots) {
  return [...slots].sort((a, b) => a.slot_order - b.slot_order);
}

export function TimetableSetup() {
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [targetPct, setTargetPct] = useState(DEFAULT_TARGET);
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  const [countryCode, setCountryCode] = useState("US");
  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear());
  const [holidayStatus, setHolidayStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [subjectData, timetableData] = await Promise.all([
        api.getSubjects(),
        api.getTimetable(),
      ]);
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
      setTimetable(Array.isArray(timetableData) ? timetableData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load setup data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const subjectById = useMemo(() => {
    const map = new Map();
    subjects.forEach((subject) => map.set(subject.id, subject));
    return map;
  }, [subjects]);

  const slotsByDay = useMemo(() => {
    return WEEKDAYS.map((_, dayIndex) =>
      sortSlots(timetable.filter((slot) => slot.weekday === dayIndex)),
    );
  }, [timetable]);

  const totalSlots = timetable.length;
  const todayIndex = todayWeekdayIndex();

  const handleAddSubject = async (event) => {
    event.preventDefault();
    const name = subjectName.trim();
    if (!name || isAddingSubject) return;

    setIsAddingSubject(true);
    setError("");
    try {
      await api.createSubject({
        name,
        code: subjectCode.trim() || null,
        target_pct: Number(targetPct) || DEFAULT_TARGET,
      });
      setSubjectName("");
      setSubjectCode("");
      setTargetPct(DEFAULT_TARGET);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add subject.");
    } finally {
      setIsAddingSubject(false);
    }
  };

  const handleDeleteSubject = async (subject) => {
    const confirmed = window.confirm(
      `Delete “${subject.name}”? Its timetable slots will also be removed.`,
    );
    if (!confirmed) return;
    setError("");
    try {
      await api.deleteSubject(subject.id);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete subject.");
    }
  };

  const handleAddSlot = async (event) => {
    event.preventDefault();
    if (!selectedSubjectId || isAddingSlot) return;

    setIsAddingSlot(true);
    setError("");
    try {
      const day = Number(selectedDay);
      const order = slotsByDay[day].length + 1;
      await api.createSlot({
        subject_id: Number(selectedSubjectId),
        weekday: day,
        slot_order: order,
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add slot.");
    } finally {
      setIsAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    setError("");
    try {
      await api.deleteSlot(slotId);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete slot.");
    }
  };

  const handleSyncHolidays = async () => {
    setIsSyncing(true);
    setHolidayStatus({ type: "info", text: "Syncing holidays…" });
    try {
      const result = await api.syncHolidays(holidayYear, countryCode.trim() || "US");
      if (result?.error) {
        setHolidayStatus({ type: "error", text: result.error });
      } else {
        setHolidayStatus({
          type: "success",
          text: `Synced ${result?.synced_new ?? 0} new holidays. Total: ${result?.total_holidays ?? 0}.`,
        });
      }
    } catch (err) {
      setHolidayStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Holiday sync failed.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Setup</h2>
        <p className="page-subtitle">
          Add subjects, build your weekly timetable, and sync holidays.{" "}
          {totalSlots > 0 && `${totalSlots} slot${totalSlots === 1 ? "" : "s"} scheduled.`}
        </p>
      </div>

      {error && (
        <div className="notice notice-error" role="alert" style={{ marginBottom: 16 }}>
          <span>{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadAll}>
            Retry
          </button>
        </div>
      )}

      <div className="setup-grid">
        <section className="card" aria-label="Subjects">
          <h3 className="card-title">Subjects</h3>
          <p className="card-subtitle">Each subject has its own attendance target.</p>

          <form className="form" onSubmit={handleAddSubject}>
            <div className="field">
              <label className="field-label" htmlFor="subject-name">
                Subject name
              </label>
              <input
                id="subject-name"
                className="input"
                value={subjectName}
                onChange={(event) => setSubjectName(event.target.value)}
                placeholder="e.g. Data Structures"
                autoComplete="off"
              />
            </div>

            <div className="inline-row">
              <div className="field">
                <label className="field-label" htmlFor="subject-code">
                  Code <span className="field-hint">(optional)</span>
                </label>
                <input
                  id="subject-code"
                  className="input"
                  value={subjectCode}
                  onChange={(event) => setSubjectCode(event.target.value)}
                  placeholder="CS201"
                  autoComplete="off"
                />
              </div>
              <div className="field" style={{ maxWidth: 120 }}>
                <label className="field-label" htmlFor="subject-target">
                  Target %
                </label>
                <input
                  id="subject-target"
                  className="input"
                  type="number"
                  min={0}
                  max={100}
                  value={targetPct}
                  onChange={(event) => setTargetPct(event.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isAddingSubject || !subjectName.trim()}>
              {isAddingSubject ? "Adding…" : "Add subject"}
            </button>
          </form>

          {subjects.length > 0 && (
            <ul className="subject-list">
              {subjects.map((subject) => (
                <li key={subject.id}>
                  <div>
                    <div className="subject-list-name">
                      {subject.name}
                      {subject.code && <span className="class-code">{subject.code}</span>}
                    </div>
                    <div className="subject-list-meta">Target {subject.target_pct}%</div>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => handleDeleteSubject(subject)}
                    aria-label={`Delete ${subject.name}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-label="Timetable slots">
          <h3 className="card-title">Weekly slots</h3>
          <p className="card-subtitle">Add one class occurrence at a time.</p>

          <form className="form" onSubmit={handleAddSlot}>
            <div className="field">
              <label className="field-label" htmlFor="slot-subject">
                Subject
              </label>
              <select
                id="slot-subject"
                className="select"
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                    {subject.code ? ` (${subject.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="slot-day">
                Day
              </label>
              <select
                id="slot-day"
                className="select"
                value={selectedDay}
                onChange={(event) => setSelectedDay(Number(event.target.value))}
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isAddingSlot || !selectedSubjectId}
            >
              {isAddingSlot ? "Adding…" : "Add slot"}
            </button>
          </form>
        </section>

        <section className="card" aria-label="Holiday sync">
          <h3 className="card-title">Holidays</h3>
          <p className="card-subtitle">Skip public holidays when generating classes.</p>

          <div className="inline-row">
            <div className="field" style={{ maxWidth: 110 }}>
              <label className="field-label" htmlFor="holiday-country">
                Country
              </label>
              <input
                id="holiday-country"
                className="input"
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
                placeholder="US"
                maxLength={2}
                autoComplete="off"
              />
            </div>
            <div className="field" style={{ maxWidth: 130 }}>
              <label className="field-label" htmlFor="holiday-year">
                Year
              </label>
              <input
                id="holiday-year"
                className="input"
                type="number"
                value={holidayYear}
                onChange={(event) => setHolidayYear(Number(event.target.value))}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSyncHolidays}
              disabled={isSyncing}
            >
              {isSyncing ? "Syncing…" : "Sync"}
            </button>
          </div>

          {holidayStatus && (
            <div
              className={`notice ${holidayStatus.type === "error" ? "notice-error" : holidayStatus.type === "success" ? "notice-success" : ""}`}
              role="status"
              style={{ marginTop: 12 }}
            >
              <span>{holidayStatus.text}</span>
            </div>
          )}
        </section>
      </div>

      <h3 className="section-title">Weekly schedule</h3>
      <p className="section-subtitle">Today is highlighted for quick orientation.</p>

      {isLoading ? (
        <div className="schedule" aria-busy="true" aria-label="Loading schedule">
          {WEEKDAYS.map((day) => (
            <div key={day} className="day-column">
              <h4 className="day-name">{day.slice(0, 3)}</h4>
              <div className="skeleton" style={{ height: 32 }}>&nbsp;</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="schedule">
          {WEEKDAYS.map((day, dayIndex) => (
            <div
              key={day}
              className={`day-column ${dayIndex === todayIndex ? "is-today" : ""}`}
            >
              <h4 className="day-name">
                <span>{day.slice(0, 3)}</span>
                {dayIndex === todayIndex && <span className="badge badge-accent">Today</span>}
              </h4>

              {slotsByDay[dayIndex].length === 0 ? (
                <span className="slot-empty">No classes</span>
              ) : (
                slotsByDay[dayIndex].map((slot) => {
                  const subject = subjectById.get(slot.subject_id);
                  return (
                    <div key={slot.id} className="slot">
                      <span>{subject ? subject.name : `Subject #${slot.subject_id}`}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id)}
                        aria-label={`Remove ${subject?.name ?? "slot"} on ${day}`}
                        title="Remove slot"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
