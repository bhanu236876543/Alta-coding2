import React from "react";
import "./Home.css";
import Account from "./Account";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        {/* Logo */}
        <div className="logo">
          <span className="logo-icon">&lt;/&gt;</span>
          <span>CodeForge</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/questions">Problems</Link>
        </div>

        {/* Search */}
        <div className="search-box">
          <span>⌕</span>
          <input type="text" placeholder="Search problems..." />
        </div>

        {/* Right Side */}
        <div className="nav-actions">
          <a href="/login" className="login-btn">
            Login
          </a>

          <a href="/register" className="register-btn">
            Register
          </a>

          <Link to="/account" className="account-btn">
            Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">&lt;/&gt; CODE. THINK. SOLVE.</div>

          <h1>
            Master the art of
            <span> problem solving.</span>
          </h1>

          <p className="hero-quote">
            "Great programmers aren't born.
            <br />
            They are built one problem at a time."
          </p>

          <p className="hero-description">
            Sharpen your coding skills, solve challenging problems, and prepare
            yourself for real-world technical interviews.
          </p>

          <div className="hero-buttons">
            <Link to="/questions" className="start-btn">
              Start Solving →
            </Link>

            <Link to="/questions" className="explore-btn">
              Explore Problems
            </Link>
          </div>
        </div>

        {/* Code Decoration */}
        <div className="code-card">
          <div className="code-header">
            <div className="dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <span>solution.cpp</span>
          </div>

          <div className="code-body">
            <p>
              <span className="keyword">class</span>{" "}
              <span className="class-name">Solution</span> {"{"}
            </p>

            <p className="indent">
              <span className="keyword">public:</span>
            </p>

            <p className="indent-2">
              <span className="keyword">int</span> solve(vector&lt;int&gt;&
              nums) {"{"}
            </p>

            <p className="indent-3">
              <span className="keyword">return</span>{" "}
              <span className="number">42</span>;
            </p>

            <p className="indent-2">{"}"}</p>

            <p>{"}"}</p>

            <p className="comment">// Keep solving. Keep improving.</p>
          </div>
        </div>
      </section>

      {/* Bottom Stats */}
      <section className="stats">
        <div className="stat">
          <h2>500+</h2>
          <p>Coding Problems</p>
        </div>

        <div className="stat">
          <h2>10+</h2>
          <p>Topics</p>
        </div>

        <div className="stat">
          <h2>∞</h2>
          <p>Learning Potential</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
