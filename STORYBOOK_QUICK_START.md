# 🚀 Storybook - Quick Start

## En 3 minutos

### 1. Instalar
```bash
npm install
```

### 2. Iniciar Storybook
```bash
npm run storybook
```
→ Abre **http://localhost:6006**

### 3. Ver tus componentes
- Navega por la barra lateral izquierda
- Cada archivo `.stories.tsx` aparece como una story
- Prueba interactuar con los controles (Controls tab)

---

## 📂 Dónde están las stories?

Hay dos lugares:

1. **`/stories/*.stories.tsx`** - Stories manuales (pantallas, features)
2. **`/components/**/*.stories.tsx`** - Stories de componentes individuales

---

## ✨ Crear una nueva story

### Opción A: Generación Automática (Recomendado)
```bash
npm run storybook-generate
```
Lee `/components` y crea `.stories.tsx` automáticamente.

### Opción B: Manualmente
Crea `components/MyComponent/MyComponent.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import MyComponent from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
```

---

## 🔗 Estructura de Títulos

Usa `/` para organizar categorías:

```typescript
title: 'Foundation/Colors'       // Categoría: Foundation
title: 'Forms/Input/TextInput'   // Categoría: Forms > Input
title: 'Dashboard/Cards'         // Categoría: Dashboard
```

---

## 🎨 Agregar decorators (Gluestack, etc.)

En `.storybook/preview.ts`:

```typescript
import { GluestackUIProvider } from '@gluestack-ui/core';
import { config } from '@gluestack-ui/config';

const preview: Preview = {
  decorators: [
    (Story) => (
      <GluestackUIProvider config={config}>
        <Story />
      </GluestackUIProvider>
    ),
  ],
};

export default preview;
```

---

## 🛠️ Troubleshooting

| Problema | Solución |
|----------|----------|
| Stories no aparecen | Verifica `.storybook/main.ts` glob patterns |
| Componente no renderiza | Abre DevTools (F12), revisa consola |
| Puerto 6006 ocupado | `npx storybook dev -p 6007` |
| Cache corrupto | `rm -rf node_modules/.cache/storybook` |

---

## 📖 Archivos Clave

- `.storybook/main.ts` - Configuración principal
- `.storybook/preview.ts` - Decorators, providers
- `stories/` - Stories manuales
- `components/` - Componentes con sus stories

---

## 📚 Más Info

Ver [STORYBOOK_SETUP.md](./STORYBOOK_SETUP.md) para guía completa.
