import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { TodayClasses } from "./components/TodayClasses";
import { TimetableSetup } from "./components/TimetableSetup";
import "./App.css";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "classes", label: "Attendance" },
  { id: "setup", label: "Setup" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              AT
            </span>
            <div>
              <div className="brand-title">Attendance Tracker</div>
              <div className="brand-subtitle">Weighted attendance, simplified</div>
            </div>
          </div>

          <nav className="tabs" role="tablist" aria-label="Primary">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={activeTab === tab.id}
                className="tab"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "classes" && <TodayClasses />}
        {activeTab === "setup" && <TimetableSetup />}
      </main>
    </div>
  );
}
