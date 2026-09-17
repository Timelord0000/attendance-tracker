// frontend/src/components/TodayClasses.jsx
import React, { useState, useEffect } from "react";
import { api } from "../api";

export function TodayClasses() {
  const [dateStr, setDateStr] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const loadData = () => {
    api.getSubjects().then(setSubjects);
    api.getClassesForDate(dateStr).then(setClasses);
  };

  useEffect(() => {
    loadData();
  }, [dateStr]);

  const handleStatusChange = (id, newStatus) => {
    api.updateAttendance(id, newStatus).then(() => loadData());
  };

  const getSubjectName = (id) => {
    const sub = subjects.find((s) => s.id === id);
    return sub
      ? `${sub.name} ${sub.code ? `(${sub.code})` : ""}`
      : `Subject #${id}`;
  };

  return (
    <div className="tab-content">
      <h2>Class Attendance</h2>
      <div className="date-picker-row">
        <label>Select Date: </label>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
        />
      </div>

      {classes.length === 0 ? (
        <p>No classes scheduled for this date.</p>
      ) : (
        <div className="class-list">
          {classes.map((cls) => (
            <div key={cls.id} className={`card class-row status-${cls.status}`}>
              <div>
                <strong>{getSubjectName(cls.subject_id)}</strong>
                <div className="status-label">
                  Current Status: <em>{cls.status}</em>
                </div>
              </div>
              <div className="btn-group">
                <button
                  className={cls.status === "present" ? "active present" : ""}
                  onClick={() => handleStatusChange(cls.id, "present")}
                >
                  Present
                </button>
                <button
                  className={cls.status === "absent" ? "active absent" : ""}
                  onClick={() => handleStatusChange(cls.id, "absent")}
                >
                  Absent
                </button>
                <button
                  className={
                    cls.status === "cancelled" ? "active cancelled" : ""
                  }
                  onClick={() => handleStatusChange(cls.id, "cancelled")}
                >
                  Cancelled
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
