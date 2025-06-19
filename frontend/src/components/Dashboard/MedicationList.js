"use client";

import { useState } from "react";
import "./MedicationList.css";

function MedicationList({
  medications,
  onMarkAsTaken,
  onMarkAsTakenWithPhoto,
  onViewDetails,
  onEdit,
}) {
  const [takingMedication, setTakingMedication] = useState(null);

  const handleMarkAsTaken = async (medicationId) => {
    try {
      setTakingMedication(medicationId);
      await onMarkAsTaken(medicationId);
    } catch (err) {
      console.error("Error marking medication as taken:", err);
    } finally {
      setTakingMedication(null);
    }
  };

  const handleMarkAsTakenWithPhoto = (medication) => {
    if (onMarkAsTakenWithPhoto) {
      onMarkAsTakenWithPhoto(medication);
    }
  };

  const handleEdit = (medication) => {
    if (onEdit) {
      onEdit(medication);
    }
  };

  const handleViewDetails = (medication) => {
    if (onViewDetails) {
      onViewDetails(medication);
    }
  };

  if (medications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💊</div>
        <h3>No medications added yet</h3>
        <p>
          Click "Add Medication" to get started with tracking your medications.
        </p>
      </div>
    );
  }

  return (
    <div className="medication-list">
      {medications.map((medication) => (
        <div key={medication.id} className="medication-card">
          <div className="medication-info">
            <h3 className="medication-name">{medication.name}</h3>
            <p className="medication-dosage">{medication.dosage}</p>
            <p className="medication-frequency">{medication.frequency}</p>
          </div>

          <div className="medication-actions">
            <button
              className="btn btn-success btn-small"
              onClick={() => handleMarkAsTaken(medication.id)}
              disabled={takingMedication === medication.id}
            >
              {takingMedication === medication.id
                ? "Marking..."
                : "✅ Mark as Taken"}
            </button>

            {onMarkAsTakenWithPhoto && (
              <button
                className="btn btn-primary btn-small"
                onClick={() => handleMarkAsTakenWithPhoto(medication)}
                disabled={takingMedication === medication.id}
              >
                📷 With Photo
              </button>
            )}

            {onEdit && (
              <button
                className="btn btn-secondary btn-small"
                onClick={() => handleEdit(medication)}
              >
                ✏️ Edit
              </button>
            )}

            {onViewDetails && (
              <button
                className="btn btn-outline btn-small"
                onClick={() => handleViewDetails(medication)}
              >
                👁️ Details
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MedicationList;
