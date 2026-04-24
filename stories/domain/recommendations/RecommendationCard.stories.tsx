import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { RecommendationCard } from '../../../components/recommendations/RecommendationCard';

const meta = {
  title: 'Domain/Recommendations/RecommendationCard',
  component: RecommendationCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RecommendationCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HighUrgency: Story = {
  args: {
    severity: 'high',
    category: 'RESPIRATORY SURGE ALERT',
    title: 'Recommendation Card',
    description: 'Projection: 30% increase in respiratory patients tonight. Prepare 3 additional beds in Ward 4.',
    metaItems: [
      { label: '14 mins ago' },
      { label: 'Resource Team B' },
    ],
    actions: [
      { label: 'Assign task', variant: 'primary' },
      { label: 'Notify staff', variant: 'secondary' },
      { label: 'Order supplies', variant: 'ghost' },
    ],
    imageMode: 'heatmap',
  },
};

export const MediumPriority: Story = {
  args: {
    severity: 'medium',
    category: 'Resource Optimization',
    title: 'Recommendation Card',
    description: 'Emergency department showing 15% above capacity. Recommend temporary reallocation from outpatient clinic.',
    metaItems: [
      { label: '1 hour ago' },
      { label: 'HR Admin' },
    ],
    actions: [
      { label: 'Assign Task', variant: 'secondary' },
      { label: 'Notify Staff', variant: 'secondary' },
    ],
    imageMode: 'chart',
  },
};

export const LowPriority: Story = {
  args: {
    severity: 'low',
    category: 'Supply Chain',
    title: 'Recommendation Card',
    description: 'Paracetamol stock running low at Pharmacy Unit B. Next scheduled delivery in 3 days.',
    metaItems: [
      { label: '3 hours ago' },
      { label: 'Supply Chain' },
    ],
    actions: [
      { label: 'Order Supplies', variant: 'secondary' },
    ],
    imageMode: 'supply',
  },
};

export const WithThreeActions: Story = {
  args: {
    severity: 'high',
    category: 'Outbreak Alert',
    title: 'Recommendation Card',
    description: '3 new confirmed cases in Zone 4. Recommend vector control deployment and community awareness campaign.',
    metaItems: [
      { label: '25 mins ago' },
      { label: 'Vector Control' },
    ],
    actions: [
      { label: 'Assign Task', variant: 'primary' },
      { label: 'Notify Staff', variant: 'secondary' },
      { label: 'Dismiss', variant: 'ghost' },
    ],
    imageMode: 'heatmap',
  },
};

export const CompactVersion: Story = {
  args: {
    severity: 'medium',
    category: 'Maintenance',
    title: 'Recommendation Card',
    description: 'Blood analyzer requires quarterly calibration. Schedule maintenance window.',
    metaItems: [
      { label: '2 days ago' },
      { label: 'Biomedical' },
    ],
    imageMode: 'placeholder',
  },
};
