/**
 * EmptyState Component Tests
 *
 * Tests for the EmptyState UI component.
 * Validates rendering modes, custom content, actions, and compact variant.
 *
 * Run with: npx vitest run __tests__/components/ui/EmptyState.test.tsx
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders default "no-data" content when no props given', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
    expect(screen.getByText('Data will appear here once available.')).toBeInTheDocument();
  });

  it('renders correct content for each type', () => {
    const types = [
      { type: 'no-results' as const, title: 'No results found' },
      { type: 'no-tasks' as const, title: 'No tasks in queue' },
      { type: 'no-agents' as const, title: 'No agents online' },
      { type: 'no-messages' as const, title: 'No messages yet' },
      { type: 'no-notifications' as const, title: 'All caught up!' },
    ];

    types.forEach(({ type, title }) => {
      const { unmount } = render(<EmptyState type={type} />);
      expect(screen.getByText(title)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders custom title and description', () => {
    render(
      <EmptyState
        title="Custom Title"
        description="Custom description text"
      />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        action={{ label: 'Create Task', onClick }}
      />
    );

    const button = screen.getByRole('button', { name: 'Create Task' });
    expect(button).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EmptyState
        action={{ label: 'Create Task', onClick }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Create Task' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders compact variant with reduced padding', () => {
    const { container } = render(<EmptyState compact />);
    // Compact uses py-6 instead of py-12
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain('py-6');
    expect(wrapper.className).not.toContain('py-12');
  });

  it('renders compact variant without description', () => {
    render(<EmptyState compact />);
    // Compact variant only shows title, not description
    expect(screen.getByText('No data yet')).toBeInTheDocument();
    expect(screen.queryByText('Data will appear here once available.')).not.toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(
      <EmptyState
        icon={<span data-testid="custom-icon">🎯</span>}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
