// frontend/src/App.jsx
import React, { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { TodayClasses } from "./components/TodayClasses";
import { TimetableSetup } from "./components/TimetableSetup";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="app-container">
      <header>
        <h1>Weighted Attendance Tracker</h1>
        <nav>
          <button
            className={tab === "dashboard" ? "active" : ""}
            onClick={() => setTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={tab === "classes" ? "active" : ""}
            onClick={() => setTab("classes")}
          >
            Attendance
          </button>
          <button
            className={tab === "setup" ? "active" : ""}
            onClick={() => setTab("setup")}
          >
            Setup
          </button>
        </nav>
      </header>
      <main>
        {tab === "dashboard" && <Dashboard />}
        {tab === "classes" && <TodayClasses />}
        {tab === "setup" && <TimetableSetup />}
      </main>
    </div>
  );
}
