// frontend/src/api.js
const API_BASE = "http://localhost:8000";

export const api = {
  // Subjects
  getSubjects: () => fetch(`${API_BASE}/subjects`).then((res) => res.json()),
  createSubject: (data) =>
    fetch(`${API_BASE}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  deleteSubject: (id) =>
    fetch(`${API_BASE}/subjects/${id}`, { method: "DELETE" }),

  // Timetable
  getTimetable: () => fetch(`${API_BASE}/timetable`).then((res) => res.json()),
  createSlot: (data) =>
    fetch(`${API_BASE}/timetable/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  deleteSlot: (id) =>
    fetch(`${API_BASE}/timetable/slots/${id}`, { method: "DELETE" }),

  // Classes & Attendance
  getClassesForDate: (dateStr) =>
    fetch(`${API_BASE}/classes?date=${dateStr}`).then((res) => res.json()),
  updateAttendance: (id, status) =>
    fetch(`${API_BASE}/classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then((res) => res.json()),

  // Stats
  getOverallStats: () =>
    fetch(`${API_BASE}/stats/overall`).then((res) => res.json()),
  getSubjectStats: () =>
    fetch(`${API_BASE}/stats/subjects`).then((res) => res.json()),
  syncHolidays: (year = 2026, countryCode = "US") =>
    fetch(
      `${API_BASE}/holidays/sync?year=${year}&country_code=${countryCode}`,
      { method: "POST" },
    ).then((res) => res.json()),
  getHolidays: () => fetch(`${API_BASE}/holidays`).then((res) => res.json()),
};
