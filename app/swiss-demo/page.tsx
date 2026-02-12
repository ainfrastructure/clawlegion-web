/**
 * Swiss Design System — Demo/Storybook Page
 *
 * Showcases all 11 Swiss components with real data.
 * Accessible at /swiss-demo
 */
'use client'

import { useState } from 'react'
import {
  SwissCard,
  SwissMetricCard,
  SwissTaskCard,
  SwissAgentCard,
  SwissTimeline,
  SwissStatusDot,
  SwissTabBar,
  SwissSection,
  SwissEmptyState,
  SwissModal,
  SwissButton,
} from '@/components/swiss'
import {
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Users,
  Inbox,
  Search,
  GitBranch,
  MessageSquare,
} from 'lucide-react'

export default function SwissDemoPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-swiss-bg text-swiss-text-primary p-swiss-lg font-swiss">
      <div className="max-w-5xl mx-auto">
        {/* Page title */}
        <h1 className="text-swiss-title mb-swiss-xs">
          Swiss Design System
        </h1>
        <p className="text-swiss-body text-swiss-text-secondary mb-swiss-3xl">
          11 components · 4px/8px grid · AAA contrast · Flush-left
        </p>

        {/* ─── 1. SwissStatusDot ─── */}
        <SwissSection title="SwissStatusDot" className="mb-swiss-2xl">
          <div className="flex items-center gap-swiss-lg">
            <div className="flex items-center gap-swiss-sm">
              <SwissStatusDot color="green" />
              <span className="text-swiss-body text-swiss-text-secondary">Online / Done</span>
            </div>
            <div className="flex items-center gap-swiss-sm">
              <SwissStatusDot color="yellow" />
              <span className="text-swiss-body text-swiss-text-secondary">Busy / In Progress</span>
            </div>
            <div className="flex items-center gap-swiss-sm">
              <SwissStatusDot color="red" />
              <span className="text-swiss-body text-swiss-text-secondary">Error / Offline</span>
            </div>
            <div className="flex items-center gap-swiss-sm">
              <SwissStatusDot color="blue" pulse />
              <span className="text-swiss-body text-swiss-text-secondary">Planning / Researching</span>
            </div>
          </div>
        </SwissSection>

        {/* ─── 2. SwissButton ─── */}
        <SwissSection title="SwissButton" className="mb-swiss-2xl">
          <div className="flex items-center gap-swiss-md">
            <SwissButton variant="primary">Primary Action</SwissButton>
            <SwissButton variant="ghost">Ghost Action</SwissButton>
            <SwissButton variant="primary" icon={<Zap />}>With Icon</SwissButton>
            <SwissButton variant="primary" loading>Loading</SwissButton>
            <SwissButton variant="primary" disabled>Disabled</SwissButton>
          </div>
        </SwissSection>

        {/* ─── 3. SwissCard ─── */}
        <SwissSection title="SwissCard" className="mb-swiss-2xl">
          <div className="grid grid-cols-3 gap-swiss-md">
            <SwissCard>
              <p className="text-swiss-body text-swiss-text-secondary">Default card with 24px padding and 12px radius.</p>
            </SwissCard>
            <SwissCard accent="blue">
              <p className="text-swiss-body text-swiss-text-secondary">Blue accent left border.</p>
            </SwissCard>
            <SwissCard accent="green" onClick={() => {}}>
              <p className="text-swiss-body text-swiss-text-secondary">Interactive card — hover me.</p>
            </SwissCard>
          </div>
        </SwissSection>

        {/* ─── 4. SwissMetricCard ─── */}
        <SwissSection title="SwissMetricCard" className="mb-swiss-2xl">
          <div className="grid grid-cols-4 gap-swiss-md">
            <SwissMetricCard
              label="Tasks Completed"
              value="142"
              icon={<CheckCircle2 />}
              trend="up"
              trendLabel="+18%"
              subtext="vs last week"
            />
            <SwissMetricCard
              label="In Progress"
              value="7"
              icon={<Clock />}
              trend="neutral"
              trendLabel="—"
            />
            <SwissMetricCard
              label="Error Rate"
              value="2.1%"
              icon={<AlertTriangle />}
              trend="down"
              trendLabel="-0.5%"
              subtext="improving"
            />
            <SwissMetricCard
              label="Throughput"
              value="38/day"
              icon={<BarChart3 />}
              trend="up"
              trendLabel="+12%"
            />
          </div>
        </SwissSection>

        {/* ─── 5. SwissTabBar ─── */}
        <SwissSection title="SwissTabBar" className="mb-swiss-2xl">
          <SwissTabBar
            tabs={[
              { id: 'overview', label: 'Overview', count: 12 },
              { id: 'tasks', label: 'Tasks', count: 42 },
              { id: 'agents', label: 'Agents', count: 5 },
              { id: 'timeline', label: 'Timeline' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <p className="text-swiss-caption text-swiss-text-tertiary mt-swiss-md">
            Active tab: <span className="text-swiss-text-primary font-medium">{activeTab}</span>
          </p>
        </SwissSection>

        {/* ─── 6. SwissTaskCard ─── */}
        <SwissSection title="SwissTaskCard" className="mb-swiss-2xl">
          <div className="space-y-swiss-sm">
            <SwissTaskCard
              taskId="TSK-001"
              title="Implement Swiss Design System components"
              agent="Vulcan"
              priority="P1"
              status="in_progress"
            />
            <SwissTaskCard
              taskId="TSK-002"
              title="Set up branch protection rules"
              agent="Minerva"
              priority="P2"
              status="done"
            />
            <SwissTaskCard
              taskId="TSK-003"
              title="Fix authentication flow regression"
              agent="Janus"
              priority="P0"
              status="error"
            />
            <SwissTaskCard
              taskId="TSK-004"
              title="Research optimal caching strategy"
              priority="P3"
              status="planning"
            />
          </div>
        </SwissSection>

        {/* ─── 7. SwissAgentCard ─── */}
        <SwissSection title="SwissAgentCard" className="mb-swiss-2xl">
          <div className="grid grid-cols-3 gap-swiss-md">
            <SwissAgentCard
              name="Vulcan"
              avatar="🔨"
              role="Senior Fullstack Engineer"
              status="busy"
              currentTask={{
                id: 'TSK-001',
                title: 'Swiss Design System',
                onClick: () => {},
              }}
            />
            <SwissAgentCard
              name="Minerva"
              avatar="🦉"
              role="Research & Intelligence"
              status="online"
            />
            <SwissAgentCard
              name="Janus"
              avatar="👁️"
              role="Verification Engineer"
              status="offline"
            />
          </div>
        </SwissSection>

        {/* ─── 8. SwissTimeline ─── */}
        <SwissSection title="SwissTimeline" className="mb-swiss-2xl">
          <SwissCard>
            <SwissTimeline
              groups={[
                {
                  label: 'Today',
                  entries: [
                    { id: '1', timestamp: '16:12', message: 'Vulcan started building Swiss Design System', icon: <GitBranch size={14} /> },
                    { id: '2', timestamp: '15:45', message: 'Minerva completed research report', icon: <Search size={14} /> },
                    { id: '3', timestamp: '14:30', message: 'Task TSK-001 moved to in_progress', icon: <Activity size={14} /> },
                  ],
                },
                {
                  label: 'Yesterday',
                  entries: [
                    { id: '4', timestamp: '23:15', message: 'Sprint planning completed for Phase 1', icon: <MessageSquare size={14} /> },
                    { id: '5', timestamp: '18:00', message: '5 tasks completed, 2 new created', icon: <CheckCircle2 size={14} /> },
                  ],
                },
              ]}
            />
          </SwissCard>
        </SwissSection>

        {/* ─── 9. SwissSection (self-referencing) ─── */}
        <SwissSection
          title="SwissSection"
          viewAllHref="#"
          className="mb-swiss-2xl"
        >
          <SwissCard>
            <p className="text-swiss-body text-swiss-text-secondary">
              SwissSection provides heading + divider + children + optional &quot;View all →&quot; link.
              This text is inside a SwissCard inside a SwissSection.
            </p>
          </SwissCard>
        </SwissSection>

        {/* ─── 10. SwissEmptyState ─── */}
        <SwissSection title="SwissEmptyState" className="mb-swiss-2xl">
          <SwissCard>
            <SwissEmptyState
              icon={<Inbox />}
              message="No tasks yet"
              description="Create your first task to get started with the dashboard."
              action={{ label: 'Create Task', onClick: () => {} }}
            />
          </SwissCard>
        </SwissSection>

        {/* ─── 11. SwissModal ─── */}
        <SwissSection title="SwissModal" className="mb-swiss-2xl">
          <SwissButton variant="primary" onClick={() => setModalOpen(true)}>
            Open Modal
          </SwissButton>
          <SwissModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Swiss Modal"
            maxWidth="md"
          >
            <p className="text-swiss-body text-swiss-text-secondary mb-swiss-md">
              Clean modal with dark overlay, max-width container, close X button, and consistent 24px padding.
            </p>
            <div className="flex justify-end gap-swiss-sm">
              <SwissButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</SwissButton>
              <SwissButton variant="primary" onClick={() => setModalOpen(false)}>Confirm</SwissButton>
            </div>
          </SwissModal>
        </SwissSection>

        {/* ─── Design Tokens Reference ─── */}
        <SwissSection title="Design Tokens" className="mb-swiss-2xl">
          <div className="grid grid-cols-2 gap-swiss-md">
            {/* Colors */}
            <SwissCard>
              <h4 className="text-swiss-heading text-swiss-text-primary mb-swiss-md">Colors</h4>
              <div className="space-y-swiss-sm">
                {[
                  { name: 'swiss-bg', hex: '#0A0D14', className: 'bg-swiss-bg' },
                  { name: 'swiss-surface', hex: '#111520', className: 'bg-swiss-surface' },
                  { name: 'swiss-elevated', hex: '#161B28', className: 'bg-swiss-elevated' },
                  { name: 'swiss-border', hex: '#1E2436', className: 'bg-swiss-border' },
                  { name: 'swiss-accent', hex: '#3B82F6', className: 'bg-swiss-accent' },
                ].map(c => (
                  <div key={c.name} className="flex items-center gap-swiss-sm">
                    <div className={`w-8 h-8 rounded border border-swiss-border ${c.className}`} />
                    <span className="font-swiss-mono text-swiss-mono text-swiss-text-secondary">{c.name}</span>
                    <span className="font-swiss-mono text-swiss-mono text-swiss-text-tertiary">{c.hex}</span>
                  </div>
                ))}
              </div>
            </SwissCard>

            {/* Typography */}
            <SwissCard>
              <h4 className="text-swiss-heading text-swiss-text-primary mb-swiss-md">Typography</h4>
              <div className="space-y-swiss-md">
                <div>
                  <span className="swiss-label block mb-1">Page Title — 28px/700</span>
                  <p className="text-swiss-title">The quick brown fox</p>
                </div>
                <div>
                  <span className="swiss-label block mb-1">Section Heading — 18px/600</span>
                  <p className="text-swiss-heading">The quick brown fox</p>
                </div>
                <div>
                  <span className="swiss-label block mb-1">Body — 14px/400</span>
                  <p className="text-swiss-body">The quick brown fox jumps over the lazy dog.</p>
                </div>
                <div>
                  <span className="swiss-label block mb-1">Caption — 12px/400</span>
                  <p className="text-swiss-caption text-swiss-text-tertiary">The quick brown fox jumps over the lazy dog.</p>
                </div>
                <div>
                  <span className="swiss-label block mb-1">Mono — JetBrains Mono 13px/400</span>
                  <p className="font-swiss-mono text-swiss-mono text-swiss-text-secondary tabular-nums">TSK-042 → 1,234.56</p>
                </div>
              </div>
            </SwissCard>
          </div>
        </SwissSection>

        {/* Spacing reference */}
        <SwissSection title="Spacing Scale" className="mb-swiss-3xl">
          <SwissCard>
            <div className="space-y-swiss-sm">
              {[
                { name: 'swiss-xs', value: '4px' },
                { name: 'swiss-sm', value: '8px' },
                { name: 'swiss-md', value: '16px' },
                { name: 'swiss-lg', value: '24px' },
                { name: 'swiss-xl', value: '32px' },
                { name: 'swiss-2xl', value: '48px' },
                { name: 'swiss-3xl', value: '64px' },
              ].map(s => (
                <div key={s.name} className="flex items-center gap-swiss-md">
                  <span className="font-swiss-mono text-swiss-mono text-swiss-text-tertiary w-24">{s.name}</span>
                  <span className="font-swiss-mono text-swiss-mono text-swiss-text-secondary w-12">{s.value}</span>
                  <div className="bg-swiss-accent/30 h-3 rounded" style={{ width: s.value }} />
                </div>
              ))}
            </div>
          </SwissCard>
        </SwissSection>
      </div>
    </div>
  )
}
