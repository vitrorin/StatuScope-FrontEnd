import { useState } from 'react'
import './components.css'

function LoginCard({ defaultRole = 'doctor' }) {
  const [role, setRole] = useState(defaultRole)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  return (
    <div className="login-card">
      {/* Form side */}
      <div className="login-form-side">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">SS</div>
          <div className="login-logo-text">
            <div className="login-logo-name">StatusScope</div>
            <div className="login-logo-sub">The Medical Radar</div>
          </div>
        </div>

        <h1 className="login-title">Welcome Again!</h1>
        <p className="login-subtitle">Please enter your credentials to access the system</p>

        {/* Role toggle */}
        <div className="login-label">Login as</div>
        <div className="login-tabs">
          <button
            className={`login-tab ${role === 'doctor' ? 'active' : ''}`}
            onClick={() => setRole('doctor')}
          >
            Doctor
          </button>
          <button
            className={`login-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            Administrator
          </button>
        </div>

        {/* Email */}
        <div className="login-field">
          <div className="login-field-label">Email:</div>
          <div className="login-input-wrap">
            <span className="login-input-icon">✉</span>
            <input
              className="login-input"
              type="email"
              placeholder="name@hospital.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="login-field">
          <div className="login-field-label">
            Password
            <a href="#">Forgot my password?</a>
          </div>
          <div className="login-input-wrap">
            <span className="login-input-icon">🔒</span>
            <input
              className="login-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
            />
            <button
              className="login-input-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* Remember */}
        <label className="login-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember(!remember)}
          />
          Remember me on this device
        </label>

        {/* Submit */}
        <button className="login-btn">
          Login to the system →
        </button>

        {/* Footer */}
        <div className="login-footer">
          🔒 Secure Healthcare Platform • HIPAA Compliant
        </div>
      </div>

      {/* Blue panel */}
      <div className="login-panel">
        <div className="login-panel-metric">
          <div className="login-panel-metric-label">AI Score Medical</div>
          <div className="login-panel-metric-value">98.2%</div>
        </div>
        <div className="login-panel-metric">
          <div className="login-panel-metric-label">Resource Alloc.</div>
          <div className="login-panel-metric-value" style={{ fontSize: 16, color: '#4ade80' }}>OPTIMAL</div>
        </div>
        <div className="login-panel-metric">
          <div className="login-panel-metric-label">Patient Flow</div>
          <div className="login-panel-metric-value">+12.4%</div>
        </div>
        <div className="login-panel-title">Real-time medical diagnostics</div>
        <div className="login-panel-desc">
          We support healthcare professionals with predictive analytics and accurate patient tracking across all departments.
        </div>
      </div>
    </div>
  )
}

export default LoginCard
