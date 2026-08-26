import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const enteredPassword = password.trim();
    const adminPassword =
      import.meta.env.VITE_ADMIN_PASSWORD;

    if (!enteredPassword) {
      setError("Password is required.");
      return;
    }

    if (!adminPassword) {
      setError("Admin password is not configured.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (enteredPassword !== adminPassword) {
        setError("Incorrect password.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem(
        "admin_logged_in",
        "true"
      );

      navigate("/admin/panel", {
        replace: true,
      });

      setLoading(false);
    }, 300);
  }

  return (
    <main className="login-page">

      <div className="login-background-glow" />

      <section className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <img
            src="/icon.png"
            alt="OEP RAIMS"
          />
        </div>

        {/* Heading */}
        <div className="login-heading">
          <span>OEP RAIMS</span>

          <h1>Admin Panel</h1>

          <p>
            Verification Management
          </p>
        </div>

        {/* Form */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <label htmlFor="password">
            Admin Password
          </label>

          <div
            className={`password-input ${
              error ? "has-error" : ""
            }`}
          >

            <LockKeyhole
              size={17}
              strokeWidth={1.8}
            />

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            <button
              type="button"
              className="password-toggle"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              disabled={loading}
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            <span>
              {loading
                ? "Checking..."
                : "Login"}
            </span>

            {!loading && (
              <ArrowRight size={16} />
            )}
          </button>

        </form>

        {/* Footer */}
        <div className="login-footer">
          <ShieldCheck
            size={13}
            strokeWidth={2}
          />

          <span>
            Authorized access only
          </span>
        </div>

      </section>

      <p className="login-copyright">
        OEP RAIMS · Verification System
      </p>

    </main>
  );
}