import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { FileUploadDropzone } from '../../components/inputs/FileUploadDropzone';

const meta = {
  title: 'Inputs/FileUploadDropzone',
  component: FileUploadDropzone,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ maxWidth: 400 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof FileUploadDropzone>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    label: 'Lab Results & Imaging',
    description: 'Drag and drop files here or',
    supportedFormats: 'PDF, JPG, PNG',
    maxSizeText: 'Max file size: 10MB',
    state: 'empty',
  },
};

export const Dragging: Story = {
  args: {
    label: 'Lab Results & Imaging',
    description: 'Drag and drop files here or',
    supportedFormats: 'PDF, JPG, PNG',
    maxSizeText: 'Max file size: 10MB',
    state: 'dragging',
  },
};

export const Uploaded: Story = {
  args: {
    label: 'Lab Results & Imaging',
    description: 'Drag and drop files here or',
    supportedFormats: 'PDF, JPG, PNG',
    maxSizeText: 'Max file size: 10MB',
    state: 'uploaded',
    fileName: 'blood_test_results_2024.pdf',
  },
};

export const Error: Story = {
  args: {
    label: 'Lab Results & Imaging',
    description: 'Drag and drop files here or',
    supportedFormats: 'PDF, JPG, PNG',
    maxSizeText: 'Max file size: 10MB',
    state: 'error',
    error: 'File too large. Maximum size is 10MB.',
  },
};