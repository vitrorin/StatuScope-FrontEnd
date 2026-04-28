# 📐 Estructura del Proyecto StatuScope Frontend

## 🎯 Overview
- **Tipo**: React Native App con Expo + Web (Storybook)
- **State Management**: Contexto + Redux (Firebase)
- **UI Framework**: Gluestack UI + NativeWind
- **Storybook**: v10.3.5 para desarrollo de componentes
- **Testing**: Vitest + Playwright

---

## 📁 Estructura de Carpetas

```
StatuScope-FrontEnd/
├── .storybook/                 # Configuración Storybook
│   ├── main.ts                # Config principal (stories glob, addons)
│   └── preview.ts             # Config de preview (decorators)
│
├── .rnstorybook/              # Config adicional para React Native
│
├── app/                        # Expo Router (Rutas)
│   ├── (auth)/                # Grupo de rutas autenticadas
│   ├── (tabs)/                # Rutas con tabs (admin, doctor)
│   ├── index.tsx              # Ruta inicial
│   └── ...
│
├── components/                 # Componentes reutilizables
│   ├── auth/                  # Componentes de autenticación
│   ├── dashboard/             # Dashboard components
│   ├── diagnosis/             # Diagnosis components
│   ├── feedback/              # Feedback components
│   ├── foundation/            # Foundation/Design System
│   ├── inputs/                # Input components
│   ├── layout/                # Layout components
│   └── views/                 # Vistas completas (pantallas)
│       ├── admin/
│       │   └── dashboard/
│       └── doctor/
│           └── dashboard/
│
├── stories/                    # Stories manuales (Storybook)
│   ├── *.stories.tsx          # Stories de vistas/features
│   └── ...
│
├── assets/                     # Recursos estáticos
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── constants/                  # Constantes globales
│   ├── colors.ts
│   ├── sizing.ts
│   ├── typography.ts
│   └── ...
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useNavigation.ts
│   └── ...
│
├── services/                   # Servicios (API, Firebase, etc.)
│   ├── api/
│   ├── auth/
│   ├── database/
│   └── firebase/
│
├── store/                      # Redux / State Management
│   ├── slices/
│   ├── index.ts
│   └── ...
│
├── utils/                      # Utilidades y helpers
│   ├── formatting.ts
│   ├── validation.ts
│   └── ...
│
├── app.json                   # Configuración de Expo
├── babel.config.js            # Config Babel
├── tsconfig.json              # Config TypeScript
├── tailwind.config.js         # Config Tailwind CSS
├── package.json               # Dependencias
│
├── STORYBOOK_SETUP.md         # 📖 Guía de setup (detallada)
├── STORYBOOK_QUICK_START.md   # 🚀 Quick start
├── PROJECT_STRUCTURE.md       # Este archivo
└── README.md                  # Info general

```

---

## 🏗️ Arquitectura de Componentes

### Niveles de Componentes

```
┌─────────────────────────────────┐
│     Vistas (Views)              │  ← Pantallas completas
│  (AdminDashboard, DoctorLogin)  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Contenedores (Containers)     │  ← Lógica + Presentación
│    (Cards, Lists, Sections)     │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Componentes Reutilizables     │  ← Bloques base
│    (Button, Input, Label)       │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Foundation / Design System    │  ← Tokens, Colors
│    (Colors, Typography, Icons)  │
└─────────────────────────────────┘
```

### Estructura de una Vista

```typescript
// components/views/admin/dashboard/index.tsx
import { View, Text } from 'react-native';
import Header from '@/components/layout/Header';
import DataCard from '@/components/dashboard/DataCard';
import { useAuth } from '@/hooks/useAuth';

export function AdminDashboard() {
  const { user } = useAuth();
  
  return (
    <View className="flex-1 bg-white">
      <Header title="Dashboard" />
      <DataCard title="Stats" value={42} />
    </View>
  );
}
```

### Story de una Vista

