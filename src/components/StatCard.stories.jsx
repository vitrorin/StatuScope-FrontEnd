import StatCard from './StatCard'

export default {
  title: 'StatusScope/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
}

export const ActiveCases = {
  args: {
    label: 'Active Cases Nearby',
    value: '1,284',
    sublabel: '',
    badge: '+2%',
    badgeVariant: 'green',
  },
}

export const FastestGrowingDisease = {
  args: {
    label: 'Fastest Growing Disease',
    value: 'Influenza',
    sublabel: 'in Population compared for last 48h',
    badge: '+26%',
    badgeVariant: 'red',
  },
}

export const LocalRiskLevel = {
  args: {
    label: 'Local Risk Level',
    value: '3 active clusters detected',
    sublabel: '',
    badge: 'Moderate',
    badgeVariant: 'orange',
    variant: 'risk',
  },
}

export const NoAlert = {
  args: {
    label: 'Active Cases Nearby',
    value: '0',
    sublabel: 'No incidents reported',
    badge: '0%',
    badgeVariant: 'blue',
  },
}
