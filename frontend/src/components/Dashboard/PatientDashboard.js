"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "./Header";
import StatsCards from "./StatsCards";
import MedicationList from "./MedicationList";
import AddMedicationModal from "./AddMedicationModal";
import EditMedicationModal from "./EditMedicationModal";
import MedicationDetailsModal from "./MedicationDetailsModal";
import PhotoUploadModal from "./PhotoUploadModal";
import socketService from "../../services/socket";
import { medicationAPI, dashboardAPI } from "../../services/api";
import LoadingSpinner from "../UI/LoadingSpinner";
import ErrorMessage from "../UI/ErrorMessage";
import "./Dashboard.css";

function PatientDashboard() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [stats, setStats] = useState({
    totalMedications: 0,
    takenToday: 0,
    adherenceRate: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();

    // Set up socket listeners for patient-specific events
    const medicationAddedListener = socketService.on(
      "medication_added",
      (medication) => {
        setMedications((prev) => [medication, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalMedications: prev.totalMedications + 1,
        }));
        addNotification(`Medication ${medication.name} added successfully`);
      }
    );

    const medicationUpdatedListener = socketService.on(
      "medication_updated",
      (medication) => {
        setMedications((prev) =>
          prev.map((med) =>
            med.id === medication.id ? { ...med, ...medication } : med
          )
        );
        addNotification(`Medication ${medication.name} updated successfully`);
      }
    );

    const medicationDeletedListener = socketService.on(
      "medication_deleted",
      (data) => {
        setMedications((prev) => prev.filter((med) => med.id !== data.id));
        setStats((prev) => ({
          ...prev,
          totalMedications: prev.totalMedications - 1,
        }));
        addNotification("Medication deleted successfully");
      }
    );

    const medicationTakenListener = socketService.on(
      "medication_taken",
      (data) => {
        loadDashboardData();
        addNotification(`Medication ${data.medication_name} marked as taken`);
      }
    );

    const medicationTakenByCaretakerListener = socketService.on(
      "medication_taken_by_caretaker",
      (data) => {
        loadDashboardData();
        addNotification(
          `${data.caretaker_username} marked ${data.medication_name} as taken for you`
        );
      }
    );

    const caretakerAddedListener = socketService.on(
      "caretaker_added",
      (data) => {
        addNotification(`${data.caretaker_username} is now your caretaker`);
      }
    );

    return () => {
      medicationAddedListener();
      medicationUpdatedListener();
      medicationDeletedListener();
      medicationTakenListener();
      medicationTakenByCaretakerListener();
      caretakerAddedListener();
    };
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
      addNotification(`Medication ${medicationData.name} added successfully`);
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to add medication");
    }
  };

  const handleEditMedication = async (medicationData) => {
    try {
      const updatedMedication = await medicationAPI.updateMedication(
        selectedMedication.id,
        medicationData
      );
      setMedications((prev) =>
        prev.map((med) =>
          med.id === selectedMedication.id
            ? { ...med, ...updatedMedication }
            : med
        )
      );
      setShowEditModal(false);
      setSelectedMedication(null);
      addNotification(`Medication ${medicationData.name} updated successfully`);
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Failed to update medication"
      );
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    try {
      await medicationAPI.deleteMedication(medicationId);
      setMedications((prev) => prev.filter((med) => med.id !== medicationId));
      setStats((prev) => ({
        ...prev,
        totalMedications: prev.totalMedications - 1,
      }));
      setShowDetailsModal(false);
      setSelectedMedication(null);
      addNotification("Medication deleted successfully");
    } catch (err) {
      setError("Failed to delete medication");
    }
  };

  const handleMarkAsTaken = async (medicationId, photo = null) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await medicationAPI.markAsTaken(medicationId, today, photo);

      // Refresh stats
      const updatedStats = await dashboardAPI.getStats();
      setStats(updatedStats);

      const medication = medications.find((med) => med.id === medicationId);
      addNotification(`${medication.name} marked as taken`);
    } catch (err) {
      setError("Failed to mark medication as taken");
    }
  };

  const handleMarkAsTakenWithPhoto = (medication) => {
    setSelectedMedication(medication);
    setShowPhotoModal(true);
  };

  const handlePhotoUpload = async (photo) => {
    try {
      await handleMarkAsTaken(selectedMedication.id, photo);
      setShowPhotoModal(false);
      setSelectedMedication(null);
    } catch (err) {
      throw new Error("Failed to mark medication as taken with photo");
    }
  };

  const handleViewDetails = (medication) => {
    setSelectedMedication(medication);
    setShowDetailsModal(true);
  };

  const handleEditClick = (medication) => {
    setSelectedMedication(medication);
    setShowEditModal(true);
  };

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
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

          {error && (
            <ErrorMessage message={error} onClose={() => setError("")} />
          )}

          {notifications.length > 0 && (
            <div className="notifications-container">
              {notifications.map((notification) => (
                <div key={notification.id} className="notification">
                  <span>{notification.message}</span>
                  <button
                    className="notification-close"
                    onClick={() => removeNotification(notification.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <StatsCards stats={stats} />

          <div className="dashboard-actions">
            <Link to="/analytics" className="btn btn-secondary">
              📊 View Adherence Analytics
            </Link>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Your Medications</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                ➕ Add Medication
              </button>
            </div>

            <MedicationList
              medications={medications}
              onMarkAsTaken={handleMarkAsTaken}
              onMarkAsTakenWithPhoto={handleMarkAsTakenWithPhoto}
              onViewDetails={handleViewDetails}
              onEdit={handleEditClick}
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

      {showEditModal && selectedMedication && (
        <EditMedicationModal
          medication={selectedMedication}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMedication(null);
          }}
          onEdit={handleEditMedication}
        />
      )}

      {showDetailsModal && selectedMedication && (
        <MedicationDetailsModal
          medication={selectedMedication}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMedication(null);
          }}
          onDelete={handleDeleteMedication}
        />
      )}

      {showPhotoModal && selectedMedication && (
        <PhotoUploadModal
          medication={selectedMedication}
          onClose={() => {
            setShowPhotoModal(false);
            setSelectedMedication(null);
          }}
          onUpload={handlePhotoUpload}
        />
      )}
    </div>
  );
}

export default PatientDashboard;
