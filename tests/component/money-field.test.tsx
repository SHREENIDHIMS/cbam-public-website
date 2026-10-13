import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MoneyField } from '@/components/shared/MoneyField';

function Harness({ error }: { error?: string }) {
  const [value, setValue] = useState<number | undefined>(undefined);
  return (
    <>
      <MoneyField
        id="amount"
        label="Amount"
        description="In pounds."
        value={value}
        onValueChange={setValue}
        error={error}
      />
      <output data-testid="value">{value === undefined ? 'none' : String(value)}</output>
    </>
  );
}

describe('MoneyField', () => {
  it('groups thousands as you type and reports a number', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Amount');
    await user.type(input, '1234567.891');
    expect(input).toHaveValue('1,234,567.89');
    expect(screen.getByTestId('value')).toHaveTextContent('1234567.89');
  });

  it('ignores letters and reports nothing when emptied', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Amount');
    await user.type(input, 'ab12c');
    expect(input).toHaveValue('12');
    await user.clear(input);
    expect(screen.getByTestId('value')).toHaveTextContent('none');
  });

  it('keeps editing in the middle of the number', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.type(input, '1000');
    await user.type(input, '5', { initialSelectionStart: 1, initialSelectionEnd: 1 });
    expect(input).toHaveValue('15,000');
    expect(input.selectionStart).toBe(2);
  });

  it('links the description and error to the field', () => {
    render(<Harness error="Enter an amount" />);
    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('In pounds. Enter an amount');
    expect(input).toHaveAttribute('inputmode', 'decimal');
  });
});
