'use client'

import { 
  SwissButton,
  SwissCard, 
  SwissGrid,
  SwissHeader,
  SwissInput,
  SwissMetricCard,
  SwissSection,
  SwissStatusBadge,
  SwissTable,
  SwissEmptyState
} from '@/components/swiss'
import { useState } from 'react'
import { Bot, Users, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react'

export default function SwissDemoPage() {
  const [selectedMode, setSelectedMode] = useState<'easy' | 'power'>('easy')

  const mockAgents = [
    { id: '1', name: 'Caesar', role: 'Orchestrator', status: 'active', emoji: '🔴' },
    { id: '2', name: 'Athena', role: 'Planner', status: 'active', emoji: '🩵' },
    { id: '3', name: 'Vulcan', role: 'Builder', status: 'busy', emoji: '🔥' },
    { id: '4', name: 'Janus', role: 'Verifier', status: 'idle', emoji: '🌗' },
  ]

  const mockTasks = [
    { id: '1', title: 'Swiss Design Implementation', status: 'in_progress', priority: 'high', assignee: 'Vulcan' },
    { id: '2', title: 'Dashboard Optimization', status: 'completed', priority: 'medium', assignee: 'Athena' },
    { id: '3', title: 'Unit Test Coverage', status: 'pending', priority: 'low', assignee: 'Janus' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <SwissHeader 
          title="Swiss Design System Demo"
          subtitle="ClawLegion's clean, functional interface components"
          actions={[
            <SwissButton key="docs" variant="outline" size="sm">
              Documentation
            </SwissButton>,
            <SwissButton key="github" variant="primary" size="sm">
              View on GitHub
            </SwissButton>
          ]}
        />

        {/* UI Mode Toggle */}
        <SwissSection title="UI Mode Selection" className="max-w-2xl">
          <div className="flex gap-4">
            <SwissButton 
              variant={selectedMode === 'easy' ? 'primary' : 'outline'}
              onClick={() => setSelectedMode('easy')}
              className="flex-1"
            >
              Easy Mode
            </SwissButton>
            <SwissButton 
              variant={selectedMode === 'power' ? 'primary' : 'outline'}
              onClick={() => setSelectedMode('power')}
              className="flex-1"
            >
              Power Mode  
            </SwissButton>
          </div>
        </SwissSection>

        {/* Metrics Grid */}
        <SwissSection title="System Metrics">
          <SwissGrid columns={4} gap="lg">
            <SwissMetricCard
              label="Active Agents"
              value="4"
              trend="up"
              trendValue="+1"
              icon={<Bot className="h-5 w-5" />}
            />
            <SwissMetricCard
              label="Tasks Completed"
              value="127"
              trend="up"
              trendValue="+12%"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <SwissMetricCard
              label="System Load"
              value="64%"
              trend="down"
              trendValue="-5%"
              icon={<Zap className="h-5 w-5" />}
            />
            <SwissMetricCard
              label="Uptime"
              value="99.9%"
              trend="neutral"
              trendValue="stable"
              icon={<Clock className="h-5 w-5" />}
            />
          </SwissGrid>
        </SwissSection>

        <SwissGrid columns={2} gap="xl">
          
          {/* Agent Status Cards */}
          <SwissSection title="Agent Fleet">
            <div className="space-y-4">
              {mockAgents.map(agent => (
                <SwissCard key={agent.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900">{agent.name}</h3>
                        <p className="text-sm text-slate-600">{agent.role}</p>
                      </div>
                    </div>
                    <SwissStatusBadge 
                      status={agent.status as 'active' | 'busy' | 'idle'}
                      variant="dot"
                    />
                  </div>
                </SwissCard>
              ))}
            </div>
          </SwissSection>

          {/* Task Management */}
          <SwissSection title="Recent Tasks">
            <SwissTable
              headers={['Task', 'Status', 'Assignee']}
              rows={mockTasks.map(task => [
                task.title,
                <SwissStatusBadge 
                  key={task.id} 
                  status={task.status as 'completed' | 'in_progress' | 'pending'}
                />,
                task.assignee
              ])}
            />
          </SwissSection>

        </SwissGrid>

        {/* Forms Section */}
        <SwissSection title="Form Components" className="max-w-2xl">
          <SwissCard className="p-6 space-y-4">
            <SwissInput 
              label="Agent Name"
              placeholder="e.g., Caesar"
              helper="Choose a distinctive Roman name"
            />
            <SwissInput 
              label="Role Description"
              placeholder="e.g., Strategic coordinator"
              multiline
              rows={3}
            />
            <div className="flex gap-3 pt-2">
              <SwissButton variant="primary">Create Agent</SwissButton>
              <SwissButton variant="outline">Cancel</SwissButton>
            </div>
          </SwissCard>
        </SwissSection>

        {/* Empty State */}
        <SwissSection title="Empty State Example">
          <SwissEmptyState
            icon={<Users className="h-12 w-12" />}
            title="No team members yet"
            description="Get started by inviting your first team member to join ClawLegion"
            action={<SwissButton variant="primary">Invite Team Member</SwissButton>}
          />
        </SwissSection>

      </div>
    </div>
  )
}