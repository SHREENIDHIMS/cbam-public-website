import { fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ColumnMapper } from '@/components/tools/ColumnMapper';
import { applyManualChange, suggestMapping } from '@/lib/upload/column-matching';
import type { Cell, ColumnChoice } from '@/lib/upload/types';
import { renderWithMantine } from '../utils/render';

const HEADERS = ['Supplier', 'Comodity code', 'Origin', 'Net mass', 'Customs value', 'Import date'];
const ROWS: { rowNumber: number; cells: Cell[] }[] = [
  {
    rowNumber: 2,
    cells: ['Atlas Metals', '7208390000', 'IN', '48000', '31800', '2027-01-12'],
  },
];

function Harness() {
  const [mapping, setMapping] = useState(suggestMapping(HEADERS, ROWS));
  const [announcement, setAnnouncement] = useState('');
  return (
    <ColumnMapper
      mapping={mapping}
      rows={ROWS}
      massUnit="kg"
      onMassUnit={() => {}}
      askMassUnit
      announcement={announcement}
      onReset={() => {}}
      onChange={(index: number, choice: ColumnChoice) => {
        const result = applyManualChange(mapping, index, choice);
        setMapping(result.mapping);
        setAnnouncement(result.moved ? `${result.moved.field} moved` : 'changed');
      }}
    />
  );
}

describe('ColumnMapper', () => {
  it('shows confidence text for every column, including a possible match', () => {
    renderWithMantine(<Harness />);
    expect(screen.getAllByText(/High match/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Possible match/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Close spelling of 'commodity code'/)).toBeInTheDocument();
  });

  it('moves a field when it is chosen for another column and announces it', () => {
    renderWithMantine(<Harness />);
    const origin = screen.getByLabelText('Read column "Origin" as') as HTMLSelectElement;
    fireEvent.change(origin, { target: { value: 'supplier' } });
    expect(origin.value).toBe('supplier');
    expect((screen.getByLabelText('Read column "Supplier" as') as HTMLSelectElement).value).toBe(
      'ignore',
    );
    expect(screen.getByRole('status')).toHaveTextContent('supplier moved');
  });

  it('flags a required field with no column', () => {
    renderWithMantine(<Harness />);
    fireEvent.change(screen.getByLabelText('Read column "Comodity code" as'), {
      target: { value: 'ignore' },
    });
    expect(screen.getByText(/Commodity code/, { selector: 'li' })).toHaveTextContent(
      'still needs a column',
    );
  });

  it('asks for the mass unit', () => {
    renderWithMantine(<Harness />);
    expect(screen.getByText(/as kilograms unless a cell says otherwise/)).toBeInTheDocument();
  });
});
