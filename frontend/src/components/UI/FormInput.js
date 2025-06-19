"use client";
import "./FormInput.css";

function FormInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  ...props
}) {
  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${error ? "error" : ""}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default FormInput;
