import './components.css'

function AlertItem({ title, description, severity = 'blue' }) {
  return (
    <div className="alert-item">
      <div className={`alert-dot ${severity}`} />
      <div className="alert-body">
        <div className="alert-title">{title}</div>
        <div className="alert-desc">{description}</div>
      </div>
    </div>
  )
}

export function AlertPanel({ title = 'Contextual Disease Alerts', alerts = [] }) {
  return (
    <div className="alert-panel">
      <div className="alert-panel-title">{title}</div>
      {alerts.map((alert, i) => (
        <AlertItem key={i} {...alert} />
      ))}
    </div>
  )
}

export default AlertItem
