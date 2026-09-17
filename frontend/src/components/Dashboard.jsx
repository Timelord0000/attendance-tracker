// frontend/src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

export function Dashboard() {
  const [overall, setOverall] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const loadStats = () => {
    api.getOverallStats().then(setOverall);
    api.getSubjectStats().then(setSubjects);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="tab-content">
      <h2>Dashboard</h2>
      {overall && (
        <div className="card summary-card">
          <h3>Overall Attendance</h3>
          <div className="big-stat">{overall.percentage}%</div>
          <p>
            {overall.present} Attended / {overall.total_marked} Marked Total
            (Absences: {overall.absent})
          </p>
        </div>
      )}

      <h3>Subject Breakdown</h3>
      <div className="grid">
        {subjects.map((sub) => {
          const isBelow = sub.percentage < sub.target_pct;
          return (
            <div
              key={sub.subject_id}
              className={`card ${isBelow ? "warning" : ""}`}
            >
              <h4>{sub.subject_name}</h4>
              <p className="pct-display">
                {sub.percentage}%{" "}
                <span className="target-badge">Target: {sub.target_pct}%</span>
              </p>
              <p>
                Present: {sub.present} | Absent: {sub.absent} | Total:{" "}
                {sub.total_marked}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
