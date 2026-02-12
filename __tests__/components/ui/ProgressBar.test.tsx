/**
 * ProgressBar Component Tests
 *
 * Tests for the ProgressBar and CircularProgress UI components.
 * Validates value clamping, label display, color variants, and sizing.
 *
 * Run with: npx vitest run __tests__/components/ui/ProgressBar.test.tsx
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar, CircularProgress } from '@/components/ui/ProgressBar';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    const { container } = render(<ProgressBar value={50} />);
    // Should render the progress track and fill
    const track = container.querySelector('.bg-slate-700');
    expect(track).toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(<ProgressBar value={50} label="Progress" />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('displays percentage when showValue is true', () => {
    render(<ProgressBar value={75} showValue />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('does not display percentage when showValue is false', () => {
    render(<ProgressBar value={75} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('clamps value to 0-100 range', () => {
    // Over 100
    const { container: overContainer } = render(<ProgressBar value={150} showValue />);
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Under 0
    render(<ProgressBar value={-10} showValue />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('calculates percentage relative to custom max', () => {
    render(<ProgressBar value={25} max={50} showValue />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('applies width style based on percentage', () => {
    const { container } = render(<ProgressBar value={60} />);
    const fill = container.querySelector('.transition-all');
    expect(fill).toHaveStyle({ width: '60%' });
  });

  it('applies size classes correctly', () => {
    const { container: smContainer } = render(<ProgressBar value={50} size="sm" />);
    expect(smContainer.querySelector('.h-1')).toBeInTheDocument();

    const { container: lgContainer } = render(<ProgressBar value={50} size="lg" />);
    expect(lgContainer.querySelector('.h-3')).toBeInTheDocument();
  });

  it('applies auto color based on percentage', () => {
    // Low value = red
    const { container: lowContainer } = render(<ProgressBar value={20} color="auto" />);
    const lowFill = lowContainer.querySelector('.bg-red-500');
    expect(lowFill).toBeInTheDocument();

    // Medium value = yellow
    const { container: midContainer } = render(<ProgressBar value={60} color="auto" />);
    const midFill = midContainer.querySelector('.bg-yellow-500');
    expect(midFill).toBeInTheDocument();

    // High value = green
    const { container: highContainer } = render(<ProgressBar value={90} color="auto" />);
    const highFill = highContainer.querySelector('.bg-green-500');
    expect(highFill).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressBar value={50} className="my-class" />);
    expect(container.firstElementChild!.className).toContain('my-class');
  });
});

describe('CircularProgress', () => {
  it('renders an SVG element', () => {
    const { container } = render(<CircularProgress value={50} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('displays value text by default', () => {
    render(<CircularProgress value={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides value text when showValue is false', () => {
    render(<CircularProgress value={75} showValue={false} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('clamps percentage to 0-100', () => {
    render(<CircularProgress value={200} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders two circle elements (background + progress)', () => {
    const { container } = render(<CircularProgress value={50} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('respects custom size', () => {
    const { container } = render(<CircularProgress value={50} size={64} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('64');
    expect(svg.getAttribute('height')).toBe('64');
  });
});
