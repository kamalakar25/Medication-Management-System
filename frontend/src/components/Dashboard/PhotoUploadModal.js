"use client";

import { useState } from "react";
import Button from "../UI/Button";
import ErrorMessage from "../UI/ErrorMessage";
import "./AddMedicationModal.css";

function PhotoUploadModal({ medication, onClose, onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setSelectedFile(file);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a photo");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onUpload(selectedFile);
    } catch (err) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkWithoutPhoto = async () => {
    try {
      setLoading(true);
      setError("");
      await onUpload(null);
    } catch (err) {
      setError(err.message || "Failed to mark medication as taken");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mark {medication.name} as Taken</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <ErrorMessage message={error} />}

          <div className="photo-upload-section">
            <p className="upload-description">
              You can optionally upload a photo as proof that you took your
              medication.
            </p>

            <div className="file-input-container">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
              />
              <label htmlFor="photo-upload" className="file-input-label">
                📷 Choose Photo
              </label>
            </div>

            {preview && (
              <div className="photo-preview">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="preview-image"
                />
              </div>
            )}
          </div>

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
              type="button"
              variant="outline"
              onClick={handleMarkWithoutPhoto}
              disabled={loading}
            >
              Mark Without Photo
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleUpload}
              loading={loading}
              disabled={loading || !selectedFile}
            >
              {loading ? "Uploading..." : "Mark with Photo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoUploadModal;
