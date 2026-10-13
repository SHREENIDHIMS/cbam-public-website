import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorSummary } from '@/components/shared/ErrorSummary';
import { InlineFieldError } from '@/components/shared/InlineFieldError';

describe('state components', () => {
  it('uses the no-data copy by default', () => {
    render(<EmptyState />);
    expect(
      screen.getByText('Upload a customs file or run the quick estimate.'),
    ).toBeInTheDocument();
  });

  it('renders nothing for an empty field error and an alert otherwise', () => {
    const { rerender, container } = render(<InlineFieldError id="e" message={undefined} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<InlineFieldError id="e" message="Enter a valid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
  });

  it('links error summary entries to their fields', () => {
    render(
      <ErrorSummary
        title="There is a problem"
        issues={[{ fieldId: 'email', message: 'Enter an email' }]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Enter an email' })).toHaveAttribute('href', '#email');
  });
});
