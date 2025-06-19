"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FormInput from "../UI/FormInput";
import Button from "../UI/Button";
import ErrorMessage from "../UI/ErrorMessage";
import "./Auth.css";

function Login() {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = "Username or email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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

    // Clear error when user starts typing
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

    const result = await login(formData.usernameOrEmail, formData.password);
    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back!</h2>
          <p className="auth-subtitle">Sign in to your MedTracker account</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label="Username or Email"
            type="text"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            error={errors.usernameOrEmail}
            placeholder="Enter your username or email"
            required
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="auth-footer">
          <p className="auth-link">
            Don't have an account? <Link to="/signup">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
