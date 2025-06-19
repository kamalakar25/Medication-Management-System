"use client";

import "./PatientList.css";

function PatientList({ patients, onViewMedications }) {
  if (patients.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>No patients added yet</h3>
        <p>Click "Add Patient" to start managing patients' medications.</p>
      </div>
    );
  }

  return (
    <div className="patient-list">
      {patients.map((patient) => (
        <div key={patient.id} className="patient-card">
          <div className="patient-info">
            <h3 className="patient-name">{patient.username}</h3>
            <p className="patient-email">{patient.email}</p>
          </div>

          <div className="patient-actions">
            <button
              className="btn btn-primary btn-small"
              onClick={() => onViewMedications(patient)}
            >
              View Medications
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatientList;
