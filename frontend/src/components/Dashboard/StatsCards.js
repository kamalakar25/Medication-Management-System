import "./StatsCards.css";

function StatsCards({ stats }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">💊</div>
        <div className="stat-content">
          <h3 className="stat-number">{stats.totalMedications}</h3>
          <p className="stat-label">Total Medications</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <h3 className="stat-number">{stats.takenToday}</h3>
          <p className="stat-label">Taken Today</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3 className="stat-number">{stats.adherenceRate}%</h3>
          <p className="stat-label">Adherence Rate</p>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
