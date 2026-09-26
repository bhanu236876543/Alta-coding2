import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Backend returned an invalid response. Status: ${response.status}`,
        );
      }

      console.log("Login response:", response.status, data);

      if (!response.ok) {
        alert(data.message || `Login failed. Status: ${response.status}`);
        return;
      }

      if (!data.token || !data.user) {
        alert("Login response is missing token or user information.");
        return;
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);

      if (data.user.role === "student") {
        navigate("/student");
      } else if (data.user.role === "faculty") {
        navigate("/faculty");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Complete login error:", error);
      alert(`Login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>&lt;/&gt;</span> CodeForge
        </div>

        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue solving problems.</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="forgot">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          className="google-btn"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
          }}
        >
          Continue with Google
        </button>

        <p className="auth-bottom">
          Don't have an account?
          <a href="/register"> Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
