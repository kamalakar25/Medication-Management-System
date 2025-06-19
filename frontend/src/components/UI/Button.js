"use client";
import "./Button.css";

function Button({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const className = `btn btn-${variant} btn-${size} ${
    fullWidth ? "btn-full-width" : ""
  } ${loading ? "btn-loading" : ""}`;

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn-spinner"></span> : children}
    </button>
  );
}

export default Button;
