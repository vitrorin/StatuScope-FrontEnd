import AlertItem, { AlertPanel } from './AlertItem'

export default {
  title: 'StatusScope/AlertItem',
  component: AlertItem,
  parameters: {
    layout: 'centered',
  },
}

export const InfluenzaSpike = {
  args: {
    title: 'Influenza Spike',
    description: 'Confirmed 45% increase in pediatric ward in the last 6 hours.',
    severity: 'red',
  },
}

export const DengueRiskAlert = {
  args: {
    title: 'Dengue Risk Alert',
    description: '7 suspected dengue cases occurred within 3km radius today.',
    severity: 'orange',
  },
}

export const VaccineSupplyUpdate = {
  args: {
    title: 'Vaccine Supply Update',
    description: 'New shipment of Modern booster arrived at nearby pharmacy. Lot #.',
    severity: 'blue',
  },
}

export const NewEpidemiologicalPattern = {
  args: {
    title: 'New Epidemiological Pattern',
    description: 'Unusual increase in patterns detected.',
    severity: 'green',
  },
}

export const FullPanel = {
  render: () => (
    <AlertPanel
      title="Contextual Disease Alerts"
      alerts={[
        {
          title: 'Influenza Spike',
          description: 'Confirmed 45% increase in pediatric ward in the last 6 hours.',
          severity: 'red',
        },
        {
          title: 'Dengue Risk Alert',
          description: '7 suspected dengue cases occurred within 3km radius today.',
          severity: 'orange',
        },
        {
          title: 'Vaccine Supply Update',
          description: 'New shipment of Moderna booster arrived at nearby pharmacy.',
          severity: 'blue',
        },
        {
          title: 'New Epidemiological Pattern',
          description: 'Unusual increase in patterns detected.',
          severity: 'green',
        },
      ]}
    />
  ),
}
