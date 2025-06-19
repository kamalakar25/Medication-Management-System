"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "./Header";
import PatientList from "./PatientList";
import AddPatientModal from "./AddPatientModal";
import PatientMedicationsModal from "./PatientMedicationsModal";
import socketService from "../../services/socket";
import { caretakerAPI } from "../../services/api";
import LoadingSpinner from "../UI/LoadingSpinner";
import ErrorMessage from "../UI/ErrorMessage";
import "./Dashboard.css";

function CaretakerDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showMedicationsModal, setShowMedicationsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadPatients();

    // Set up socket listeners for caretaker-specific events
    const patientMedicationAddedListener = socketService.on(
      "patient_medication_added",
      (data) => {
        addNotification(
          `${data.patient_username} added a new medication: ${data.name}`
        );
      }
    );

    const patientMedicationUpdatedListener = socketService.on(
      "patient_medication_updated",
      (data) => {
        addNotification(
          `${data.patient_username} updated medication: ${data.name}`
        );
      }
    );

    const patientMedicationDeletedListener = socketService.on(
      "patient_medication_deleted",
      (data) => {
        addNotification(`${data.patient_username} deleted a medication`);
      }
    );

    const patientMedicationTakenListener = socketService.on(
      "patient_medication_taken",
      (data) => {
        addNotification(
          `${data.patient_username} took ${data.medication_name}`
        );
      }
    );

    return () => {
      patientMedicationAddedListener();
      patientMedicationUpdatedListener();
      patientMedicationDeletedListener();
      patientMedicationTakenListener();
    };
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");
      const patientsData = await caretakerAPI.getPatients();
      setPatients(patientsData);
    } catch (err) {
      setError("Failed to load patients");
      console.error("Caretaker dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (patientUsername) => {
    try {
      const result = await caretakerAPI.addPatient(patientUsername);
      setPatients((prev) => [...prev, result.patient]);
      setShowAddPatientModal(false);
      addNotification(
        `Successfully added ${result.patient.username} as your patient`
      );
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to add patient");
    }
  };

  const handleViewPatientMedications = (patient) => {
    setSelectedPatient(patient);
    setShowMedicationsModal(true);
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
            <h1>Caretaker Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage and monitor your patients' medications
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

          <div className="caretaker-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3 className="stat-number">{patients.length}</h3>
                <p className="stat-label">Total Patients</p>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Your Patients</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddPatientModal(true)}
              >
                👥 Add Patient
              </button>
            </div>

            <PatientList
              patients={patients}
              onViewMedications={handleViewPatientMedications}
            />
          </div>
        </div>
      </main>

      {showAddPatientModal && (
        <AddPatientModal
          onClose={() => setShowAddPatientModal(false)}
          onAdd={handleAddPatient}
        />
      )}

      {showMedicationsModal && selectedPatient && (
        <PatientMedicationsModal
          patient={selectedPatient}
          onClose={() => {
            setShowMedicationsModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
}

export default CaretakerDashboard;
