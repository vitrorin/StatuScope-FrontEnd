# 📖 Setup Storybook - StatuScope Frontend

## Estado Actual
Este es un proyecto **Expo + React Native Web** con Storybook configurado para desarrollo de componentes en la web.

- **Framework**: React Native (Expo)
- **Storybook**: v10.3.5 con adaptador `@storybook/react-native-web-vite`
- **Stories**: Ubicadas en `/stories/**/*.stories.ts(x)`
- **Componentes**: Ubicados en `/components/**/*.tsx`

---

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar Storybook
```bash
npm run storybook
```
Abrirá en **http://localhost:6006**

### 3. Generar historias automáticamente
```bash
npm run storybook-generate
```
Esto escanea `/components` y crea `.stories.tsx` automáticamente.

---

## 📁 Estructura del Proyecto

```
.
├── .storybook/              # Configuración de Storybook
│   ├── main.ts             # Config principal (stories glob, addons, framework)
│   └── preview.ts          # Config de preview (decorators, parameters)
│
├── .rnstorybook/           # Config adicional para React Native
│
├── stories/                # Historias manuales
│   └── *.stories.tsx       # Archivos de stories
│
├── components/             # Componentes React Native
│   ├── *.tsx              # Componentes
│   └── *.stories.tsx      # Stories generadas automáticamente
│
├── app/                    # App router (Expo Router)
├── assets/                 # Imágenes, fuentes
├── constants/              # Constantes
│
├── app.json               # Configuración de Expo
├── babel.config.js        # Configuración de Babel
├── tsconfig.json          # Configuración de TypeScript
└── package.json           # Dependencias

```

---

## ✍️ Crear una Nueva Story

### Opción 1: Generación Automática (Recomendado)
```bash
# Crea un componente nuevo
# components/MyButton/MyButton.tsx

# Genera la story automáticamente
npm run storybook-generate
```

Esto crea `/components/MyButton/MyButton.stories.tsx`

### Opción 2: Story Manual

Crea `components/MyButton/MyButton.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import MyButton from './MyButton';

const meta: Meta<typeof MyButton> = {
  title: 'Components/MyButton',
  component: MyButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Press me',
    onPress: () => console.log('Pressed!'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: {
    size: 'large',
  },
};
```

---

## 🎨 Archivos de Configuración

### `.storybook/main.ts`
Define dónde buscar stories y qué addons cargar.

```typescript
import type { StorybookConfig } from '@storybook/react-native-web-vite';

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"  // ← Busca aquí también
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/react-native-web-vite"
};
export default config;
```

### `.storybook/preview.ts`
Configura decorators, providers (Gluestack, React Navigation, etc.)

```typescript
import type { Preview } from '@storybook/react-native-web-vite'
import { GluestackUIProvider } from '@gluestack-ui/core';
import { config } from '@gluestack-ui/config';

const preview: Preview = {
  decorators: [
    // Envuelve todas las stories con Gluestack
    (Story) => (
      <GluestackUIProvider config={config}>
        <Story />
      </GluestackUIProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    }
  },
};

export default preview;
```

---

## 📝 Convenciones

### Nombres de Stories
```typescript
// ✅ Bueno
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
export const WithError: Story = { args: { error: 'Algo salió mal' } };

// ❌ Evitar
export const story1: Story = {};
export const Test: Story = {};
```

### Títulos de Componentes
```typescript
// Estructura: Category/SubCategory/ComponentName
title: 'Forms/Inputs/TextInput'
title: 'Navigation/TabBar'
title: 'Layout/Card'
```

---

## 🔧 Troubleshooting

### Stories no aparecen en Storybook
1. Verifica que el archivo termine en `.stories.tsx`
2. Verifica el glob pattern en `.storybook/main.ts`
3. Limpia el cache:
   ```bash
   rm -rf node_modules/.cache/storybook
   npm run storybook
   ```

### Componentes no renderean
1. Verifica que el componente exporte por defecto
2. Verifica que los decorators (Gluestack, etc.) estén en `preview.ts`
3. Abre DevTools (F12) y revisa los errores en la consola

### Puerto 6006 ocupado
```bash
# Ejecutar en puerto diferente
npx storybook dev -p 6007
```

### Tipos TypeScript no se reconocen
```bash
# Regenera tipos
npm run storybook-generate
```

---

## 📚 Recursos

- [Docs Storybook](https://storybook.js.org/docs/react)
- [React Native Storybook](https://storybook.js.org/docs/react-native)
- [Gluestack UI](https://gluestack.io/)
- [Expo Documentation](https://docs.expo.dev/)

---

## ⚡ Scripts Útiles

```bash
# Desarrollo
npm run storybook              # Inicia Storybook
npm run storybook-generate    # Genera stories automáticamente
npm run start                 # Inicia Expo (iOS/Android/Web)
npm run web                   # Inicia Expo Web

# Build
npm run build-storybook       # Build para producción
npm run android              # Build Android
npm run ios                  # Build iOS

# Lint & Format
npm run lint                 # ESLint
```

---

## 🎯 Próximos Pasos

1. **Crear primeros componentes**: Usa `npm run storybook-generate`
2. **Documentar con MDX**: Crea archivos `.mdx` en `/stories` para docs
3. **Integración con CI/CD**: Usa Chromatic para validar cambios visuales
4. **Tests**: Usa `@storybook/addon-vitest` para tests basados en stories
