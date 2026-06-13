import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, vi } from '@/__tests__/helpers/jestCompat';
import { Button } from '@/components/foundation/Button';

describe('Button', () => {
  it('renders the provided label', async () => {
    const screen = await render(<Button label="Save changes" onPress={vi.fn()} />);

    expect(screen.getByText('Save changes')).toBeTruthy();
  });

  it('calls onPress when enabled', async () => {
    const onPress = vi.fn();
    const screen = await render(<Button label="Submit" onPress={onPress} />);

    fireEvent.press(screen.getByText('Submit'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = vi.fn();
    const screen = await render(<Button label="Submit" onPress={onPress} disabled />);

    fireEvent.press(screen.getByText('Submit'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