```typescript
// stories/AdminDashboard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminDashboard } from '@/components/views/admin/dashboard';

const meta = {
  title: 'Views/Admin/Dashboard',
  component: AdminDashboard,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
```

---

## 🎨 Design System

### Colores (`constants/colors.ts`)
```typescript
export const COLORS = {
  primary: '#1B1BF0',      // Azul
  success: '#22C55E',      // Verde
  error: '#EF4444',        // Rojo
  warning: '#F59E0B',      // Naranja
  background: '#F4F5F7',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
};
```

### Tipografía (`constants/typography.ts`)
```typescript
export const TYPOGRAPHY = {
  h1: { size: 32, weight: '700' },
  h2: { size: 28, weight: '700' },
  body: { size: 16, weight: '400' },
  small: { size: 12, weight: '500' },
};
```

### Espaciado (Tailwind)
```typescript
// Usa Tailwind classes
<View className="p-4 mb-2">
  <Text className="text-lg font-bold">Title</Text>
</View>
```

---

## 🔄 Rutas (Expo Router)

```
app/
├── (auth)/          # Rutas sin autenticación
│   ├── login/
│   ├── register/
│   └── forgot-password/
│
└── (tabs)/          # Rutas con autenticación
    ├── (admin)/     # Tab de admin
    │   ├── dashboard/
    │   ├── analytics/
    │   └── users/
    │
    └── (doctor)/    # Tab de doctor
        ├── dashboard/
        ├── patients/
        └── appointments/
```

---

## 🔐 Autenticación

### Flow
1. Usuario inicia sesión en `/login`
2. Se guarda token en AsyncStorage
3. Se carga contexto de autenticación
4. Se redirige a `/dashboard` (admin o doctor)

### Estructura
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { user, isLoading } = useContext(AuthContext);
  return { user, isLoading };
}

// Usar en componentes
const MyComponent = () => {
  const { user } = useAuth();
  return <Text>{user.role}</Text>;
};
```

---

## 📦 Dependencias Principales

| Librería | Propósito |
|----------|-----------|
| `expo` | Framework React Native |
| `expo-router` | Routing |
| `react-native` | Core library |
| `react-native-web` | Web support |
| `@gluestack-ui/core` | UI Components |
| `nativewind` | Tailwind CSS |
| `firebase` | Backend |
| `storybook` | Component development |
| `vitest` | Testing |

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start              # Inicia Expo
npm run web            # Inicia en navegador
npm run storybook      # Inicia Storybook

# Generación
npm run storybook-generate  # Genera stories automáticamente

# Build
npm run build-storybook    # Build Storybook
npm run android            # Build Android
npm run ios                # Build iOS

# Linting
npm run lint           # ESLint
```

---

## 📖 Documentación

Archivos importantes:
- **STORYBOOK_QUICK_START.md** ← Lee esto primero
- **STORYBOOK_SETUP.md** ← Guía completa
- **AUTH_WIRING_PLAN.md** ← Plan de autenticación
- **ARCHITECTURE.md** ← Decisiones de arquitectura

---

## 💡 Tips

1. **Componentes**: Siempre crea una story cuando hagas un componente nuevo
2. **Rutas**: Usa pathnames en lugar de indices (`/admin/dashboard` no `/admin/0`)
3. **Tipos**: Aprovecha TypeScript para type safety
4. **Testing**: Escribe tests mientras desarrollas en Storybook
5. **Design**: Consulta `constants/` para colores, tamaños, etc.

---

## 🔧 Configuración Común

### Agregar un Decorator (Provider Global)
```typescript
// .storybook/preview.ts
import MyProvider from '@/context/MyProvider';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MyProvider>
        <Story />
      </MyProvider>
    ),
  ],
};
```

### Cambiar Glob de Stories
```typescript
// .storybook/main.ts
const config: StorybookConfig = {
  stories: [
    "../stories/**/*.stories.tsx",
    "../components/**/*.stories.tsx",  // Agregar esto
  ],
};
```

---

Última actualización: 2025-04-28
