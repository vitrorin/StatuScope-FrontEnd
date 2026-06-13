import React from 'react';
import { Text, TextProps } from 'react-native';

export type Href<T = string> = T;

const router = {
  push: () => undefined,
  replace: () => undefined,
  back: () => undefined,
  canGoBack: () => false,
  setParams: () => undefined,
};

export function useRouter() {
  return router;
}

export function useLocalSearchParams() {
  return {};
}

export function useSegments() {
  return [];
}

export function Link({ children, style }: TextProps & { href?: string; target?: string }) {
  return <Text style={style}>{children}</Text>;
}
