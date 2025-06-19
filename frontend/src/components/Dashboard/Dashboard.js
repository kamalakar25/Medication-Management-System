"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "./Header";
import StatsCards from "./StatsCards";
import MedicationList from "./MedicationList";
import AddMedicationModal from "./AddMedicationModal";
import { medicationAPI, dashboardAPI } from "../../services/api";
import LoadingSpinner from "../UI/LoadingSpinner";
import ErrorMessage from "../UI/ErrorMessage";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [stats, setStats] = useState({
    totalMedications: 0,
    takenToday: 0,
    adherenceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [medicationsData, statsData] = await Promise.all([
        medicationAPI.getMedications(),
        dashboardAPI.getStats(),
      ]);

      setMedications(medicationsData);
      setStats(statsData);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (medicationData) => {
    try {
      const newMedication = await medicationAPI.addMedication(medicationData);
      setMedications((prev) => [newMedication, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalMedications: prev.totalMedications + 1,
      }));
      setShowAddModal(false);
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to add medication");
    }
  };

  const handleMarkAsTaken = async (medicationId) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await medicationAPI.markAsTaken(medicationId, today);

      // Refresh stats
      const updatedStats = await dashboardAPI.getStats();
      setStats(updatedStats);
    } catch (err) {
      setError("Failed to mark medication as taken");
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
            <h1>Welcome back, {user.username}!</h1>
            <p className="dashboard-subtitle">
              Here's your medication overview for today
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          <StatsCards stats={stats} />

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Your Medications</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                Add Medication
              </button>
            </div>

            <MedicationList
              medications={medications}
              onMarkAsTaken={handleMarkAsTaken}
            />
          </div>
        </div>
      </main>

      {showAddModal && (
        <AddMedicationModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMedication}
        />
      )}
    </div>
  );
}

export default Dashboard;
