"use client";

import { useState } from "react";
import FormInput from "../UI/FormInput";
import Button from "../UI/Button";
import ErrorMessage from "../UI/ErrorMessage";
import "./AddMedicationModal.css";

function AddPatientModal({ onClose, onAdd }) {
  const [patientUsername, setPatientUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientUsername.trim()) {
      setError("Patient username is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onAdd(patientUsername.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Patient</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Patient Username"
              name="patientUsername"
              value={patientUsername}
              onChange={(e) => setPatientUsername(e.target.value)}
              placeholder="Enter patient's username"
              required
            />

            <div className="modal-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Patient"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPatientModal;
