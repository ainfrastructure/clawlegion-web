'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout'
import { 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Sparkles,
  FileText,
  TrendingUp,
  Copy,
  Twitter,
  Linkedin,
  RefreshCw
} from 'lucide-react'

// ============================================
// LEARNINGS & CONTENT CREATION DASHBOARD
// View findings, insights, and generate content
// ============================================

interface Learning {
  date: string
  topic: string
  insight: string
  impact: 'High' | 'Medium' | 'Low'
  type: 'success' | 'failure'
}

interface ContentSuggestion {
  id: string
  platform: 'twitter' | 'linkedin' | 'blog'
  content: string
  basedOn: string
  generated: string
}

// Sample data - will be replaced with API calls
const learnings: Learning[] = [
  {
    date: '2026-01-31',
    topic: 'Multi-agent coordination',
    insight: 'Turn-based protocol med @mentions hindrer race conditions',
    impact: 'High',
    type: 'success'
  },
  {
    date: '2026-01-31',
    topic: 'Sub-agent spawning',
    insight: 'sessions_spawn med labels gir isolerte workers som rapporterer tilbake',
    impact: 'High',
    type: 'success'
  },
  {
    date: '2026-01-31',
    topic: 'Cross-machine SSH',
    insight: 'Tailscale + SSH keys = sømløs agent-til-agent kommunikasjon',
    impact: 'Medium',
    type: 'success'
  },
  {
    date: '2026-01-31',
    topic: 'Simultaneous responses',
    insight: 'Begge bots svarte samtidig - trengte koordineringsprotokoll',
    impact: 'Medium',
    type: 'failure'
  },
  {
    date: '2026-01-31',
    topic: 'Tailscale IP changes',
    insight: 'Tailscale IP-er kan endre seg — bruk hostname eller oppdater config jevnlig',
    impact: 'Medium',
    type: 'failure'
  },
  {
    date: '2026-01-31',
    topic: 'Multi-account GitHub SSH',
    insight: 'Bruk ~/.ssh/config med IdentityFile per konto for å håndtere flere GitHub-brukere',
    impact: 'High',
    type: 'success'
  },
  {
    date: '2026-01-31',
    topic: 'GitHub org management',
    insight: 'gh auth refresh -s admin:org kreves for org invites via CLI',
    impact: 'Medium',
    type: 'success'
  },
  {
    date: '2026-01-31',
    topic: 'GitHub device flow',
    insight: 'gh auth login --web gir sømløs auth uten å eksponere tokens i terminal',
    impact: 'Low',
    type: 'success'
  },
  {
    date: '2026-01-31',
    topic: 'Remote dev server',
    insight: 'Next.js med -H 0.0.0.0 gjør dev server tilgjengelig over Tailscale',
    impact: 'High',
    type: 'success'
  },
  {
    date: '2026-01-31',
    topic: 'Stay responsive workflow',
    insight: 'Spawn sub-agents for tasks så hovedsession alltid er tilgjengelig for chat',
    impact: 'High',
    type: 'success'
  }
]

const openQuestions = [
  'Hvordan dele persistent state mellom agenter uten conflicts?',
  'Optimal timeout for sub-agents? (nå: 60-120s)',
  'Skal workers ha egen memory, eller kun main agent?',
  'Syncthing vs Git for delt mappe mellom agenter?',
  'Hvordan håndtere agent-credentials sikkert på tvers av maskiner?',
  'Bør learnings lagres i database eller som markdown filer?'
]

const contentSuggestions: ContentSuggestion[] = [
  {
    id: '1',
    platform: 'twitter',
    content: '🤖 Today we solved the "two AIs talking over each other" problem.\n\nSolution: Turn-based protocol with explicit handoffs.\n\nOne agent leads, the other supports. No more race conditions.\n\n#AI #MultiAgent #BuildInPublic',
    basedOn: 'Multi-agent coordination learning',
    generated: '2026-01-31'
  },
  {
    id: '2',
    platform: 'linkedin',
    content: 'Building a multi-agent AI system? Here\'s what we learned:\n\n✅ Use turn-based protocols to prevent race conditions\n✅ SSH over Tailscale for seamless cross-machine communication\n✅ Sub-agent spawning with labels for task isolation\n\nThe key insight: coordination > parallel execution when agents share context.',
    basedOn: 'All learnings from 2026-01-31',
    generated: '2026-01-31'
  }
]

export default function LearningsPage() {
  const [activeTab, setActiveTab] = useState<'learnings' | 'content'>('learnings')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const successLearnings = learnings.filter(l => l.type === 'success')
  const failureLearnings = learnings.filter(l => l.type === 'failure')

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-green-400 bg-green-400/10'
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'Low': return 'text-gray-400 bg-gray-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-4 h-4" />
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              AI Research & Learnings
            </h1>
            <p className="text-gray-400 mt-1">
              Findings from ClawLegion agent experiments
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            Generate Content
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('learnings')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'learnings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Learnings
            </span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'content'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Content Suggestions
            </span>
          </button>
        </div>

        {activeTab === 'learnings' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What Worked */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                What Worked
              </h2>
              <div className="space-y-3">
                {successLearnings.map((learning, idx) => (
                  <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-gray-500">{learning.date}</span>
                        <h3 className="text-white font-medium">{learning.topic}</h3>
                        <p className="text-gray-400 text-sm mt-1">{learning.insight}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getImpactColor(learning.impact)}`}>
                        {learning.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What Didn&#39;t Work */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-400" />
                What Didn&#39;t Work
              </h2>
              <div className="space-y-3">
                {failureLearnings.map((learning, idx) => (
                  <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-gray-500">{learning.date}</span>
                        <h3 className="text-white font-medium">{learning.topic}</h3>
                        <p className="text-gray-400 text-sm mt-1">{learning.insight}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getImpactColor(learning.impact)}`}>
                        {learning.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Questions */}
            <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                Open Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {openQuestions.map((question, idx) => (
                  <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-300 text-sm">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {contentSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(suggestion.platform)}
                    <span className="text-white font-medium capitalize">{suggestion.platform}</span>
                    <span className="text-xs text-gray-500">• Based on: {suggestion.basedOn}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(suggestion.content, suggestion.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedId === suggestion.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-300 whitespace-pre-wrap">{suggestion.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-400">{successLearnings.length}</div>
            <div className="text-xs text-gray-400">Successes</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-red-400">{failureLearnings.length}</div>
            <div className="text-xs text-gray-400">Failures</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-blue-400">{openQuestions.length}</div>
            <div className="text-xs text-gray-400">Open Questions</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-purple-400">{contentSuggestions.length}</div>
            <div className="text-xs text-gray-400">Content Ideas</div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
