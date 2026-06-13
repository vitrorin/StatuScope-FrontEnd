import type { StorybookConfig } from '@storybook/react-native-web-vite';
import { mergeConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/react-native-web-vite",
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          'expo-router': path.resolve(storybookDir, 'mocks/expo-router.tsx'),
          '@/contexts/AuthContext': path.resolve(storybookDir, 'mocks/AuthContext.tsx'),
          '@/lib/api': path.resolve(storybookDir, 'mocks/api.ts'),
          '@/lib/adminOperational': path.resolve(storybookDir, 'mocks/adminOperational.ts'),
          '@/lib/adminUsers': path.resolve(storybookDir, 'mocks/adminUsers.ts'),
          '@/lib/diagnosisAssistant': path.resolve(storybookDir, 'mocks/diagnosisAssistant.ts'),
          '@/lib/diagnosisDiseases': path.resolve(storybookDir, 'mocks/diagnosisDiseases.ts'),
          '@/lib/diagnosisEvaluation': path.resolve(storybookDir, 'mocks/diagnosisEvaluation.ts'),
          '@/lib/doctorDashboard': path.resolve(storybookDir, 'mocks/doctorDashboard.ts'),
          '@/lib/systemAdmin': path.resolve(storybookDir, 'mocks/systemAdmin.ts'),
        },
      },
    });
  },
};
export default config;
