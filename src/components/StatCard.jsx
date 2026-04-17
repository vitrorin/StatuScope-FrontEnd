import './components.css'

const badgeColor = {
  green: 'green',
  red: 'red',
  orange: 'orange',
  blue: 'blue',
  moderate: 'orange',
}

function StatCard({ label, value, sublabel, badge, badgeVariant = 'green', variant = 'default' }) {
  return (
    <div className={`stat-card ${variant === 'risk' ? 'risk' : ''}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {badge && (
          <span className={`stat-badge ${badgeColor[badgeVariant] || 'green'}`}>
            {badge}
          </span>
        )}
      </div>
      <div className={`stat-card-value ${typeof value === 'string' && value.length > 8 ? 'large-text' : ''}`}>
        {value}
      </div>
      {sublabel && <div className="stat-card-sublabel">{sublabel}</div>}
    </div>
  )
}

export default StatCard
