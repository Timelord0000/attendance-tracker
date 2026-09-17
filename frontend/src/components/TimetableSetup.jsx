// frontend/src/components/TimetableSetup.jsx
import React, { useState, useEffect } from "react";
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

export function TimetableSetup() {
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [targetPct, setTargetPct] = useState(75);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);

  const [countryCode, setCountryCode] = useState("US");
  const [syncMsg, setSyncMsg] = useState("");

  const loadAll = () => {
    api.getSubjects().then(setSubjects);
    api.getTimetable().then(setTimetable);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubName) return;
    api
      .createSubject({
        name: newSubName,
        code: newSubCode,
        target_pct: parseFloat(targetPct),
      })
      .then(() => {
        setNewSubName("");
        setNewSubCode("");
        loadAll();
      });
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!selectedSubject) return;
    const daySlots = timetable.filter(
      (t) => t.weekday === parseInt(selectedDay),
    );
    api
      .createSlot({
        subject_id: parseInt(selectedSubject),
        weekday: parseInt(selectedDay),
        slot_order: daySlots.length + 1,
      })
      .then(() => loadAll());
  };

  const handleDeleteSlot = (id) => {
    api.deleteSlot(id).then(() => loadAll());
  };

  const handleSyncHolidays = () => {
    setSyncMsg("Syncing...");
    api.syncHolidays(2026, countryCode).then((res) => {
      if (res.error) setSyncMsg(`Error: ${res.error}`);
      else
        setSyncMsg(
          `Synced ${res.synced_new} new holidays! (Total: ${res.total_holidays})`,
        );
    });
  };

  return (
    <div className="tab-content">
      <h2>Setup Subjects & Timetable</h2>

      <div className="setup-grid">
        <div className="card">{/* Create Subject Card Content */}</div>

        <div className="card">{/* Add Class Slot Card Content */}</div>

        {/* 🌟 ADD IT HERE AS THE THIRD CARD */}
        <div className="card">
          <h3>Holiday Calendar Sync</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              style={{ width: "80px" }}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              placeholder="US"
              maxLength={2}
            />
            <button onClick={handleSyncHolidays}>Sync 2026 Holidays</button>
          </div>
          {syncMsg && (
            <p>
              <small>{syncMsg}</small>
            </p>
          )}
        </div>
      </div>

      <h3>Weekly Schedule</h3>
      <div className="timetable-grid">{/* Weekly Schedule Content */}</div>
    </div>
  );
}
