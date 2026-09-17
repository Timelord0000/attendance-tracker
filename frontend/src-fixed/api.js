// Centralised API client. Keeps endpoint shapes identical to the backend
// routers so existing functionality is preserved; adds consistent errors.

const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_BASE = RAW_BASE.replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.detail || payload?.error || payload?.message ||
      `Request failed (${response.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return payload;
}

const get = (path) => request(path);
const post = (path, data) =>
  request(path, { method: "POST", body: JSON.stringify(data ?? {}) });
const patch = (path, data) =>
  request(path, { method: "PATCH", body: JSON.stringify(data) });
const remove = (path) => request(path, { method: "DELETE" });

export const api = {
  // Subjects
  getSubjects: () => get("/subjects"),
  createSubject: (data) => post("/subjects", data),
  deleteSubject: (id) => remove(`/subjects/${id}`),

  // Timetable
  getTimetable: () => get("/timetable"),
  createSlot: (data) => post("/timetable/slots", data),
  deleteSlot: (id) => remove(`/timetable/slots/${id}`),

  // Classes & attendance
  getClassesForDate: (dateStr) =>
    get(`/classes/?date=${encodeURIComponent(dateStr)}`),
  updateAttendance: (id, status) => patch(`/classes/${id}`, { status }),

  // Stats
  getOverallStats: () => get("/stats/overall"),
  getSubjectStats: () => get("/stats/subjects"),

  // Holidays
  syncHolidays: (year = 2026, countryCode = "US") =>
    post(
      `/holidays/sync?year=${encodeURIComponent(year)}&country_code=${encodeURIComponent(countryCode)}`,
    ),
  getHolidays: () => get("/holidays"),
};
