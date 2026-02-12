/**
 * StatusBadge Component Tests
 *
 * Tests for the StatusBadge and StatusDot UI components.
 * Validates rendering, status variants, size options, and accessibility.
 *
 * Run with: npx vitest run __tests__/components/ui/StatusBadge.test.tsx
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, StatusDot } from '@/components/ui/StatusBadge';
import type { Status } from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders with default label from status config', () => {
    render(<StatusBadge status="success" />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<StatusBadge status="success" label="All Good" />);
    expect(screen.getByText('All Good')).toBeInTheDocument();
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
  });

  it('renders all status variants without crashing', () => {
    const statuses: Status[] = [
      'success', 'error', 'warning', 'info',
      'pending', 'running', 'paused',
      'online', 'offline', 'busy', 'idle',
      'rate_limited', 'healthy', 'stale', 'failed',
    ];

    statuses.forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />);
      // Each status should render a visible badge
      const badge = screen.getByText(
        // Status label is title-cased in config, or has special formatting
        new RegExp('.+')
      );
      expect(badge).toBeInTheDocument();
      unmount();
    });
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(
      <StatusBadge status="success" showIcon={false} />
    );
    // Should just have the text, no SVG icon
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(0);
  });

  it('applies size classes correctly', () => {
    const { container: smContainer } = render(
      <StatusBadge status="success" size="sm" />
    );
    const smBadge = smContainer.firstElementChild!;
    expect(smBadge.className).toContain('text-[10px]');

    const { container: lgContainer } = render(
      <StatusBadge status="success" size="lg" />
    );
    const lgBadge = lgContainer.firstElementChild!;
    expect(lgBadge.className).toContain('text-sm');
  });

  it('applies pulse animation when pulse is true', () => {
    const { container } = render(
      <StatusBadge status="running" pulse />
    );
    const badge = container.firstElementChild!;
    expect(badge.className).toContain('animate-pulse');
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatusBadge status="success" className="my-custom-class" />
    );
    const badge = container.firstElementChild!;
    expect(badge.className).toContain('my-custom-class');
  });
});

describe('StatusDot', () => {
  it('renders a dot element', () => {
    const { container } = render(<StatusDot status="online" />);
    const dot = container.firstElementChild!;
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain('rounded-full');
  });

  it('applies correct color for known statuses', () => {
    const { container } = render(<StatusDot status="online" />);
    expect(container.firstElementChild!.className).toContain('bg-green-500');
  });

  it('applies default color for unknown status', () => {
    const { container } = render(<StatusDot status="unknown-status" />);
    expect(container.firstElementChild!.className).toContain('bg-slate-500');
  });

  it('supports size variants', () => {
    const { container: smContainer } = render(<StatusDot status="online" size="sm" />);
    expect(smContainer.firstElementChild!.className).toContain('w-2');

    const { container: lgContainer } = render(<StatusDot status="online" size="lg" />);
    expect(lgContainer.firstElementChild!.className).toContain('w-3');
  });

  it('applies pulse animation', () => {
    const { container } = render(<StatusDot status="online" pulse />);
    expect(container.firstElementChild!.className).toContain('animate-pulse');
  });

  it('sets title attribute to status', () => {
    const { container } = render(<StatusDot status="offline" />);
    expect(container.firstElementChild!).toHaveAttribute('title', 'offline');
  });
});
