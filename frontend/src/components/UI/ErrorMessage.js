"use client";
import "./ErrorMessage.css";

function ErrorMessage({ message, onClose }) {
  return (
    <div className="error-message">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
        {onClose && (
          <button className="error-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
