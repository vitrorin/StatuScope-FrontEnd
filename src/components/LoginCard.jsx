import { useState } from 'react'
import './components.css'

function LoginCard({ onSubmit, loading = false, error = null }) {
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) onSubmit(email, password)
  }

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

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="login-field">
            <div className="login-field-label">Email:</div>
            <div className="login-input-wrap">
              <span className="login-input-icon">✉</span>
              <input
                className="login-input"
                type="email"
                placeholder="name@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <div className="login-field-label">
              Password
            </div>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
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

          {/* Error */}
          {error && (
            <p style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</p>
          )}

          {/* Submit */}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Login to the system →'}
          </button>
        </form>

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
