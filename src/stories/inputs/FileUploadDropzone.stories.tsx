import type { Meta, StoryObj } from '@storybook/react';
import { FileUploadDropzone } from '../../components/inputs/FileUploadDropzone';

const meta = {
  title: 'Inputs/FileUploadDropzone',
  component: FileUploadDropzone,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-md"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof FileUploadDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  label: 'Lab Results & Imaging',
  description: 'Drag and drop files here or',
  supportedFormats: 'PDF, JPG, PNG',
  maxSizeText: 'Max file size: 10MB',
};

export const Empty: Story = { args: { ...baseArgs, state: 'empty' } };
export const Dragging: Story = { args: { ...baseArgs, state: 'dragging' } };
export const Uploaded: Story = { args: { ...baseArgs, state: 'uploaded', fileName: 'blood_test_results_2024.pdf' } };
export const Error: Story = { args: { ...baseArgs, state: 'error', error: 'File too large. Maximum size is 10MB.' } };
