import "./LoadingSpinner.css";

function LoadingSpinner({ size = "medium", message = "Loading..." }) {
  return (
    <div className="loading-container">
      <div className={`spinner spinner-${size}`}></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
