"use client";

import { useState } from "react";
import FormInput from "../UI/FormInput";
import Button from "../UI/Button";
import ErrorMessage from "../UI/ErrorMessage";
import "./AddMedicationModal.css";

function AddMedicationModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Medication name is required";
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = "Dosage is required";
    }

    if (!formData.frequency.trim()) {
      newErrors.frequency = "Frequency is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onAdd(formData);
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
          <h2>Add New Medication</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Medication Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g., Ibuprofen"
              required
            />

            <FormInput
              label="Dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              error={errors.dosage}
              placeholder="e.g., 200mg, 1 tablet"
              required
            />

            <FormInput
              label="Frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              error={errors.frequency}
              placeholder="e.g., Once a day, Every 8 hours"
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
                {loading ? "Adding..." : "Add Medication"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddMedicationModal;
