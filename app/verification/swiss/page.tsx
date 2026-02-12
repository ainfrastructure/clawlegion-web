'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout'
import {
  SwissButton,
  SwissCard,
  SwissMetricCard,
  SwissGrid,
  SwissGridItem,
  SwissHeader,
  SwissInput,
  SwissTextarea,
  SwissNav,
  SwissSection,
  SwissStatusBadge,
  SwissTable,
  SwissTimeline,
  SwissEmptyState,
} from '@/components/swiss'
import {
  CheckCircle2,
  Zap,
  BarChart3,
  Users,
  Clock,
  Shield,
  AlertTriangle,
  Type,
  Palette,
  Grid3X3,
  Inbox,
  FileText,
  Box,
} from 'lucide-react'

// ============================================
// SWISS DESIGN SYSTEM — Verification Showcase
// Tests all 13 components + design tokens
// ============================================

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'cards', label: 'Cards' },
  { id: 'data', label: 'Data Display' },
  { id: 'forms', label: 'Forms' },
  { id: 'layout', label: 'Layout' },
]

const SAMPLE_TABLE_DATA = [
  { id: '1', name: 'SwissButton', status: 'Verified', variants: 5, size: '3.8 KB' },
  { id: '2', name: 'SwissCard', status: 'Verified', variants: 4, size: '3.4 KB' },
  { id: '3', name: 'SwissMetricCard', status: 'Verified', variants: 3, size: '2.9 KB' },
  { id: '4', name: 'SwissGrid', status: 'Verified', variants: 6, size: '4.0 KB' },
  { id: '5', name: 'SwissTable', status: 'Verified', variants: 2, size: '4.8 KB' },
]

const TIMELINE_ITEMS = [
  {
    id: '1',
    title: 'Design tokens defined',
    description: 'CSS custom properties, Tailwind config, 4px/8px grid system',
    timestamp: '10:00',
    status: 'completed' as const,
  },
  {
    id: '2',
    title: 'Core components built',
    description: 'SwissButton, SwissCard, SwissInput — foundation layer',
    timestamp: '11:30',
    status: 'completed' as const,
  },
  {
    id: '3',
    title: 'Data display components',
    description: 'SwissTable, SwissMetricCard, SwissTimeline, SwissStatusBadge',
    timestamp: '14:00',
    status: 'completed' as const,
  },
  {
    id: '4',
    title: 'Verification testing',
    description: 'All 13 components rendering correctly',
    timestamp: 'Now',
    status: 'active' as const,
  },
  {
    id: '5',
    title: 'Integration testing',
    description: 'Pending: test within existing dashboard pages',
    status: 'pending' as const,
  },
]

