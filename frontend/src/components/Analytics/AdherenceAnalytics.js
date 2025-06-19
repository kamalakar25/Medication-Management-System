"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../Dashboard/Header";
import { analyticsAPI } from "../../services/api";
import LoadingSpinner from "../UI/LoadingSpinner";
import ErrorMessage from "../UI/ErrorMessage";
import "./AdherenceAnalytics.css";

function AdherenceAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await analyticsAPI.getAdherenceData(selectedPeriod);
      setAnalyticsData(data);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard">
      <Header user={user} />

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Adherence Analytics</h1>
            <p className="dashboard-subtitle">
              Track your medication adherence over time
            </p>
          </div>

          <div className="analytics-controls">
            <Link to="/dashboard" className="btn btn-secondary">
              ← Back to Dashboard
            </Link>

            <div className="period-selector">
              <label htmlFor="period">Time Period:</label>
              <select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="form-select"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          {analyticsData && (
            <div className="analytics-content">
              <div className="analytics-summary">
                <div className="summary-card">
                  <h3>Overall Adherence Rate</h3>
                  <div className="adherence-rate">
                    <span className="rate-number">
                      {analyticsData.adherenceRate}%
                    </span>
                    <div className="rate-bar">
                      <div
                        className="rate-fill"
                        style={{ width: `${analyticsData.adherenceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-sections">
                <div className="section">
                  <h3>Medication Adherence</h3>
                  <div className="medication-adherence-list">
                    {analyticsData.medicationAdherence.map((med) => (
                      <div key={med.id} className="medication-adherence-item">
                        <div className="med-info">
                          <h4>{med.name}</h4>
                          <p>
                            {med.totalTaken} of {med.expectedTaken} doses taken
                          </p>
                        </div>
                        <div className="med-rate">
                          <span className="rate-percentage">
                            {med.adherenceRate}%
                          </span>
                          <div className="mini-rate-bar">
                            <div
                              className="mini-rate-fill"
                              style={{ width: `${med.adherenceRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="section">
                  <h3>Daily Adherence</h3>
                  <div className="daily-adherence-chart">
                    {analyticsData.dailyAdherence.map((day) => (
                      <div key={day.date} className="day-bar">
                        <div className="day-label">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="bar-container">
                          <div
                            className="adherence-bar"
                            style={{ height: `${day.adherenceRate}%` }}
                            title={`${day.taken}/${day.total} medications taken`}
                          ></div>
                        </div>
                        <div className="day-percentage">
                          {day.adherenceRate}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdherenceAnalytics;
