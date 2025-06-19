"use client";

import { useState, useEffect } from "react";
import { medicationAPI } from "../../services/api";
import Button from "../UI/Button";
import LoadingSpinner from "../UI/LoadingSpinner";
import ErrorMessage from "../UI/ErrorMessage";
import "./AddMedicationModal.css";

function MedicationDetailsModal({ medication, onClose, onDelete }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (medication) {
      loadMedicationLogs();
    }
  }, [medication]);

  const loadMedicationLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const logsData = await medicationAPI.getMedicationLogs(medication.id);
      setLogs(logsData);
    } catch (err) {
      setError("Failed to load medication logs");
      console.error("Medication logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${medication.name}? This action cannot be undone.`
      )
    ) {
      try {
        setDeleting(true);
        await onDelete(medication.id);
      } catch (err) {
        setError("Failed to delete medication");
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{medication.name} - Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <ErrorMessage message={error} />}

          <div className="medication-details">
            <div className="detail-row">
              <strong>Dosage:</strong> {medication.dosage}
            </div>
            <div className="detail-row">
              <strong>Frequency:</strong> {medication.frequency}
            </div>
            <div className="detail-row">
              <strong>Added:</strong>{" "}
              {new Date(medication.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="medication-logs-section">
            <h3>Recent Activity</h3>
            {loading ? (
              <LoadingSpinner size="small" message="Loading logs..." />
            ) : logs.length === 0 ? (
              <p className="no-logs">No activity recorded yet.</p>
            ) : (
              <div className="logs-list">
                {logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="log-entry">
                    <div className="log-date">
                      {new Date(log.taken_at).toLocaleDateString()}
                    </div>
                    <div className="log-action">Medication taken</div>
                    {log.photo_url && (
                      <div className="log-photo">
                        <img
                          src={log.photo_url || "/placeholder.svg"}
                          alt="Medication proof"
                          className="proof-photo"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Medication"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicationDetailsModal;