export default function SwissVerificationPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')
  const [buttonLoading, setButtonLoading] = useState(false)

  const handleLoadingDemo = () => {
    setButtonLoading(true)
    setTimeout(() => setButtonLoading(false), 2000)
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <SwissHeader
        title="Swiss Design System"
        subtitle="Alpine Clarity — Component Verification"
        size="page"
        actions={
          <div className="flex gap-swiss-2">
            <SwissButton variant="outline" size="sm" icon={<Shield size={14} />}>
              Run Tests
            </SwissButton>
            <SwissButton variant="primary" size="sm" icon={<CheckCircle2 size={14} />}>
              All Verified
            </SwissButton>
          </div>
        }
      />

      {/* Navigation */}
      <div className="mt-swiss-4 mb-swiss-6">
        <SwissNav
          items={NAV_ITEMS}
          activeId={activeSection}
          onChange={setActiveSection}
        />
      </div>

      {/* ──────── OVERVIEW SECTION ──────── */}
      {activeSection === 'overview' && (
        <div className="space-y-swiss-6">
          {/* Metrics Row */}
          <SwissGrid columns={4} gap="md">
            <SwissMetricCard
              label="Components"
              value="13"
              icon={<Box size={14} />}
              trend="up"
              trendValue="+13"
              subtitle="All verified"
            />
            <SwissMetricCard
              label="Design Tokens"
              value="42"
              icon={<Palette size={14} />}
              trend="up"
              trendValue="+42"
              subtitle="CSS variables"
            />
            <SwissMetricCard
              label="Grid System"
              value="4/8px"
              icon={<Grid3X3 size={14} />}
              trend="neutral"
              trendValue="Stable"
              subtitle="Mathematical precision"
            />
            <SwissMetricCard
              label="Type Scale"
              value="9"
              icon={<Type size={14} />}
              trend="up"
              trendValue="+9"
              subtitle="xs to display"
            />
          </SwissGrid>

          {/* Component Inventory Table */}
          <SwissSection title="Component Inventory" description="All Swiss Design System components">
            <SwissTable
              columns={[
                { key: 'name', label: 'Component', width: '40%' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (item) => (
                    <SwissStatusBadge
                      label={item.status}
                      type="success"
                      dot
                      size="sm"
                    />
                  ),
                },
                { key: 'variants', label: 'Variants', align: 'right', mono: true },
                { key: 'size', label: 'Size', align: 'right', mono: true },
              ]}
              data={SAMPLE_TABLE_DATA}
              getRowKey={(item) => item.id}
            />
          </SwissSection>

          {/* Timeline */}
          <SwissSection title="Build Timeline" description="Swiss Design System development progress">
            <SwissCard>
              <SwissTimeline items={TIMELINE_ITEMS} />
            </SwissCard>
          </SwissSection>
        </div>
      )}

      {/* ──────── BUTTONS SECTION ──────── */}
      {activeSection === 'buttons' && (
        <div className="space-y-swiss-6">
          <SwissSection title="SwissButton" description="5 variants × 4 sizes — clean, functional buttons">
            {/* Variants */}
            <SwissCard header={<span className="swiss-label">Variants</span>}>
              <div className="flex flex-wrap gap-swiss-3">
                <SwissButton variant="primary">Primary</SwissButton>
                <SwissButton variant="secondary">Secondary</SwissButton>
                <SwissButton variant="ghost">Ghost</SwissButton>
                <SwissButton variant="outline">Outline</SwissButton>
                <SwissButton variant="danger">Danger</SwissButton>
              </div>
            </SwissCard>

            {/* Sizes */}
            <div className="mt-swiss-4">
              <SwissCard header={<span className="swiss-label">Sizes</span>}>
                <div className="flex flex-wrap items-center gap-swiss-3">
                  <SwissButton size="xs">Extra Small</SwissButton>
                  <SwissButton size="sm">Small</SwissButton>
                  <SwissButton size="md">Medium</SwissButton>
                  <SwissButton size="lg">Large</SwissButton>
                </div>
              </SwissCard>
            </div>

            {/* With Icons */}
            <div className="mt-swiss-4">
              <SwissCard header={<span className="swiss-label">With Icons</span>}>
                <div className="flex flex-wrap gap-swiss-3">
                  <SwissButton icon={<Zap size={14} />}>With Icon</SwissButton>
                  <SwissButton variant="secondary" icon={<Shield size={14} />} iconRight={<CheckCircle2 size={14} />}>
                    Both Sides
                  </SwissButton>
                  <SwissButton variant="outline" icon={<AlertTriangle size={14} />}>
                    Warning
                  </SwissButton>
                </div>
              </SwissCard>
            </div>

            {/* States */}
            <div className="mt-swiss-4">
              <SwissCard header={<span className="swiss-label">States</span>}>
                <div className="flex flex-wrap items-center gap-swiss-3">
                  <SwissButton disabled>Disabled</SwissButton>
                  <SwissButton loading={buttonLoading} onClick={handleLoadingDemo}>
                    {buttonLoading ? 'Loading...' : 'Click to Load'}
                  </SwissButton>
                  <SwissButton fullWidth variant="secondary">Full Width</SwissButton>
                </div>
              </SwissCard>
            </div>
          </SwissSection>
        </div>
      )}

      {/* ──────── CARDS SECTION ──────── */}
      {activeSection === 'cards' && (
        <div className="space-y-swiss-6">
          <SwissSection title="SwissCard" description="4 variants × 3 sizes — primary container component">
            {/* Variants */}
            <SwissGrid columns={2} gap="md">
              <SwissCard variant="default">
                <p className="swiss-label mb-swiss-2">Default</p>
                <p className="text-swiss-sm text-[var(--swiss-text-secondary)]">
                  Standard card with border and surface background.
                </p>
              </SwissCard>
              <SwissCard variant="outlined">
                <p className="swiss-label mb-swiss-2">Outlined</p>
                <p className="text-swiss-sm text-[var(--swiss-text-secondary)]">
                  Transparent background with visible border.
                </p>
              </SwissCard>
              <SwissCard variant="filled">
                <p className="swiss-label mb-swiss-2">Filled</p>
                <p className="text-swiss-sm text-[var(--swiss-text-secondary)]">
                  Raised surface with no visible border.
                </p>
              </SwissCard>
              <SwissCard variant="ghost">
                <p className="swiss-label mb-swiss-2">Ghost</p>
                <p className="text-swiss-sm text-[var(--swiss-text-secondary)]">
                  Fully transparent, no border or background.
                </p>
              </SwissCard>
            </SwissGrid>

            {/* With Header/Footer */}
            <div className="mt-swiss-4">
              <SwissCard
                header={
                  <div className="flex items-center justify-between">
                    <span className="text-swiss-sm font-medium text-[var(--swiss-text-primary)]">Card with Header & Footer</span>
                    <SwissStatusBadge label="Active" type="active" dot size="xs" />
                  </div>
                }
                footer={
                  <div className="flex justify-end gap-swiss-2">
                    <SwissButton variant="ghost" size="sm">Cancel</SwissButton>
                    <SwissButton variant="primary" size="sm">Save</SwissButton>
                  </div>
                }
              >
                <p className="text-swiss-sm text-[var(--swiss-text-secondary)]">
                  This card demonstrates the header and footer slots. The header includes a status badge,
                  and the footer includes action buttons. All spacing follows the 4px/8px grid.
                </p>
              </SwissCard>
            </div>

            {/* Accent variants */}
            <div className="mt-swiss-4">
              <SwissGrid columns={4} gap="md">
                <SwissCard accent="blue" size="sm">
                  <p className="swiss-label">Blue Accent</p>
                </SwissCard>
                <SwissCard accent="green" size="sm">
                  <p className="swiss-label">Green Accent</p>
                </SwissCard>
                <SwissCard accent="amber" size="sm">
                  <p className="swiss-label">Amber Accent</p>
                </SwissCard>
                <SwissCard accent="red" size="sm">
                  <p className="swiss-label">Red Accent</p>
                </SwissCard>
              </SwissGrid>
            </div>

            {/* Interactive Card */}
            <div className="mt-swiss-4">
              <SwissCard interactive onClick={() => {}}>
                <p className="text-swiss-sm text-[var(--swiss-text-primary)] font-medium">Interactive Card</p>
                <p className="text-swiss-sm text-[var(--swiss-text-tertiary)] mt-swiss-1">
                  Hover to see the interaction state. Click triggers the onClick handler.
                </p>
              </SwissCard>
            </div>
          </SwissSection>

          {/* Metric Cards */}
          <SwissSection title="SwissMetricCard" description="Metric display with trend indicators">
            <SwissGrid columns={3} gap="md">
              <SwissMetricCard
                label="Revenue"
                value="$42,850"
                icon={<BarChart3 size={14} />}
                trend="up"
                trendValue="+12.5%"
                subtitle="vs last month"
              />
              <SwissMetricCard
                label="Active Users"
                value="1,284"
                icon={<Users size={14} />}
                trend="down"
                trendValue="-3.2%"
                subtitle="vs last week"
              />
              <SwissMetricCard
                label="Avg Response"
                value="145ms"
                icon={<Clock size={14} />}
                trend="neutral"
                trendValue="Stable"
                subtitle="p95 latency"
              />
            </SwissGrid>

            {/* Different sizes */}
            <div className="mt-swiss-4">
              <SwissGrid columns={3} gap="md">
                <SwissMetricCard label="Small" value="42" size="sm" />
                <SwissMetricCard label="Medium (default)" value="42" size="md" />
                <SwissMetricCard label="Large" value="42" size="lg" />
              </SwissGrid>
            </div>
          </SwissSection>
        </div>
      )}

      {/* ──────── DATA DISPLAY SECTION ──────── */}
      {activeSection === 'data' && (
        <div className="space-y-swiss-6">
          {/* Status Badges */}
          <SwissSection title="SwissStatusBadge" description="6 semantic types × 3 sizes">
            <SwissCard>
              <div className="space-y-swiss-4">
                <div>
                  <p className="swiss-label mb-swiss-2">Types</p>
                  <div className="flex flex-wrap gap-swiss-2">
                    <SwissStatusBadge label="Active" type="active" dot />
                    <SwissStatusBadge label="Success" type="success" dot />
                    <SwissStatusBadge label="Warning" type="warning" dot />
                    <SwissStatusBadge label="Error" type="error" dot />
                    <SwissStatusBadge label="Neutral" type="neutral" dot />
                    <SwissStatusBadge label="Info" type="info" dot />
                  </div>
                </div>
                <div>
                  <p className="swiss-label mb-swiss-2">Sizes</p>
                  <div className="flex flex-wrap items-center gap-swiss-2">
                    <SwissStatusBadge label="Extra Small" type="active" size="xs" />
                    <SwissStatusBadge label="Small" type="success" size="sm" />
                    <SwissStatusBadge label="Medium" type="info" size="md" />
                  </div>
                </div>
                <div>
                  <p className="swiss-label mb-swiss-2">Without Dot</p>
                  <div className="flex flex-wrap gap-swiss-2">
                    <SwissStatusBadge label="Active" type="active" />
                    <SwissStatusBadge label="Error" type="error" />
                    <SwissStatusBadge label="Neutral" type="neutral" />
                  </div>
                </div>
              </div>
            </SwissCard>
          </SwissSection>

          {/* Table */}
          <SwissSection title="SwissTable" description="Clean data table with sorted columns">
            <SwissTable
              columns={[
                { key: 'name', label: 'Component', width: '35%' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (item) => (
                    <SwissStatusBadge label={item.status} type="success" dot size="xs" />
                  ),
                },
                { key: 'variants', label: 'Variants', align: 'right', mono: true },
                { key: 'size', label: 'Bundle Size', align: 'right', mono: true },
              ]}
              data={SAMPLE_TABLE_DATA}
              getRowKey={(item) => item.id}
              onRowClick={(item) => console.log('Clicked:', item.name)}
            />
          </SwissSection>

          {/* Timeline */}
          <SwissSection title="SwissTimeline" description="Vertical timeline with status indicators">
            <SwissGrid columns={2} gap="lg">
              <SwissCard header={<span className="swiss-label">Default Size</span>}>
                <SwissTimeline items={TIMELINE_ITEMS} />
              </SwissCard>
              <SwissCard header={<span className="swiss-label">Small Size</span>}>
                <SwissTimeline items={TIMELINE_ITEMS} size="sm" />
              </SwissCard>
            </SwissGrid>
          </SwissSection>

          {/* Empty State */}
          <SwissSection title="SwissEmptyState" description="Zero-state placeholders">
            <SwissGrid columns={2} gap="md">
              <SwissCard>
                <SwissEmptyState
                  icon={<Inbox size={32} />}
                  title="No items yet"
                  description="Create your first item to get started."
                  action={{
                    label: 'Create Item',
                    onClick: () => console.log('Create item clicked'),
                    variant: 'primary',
                  }}
                />
              </SwissCard>
              <SwissCard>
                <SwissEmptyState
                  icon={<FileText size={32} />}
                  title="No reports"
                  description="Run verification to generate reports."
                />
              </SwissCard>
            </SwissGrid>
          </SwissSection>
        </div>
      )}

      {/* ──────── FORMS SECTION ──────── */}
      {activeSection === 'forms' && (
        <div className="space-y-swiss-6">
          <SwissSection title="SwissInput" description="Text input with label, hint, and error states">
            <SwissCard>
              <div className="space-y-swiss-4 max-w-lg">
                <SwissInput
                  label="Default Input"
                  placeholder="Enter some text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  helperText="This is a helper text message"
                />
                <SwissInput
                  label="With Error"
                  placeholder="Invalid value"
                  value="bad input"
                  error="This field has an error"
                  onChange={() => {}}
                />
                <SwissInput
                  label="Disabled"
                  placeholder="Cannot edit"
                  disabled
                  value="Read only value"
                  onChange={() => {}}
                />
                <SwissInput
                  label="Small Size"
                  placeholder="Compact input"
                  inputSize="sm"
                  value=""
                  onChange={() => {}}
                />
                <SwissInput
                  label="Large Size"
                  placeholder="Spacious input"
                  inputSize="lg"
                  value=""
                  onChange={() => {}}
                />
              </div>
            </SwissCard>
          </SwissSection>

          <SwissSection title="SwissTextarea" description="Multiline text input">
            <SwissCard>
              <div className="space-y-swiss-4 max-w-lg">
                <SwissTextarea
                  label="Description"
                  placeholder="Enter a detailed description..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  helperText="Markdown is supported"
                  rows={4}
                />
                <SwissTextarea
                  label="With Error"
                  placeholder="Required field"
                  value=""
                  error="Description is required"
                  onChange={() => {}}
                  rows={3}
                />
              </div>
            </SwissCard>
          </SwissSection>
        </div>
      )}

      {/* ──────── LAYOUT SECTION ──────── */}
      {activeSection === 'layout' && (
        <div className="space-y-swiss-6">
          {/* Grid */}
          <SwissSection title="SwissGrid" description="Mathematical grid layout with responsive columns">
            <SwissCard header={<span className="swiss-label">2 Columns</span>}>
              <SwissGrid columns={2} gap="md">
                <div className="swiss-surface-raised p-swiss-4 text-center text-swiss-sm text-[var(--swiss-text-secondary)]">
                  Column 1
                </div>
                <div className="swiss-surface-raised p-swiss-4 text-center text-swiss-sm text-[var(--swiss-text-secondary)]">
                  Column 2
                </div>
              </SwissGrid>
            </SwissCard>

            <div className="mt-swiss-4">
              <SwissCard header={<span className="swiss-label">3 Columns</span>}>
                <SwissGrid columns={3} gap="md">
                  <div className="swiss-surface-raised p-swiss-4 text-center text-swiss-sm text-[var(--swiss-text-secondary)]">1</div>
                  <div className="swiss-surface-raised p-swiss-4 text-center text-swiss-sm text-[var(--swiss-text-secondary)]">2</div>
                  <div className="swiss-surface-raised p-swiss-4 text-center text-swiss-sm text-[var(--swiss-text-secondary)]">3</div>
                </SwissGrid>
              </SwissCard>
            </div>

            <div className="mt-swiss-4">
              <SwissCard header={<span className="swiss-label">4 Columns with Spanning</span>}>
                <SwissGrid columns={4} gap="md">
                  <SwissGridItem span={2}>
                    <div className="swiss-surface-raised p-swiss-4 text-center text-swiss-sm text-[var(--swiss-text-secondary)]">
                      Span 2
                    </div>
                  </SwissGridItem>
                  <div className="swiss-surface-raised p-swiss-4 text-center text-swiss-sm text-[var(--swiss-text-secondary)]">3</div>
                  <div className="swiss-surface-raised p-swiss-4 text-center text-swiss-sm text-[var(--swiss-text-secondary)]">4</div>
                </SwissGrid>
              </SwissCard>
            </div>
          </SwissSection>

          {/* Header variants */}
          <SwissSection title="SwissHeader" description="Page headers with size variants">
            <SwissCard>
              <div className="space-y-swiss-6">
                <SwissHeader title="Page Header" subtitle="With subtitle text" size="page" />
                <hr className="swiss-divider" />
                <SwissHeader title="Section Header (default)" subtitle="Standard section header" size="section" />
                <hr className="swiss-divider" />
                <SwissHeader title="Subsection Header" subtitle="Subsection header" size="subsection" />
              </div>
            </SwissCard>
          </SwissSection>

          {/* Section */}
          <SwissSection title="SwissSection" description="Content section wrapper — you're looking at one right now">
            <SwissCard>
              <p className="text-swiss-sm text-[var(--swiss-text-secondary)]">
                SwissSection provides consistent title + subtitle + content wrapping.
                Every section on this page uses it. It follows the 8px grid system
                and provides clean typographic hierarchy.
              </p>
            </SwissCard>
          </SwissSection>

          {/* Navigation */}
          <SwissSection title="SwissNav" description="Tab navigation — see the one at the top of this page">
            <SwissCard>
              <SwissNav
                items={[
                  { id: 'tab1', label: 'Tab One' },
                  { id: 'tab2', label: 'Tab Two' },
                  { id: 'tab3', label: 'Tab Three' },
                ]}
                activeId="tab1"
                onChange={() => {}}
              />
            </SwissCard>
          </SwissSection>

          {/* Design Tokens */}
          <SwissSection title="Design Tokens" description="Color palette, spacing, and typography">
            <SwissCard header={<span className="swiss-label">Color Palette</span>}>
              <div className="space-y-swiss-4">
                {/* Neutrals */}
                <div>
                  <p className="swiss-label mb-swiss-2">Neutrals</p>
                  <div className="flex gap-swiss-1">
                    {['#FAFAFA', '#F7F7F8', '#EBEBED', '#D4D4D8', '#A1A1AA', '#71717A', '#52525B', '#3F3F46', '#27272A', '#18181B', '#0F0F12', '#09090B', '#0A0A0A'].map((color) => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded-swiss-sm border border-[var(--swiss-border)]"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                {/* Semantic */}
                <div>
                  <p className="swiss-label mb-swiss-2">Semantic</p>
                  <div className="flex gap-swiss-2">
                    <div className="flex items-center gap-swiss-2">
                      <div className="w-8 h-8 rounded-swiss-sm bg-swiss-accent" title="Accent" />
                      <span className="text-swiss-xs text-[var(--swiss-text-tertiary)]">Accent</span>
                    </div>
                    <div className="flex items-center gap-swiss-2">
                      <div className="w-8 h-8 rounded-swiss-sm bg-swiss-success" title="Success" />
                      <span className="text-swiss-xs text-[var(--swiss-text-tertiary)]">Success</span>
                    </div>
                    <div className="flex items-center gap-swiss-2">
                      <div className="w-8 h-8 rounded-swiss-sm bg-swiss-warning" title="Warning" />
                      <span className="text-swiss-xs text-[var(--swiss-text-tertiary)]">Warning</span>
                    </div>
                    <div className="flex items-center gap-swiss-2">
                      <div className="w-8 h-8 rounded-swiss-sm bg-swiss-error" title="Error" />
                      <span className="text-swiss-xs text-[var(--swiss-text-tertiary)]">Error</span>
                    </div>
                  </div>
                </div>
              </div>
            </SwissCard>

            <div className="mt-swiss-4">
              <SwissCard header={<span className="swiss-label">Typography Scale</span>}>
                <div className="space-y-swiss-3">
                  <p className="text-swiss-xs text-[var(--swiss-text-secondary)]">swiss-xs — 11px / 16px</p>
                  <p className="text-swiss-sm text-[var(--swiss-text-secondary)]">swiss-sm — 13px / 20px</p>
                  <p className="text-swiss-base text-[var(--swiss-text-secondary)]">swiss-base — 15px / 24px</p>
                  <p className="text-swiss-lg text-[var(--swiss-text-secondary)]">swiss-lg — 18px / 28px</p>
                  <p className="text-swiss-xl text-[var(--swiss-text-primary)]">swiss-xl — 22px / 32px</p>
                  <p className="text-swiss-2xl text-[var(--swiss-text-primary)]">swiss-2xl — 28px / 36px</p>
                  <p className="text-swiss-3xl text-[var(--swiss-text-primary)]">swiss-3xl — 36px / 44px</p>
                </div>
              </SwissCard>
            </div>
          </SwissSection>
        </div>
      )}
    </PageContainer>
  )
}
