"use client";

import { useState, useEffect } from "react";
import { caretakerAPI } from "../../services/api";
import LoadingSpinner from "../UI/LoadingSpinner";
import ErrorMessage from "../UI/ErrorMessage";
import "./AddMedicationModal.css";

function PatientMedicationsModal({ patient, onClose }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingTaken, setMarkingTaken] = useState(null);

  useEffect(() => {
    loadPatientMedications();
  }, [patient.id]);

  const loadPatientMedications = async () => {
    try {
      setLoading(true);
      setError("");
      const medicationsData = await caretakerAPI.getPatientMedications(
        patient.id
      );
      setMedications(medicationsData);
    } catch (err) {
      setError("Failed to load patient medications");
      console.error("Patient medications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async (medicationId) => {
    try {
      setMarkingTaken(medicationId);
      const today = new Date().toISOString().split("T")[0];
      await caretakerAPI.markPatientMedicationAsTaken(
        patient.id,
        medicationId,
        today
      );

      // Refresh the medications list
      await loadPatientMedications();
    } catch (err) {
      setError("Failed to mark medication as taken");
    } finally {
      setMarkingTaken(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{patient.username}'s Medications</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <ErrorMessage message={error} />}

          {loading ? (
            <LoadingSpinner size="small" message="Loading medications..." />
          ) : medications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💊</div>
              <h3>No medications found</h3>
              <p>This patient hasn't added any medications yet.</p>
            </div>
          ) : (
            <div className="patient-medications-list">
              {medications.map((medication) => (
                <div key={medication.id} className="medication-card">
                  <div className="medication-info">
                    <h3 className="medication-name">{medication.name}</h3>
                    <p className="medication-dosage">{medication.dosage}</p>
                    <p className="medication-frequency">
                      {medication.frequency}
                    </p>
                  </div>

                  <div className="medication-actions">
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleMarkAsTaken(medication.id)}
                      disabled={markingTaken === medication.id}
                    >
                      {markingTaken === medication.id
                        ? "Marking..."
                        : "Mark as Taken"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientMedicationsModal;
