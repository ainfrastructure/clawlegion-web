"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout";
import {
  User,
  Palette,
  Bell,
  Clock,
  Keyboard,
  MessageSquare,
  Monitor,
  Moon,
  Sun,
  Check,
  Save,
} from "lucide-react";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    taskUpdates: boolean;
    agentAlerts: boolean;
    systemAnnouncements: boolean;
    soundEnabled: boolean;
  };
  display: {
    defaultPage: string;
    compactMode: boolean;
    showTimestamps: boolean;
    dateFormat: string;
    timeZone: string;
  };
  keyboard: {
    shortcutsEnabled: boolean;
    showHints: boolean;
  };
  chat: {
    autoScroll: boolean;
    showTypingIndicator: boolean;
    notifyOnMention: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  theme: "dark",
  notifications: {
    taskUpdates: true,
    agentAlerts: true,
    systemAnnouncements: true,
    soundEnabled: false,
  },
  display: {
    defaultPage: "/dashboard",
    compactMode: false,
    showTimestamps: true,
    dateFormat: "relative",
    timeZone: "UTC",
  },
  keyboard: {
    shortcutsEnabled: true,
    showHints: true,
  },
  chat: {
    autoScroll: true,
    showTypingIndicator: true,
    notifyOnMention: true,
  },
};

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem("userPreferences");
    if (stored) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      } catch (e) {
        console.error("Failed to parse preferences", e);
      }
    }
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    section: K,
    key: keyof UserPreferences[K],
    value: UserPreferences[K][keyof UserPreferences[K]]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [key]: value,
      },
    }));
    setHasChanges(true);
    setSaved(false);
  };

  const setTheme = (theme: UserPreferences["theme"]) => {
    setPreferences((prev) => ({ ...prev, theme }));
    setHasChanges(true);
    setSaved(false);
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
      await new Promise((r) => setTimeout(r, 500)); // Simulate save
      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <User className="text-slate-400" /> Preferences
          </h1>
          <p className="text-slate-400">Customize your dashboard experience</p>
        </div>
        <button
          onClick={savePreferences}
          disabled={!hasChanges || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            hasChanges
              ? "bg-red-600 hover:bg-red-700 text-white"
              : saved
              ? "bg-green-600 text-white"
              : "bg-slate-700 text-slate-400"
          }`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={18} />
              Saved!
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Theme */}
        <Section icon={<Palette className="text-purple-400" />} title="Appearance">
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", icon: <Sun size={20} />, label: "Light" },
              { value: "dark", icon: <Moon size={20} />, label: "Dark" },
              { value: "system", icon: <Monitor size={20} />, label: "System" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value as UserPreferences["theme"])}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                  preferences.theme === opt.value
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-white/[0.06] bg-slate-800/50 text-slate-400 hover:border-slate-600"
                }`}
              >
                {opt.icon}
                <span className="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={<Bell className="text-amber-400" />} title="Notifications">
          <div className="space-y-4">
            <Toggle
              label="Task Updates"
              description="Get notified when tasks are assigned or completed"
              checked={preferences.notifications.taskUpdates}
              onChange={(v) => updatePreference("notifications", "taskUpdates", v)}
            />
            <Toggle
              label="Agent Alerts"
              description="Receive alerts when agents need attention"
              checked={preferences.notifications.agentAlerts}
              onChange={(v) => updatePreference("notifications", "agentAlerts", v)}
            />
            <Toggle
              label="System Announcements"
              description="Important system updates and announcements"
              checked={preferences.notifications.systemAnnouncements}
              onChange={(v) => updatePreference("notifications", "systemAnnouncements", v)}
            />
            <Toggle
              label="Sound Effects"
              description="Play sounds for notifications"
              checked={preferences.notifications.soundEnabled}
              onChange={(v) => updatePreference("notifications", "soundEnabled", v)}
            />
          </div>
        </Section>

        {/* Display */}
        <Section icon={<Clock className="text-cyan-400" />} title="Display & Time">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Default Page"
                value={preferences.display.defaultPage}
                onChange={(v) => updatePreference("display", "defaultPage", v)}
                options={[
                  { value: "/dashboard", label: "Dashboard" },
                  { value: "/tasks", label: "Tasks" },
                  { value: "/sessions", label: "Loops" },
                ]}
              />
              <Select
                label="Date Format"
                value={preferences.display.dateFormat}
                onChange={(v) => updatePreference("display", "dateFormat", v)}
                options={[
                  { value: "relative", label: "Relative (2 hours ago)" },
                  { value: "absolute", label: "Absolute (Jan 31, 10:00)" },
                  { value: "iso", label: "ISO (2026-01-31T10:00)" },
                ]}
              />
            </div>
            <Select
              label="Time Zone"
              value={preferences.display.timeZone}
              onChange={(v) => updatePreference("display", "timeZone", v)}
              options={[
                { value: "UTC", label: "UTC" },
                { value: "America/New_York", label: "Eastern Time (ET)" },
                { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
                { value: "Europe/London", label: "London (GMT)" },
                { value: "Europe/Oslo", label: "Oslo (CET)" },
                { value: "Asia/Tokyo", label: "Tokyo (JST)" },
              ]}
            />
            <Toggle
              label="Compact Mode"
              description="Reduce spacing for more content on screen"
              checked={preferences.display.compactMode}
              onChange={(v) => updatePreference("display", "compactMode", v)}
            />
            <Toggle
              label="Show Timestamps"
              description="Display timestamps on messages and events"
              checked={preferences.display.showTimestamps}
              onChange={(v) => updatePreference("display", "showTimestamps", v)}
            />
          </div>
        </Section>

        {/* Keyboard */}
        <Section icon={<Keyboard className="text-green-400" />} title="Keyboard Shortcuts">
          <div className="space-y-4">
            <Toggle
              label="Enable Shortcuts"
              description="Use keyboard shortcuts for quick actions"
              checked={preferences.keyboard.shortcutsEnabled}
              onChange={(v) => updatePreference("keyboard", "shortcutsEnabled", v)}
            />
            <Toggle
              label="Show Hints"
              description="Display keyboard hints in tooltips and menus"
              checked={preferences.keyboard.showHints}
              onChange={(v) => updatePreference("keyboard", "showHints", v)}
            />
          </div>
        </Section>

        {/* Chat */}
        <Section icon={<MessageSquare className="text-red-400" />} title="Chat">
          <div className="space-y-4">
            <Toggle
              label="Auto-Scroll"
              description="Automatically scroll to new messages"
              checked={preferences.chat.autoScroll}
              onChange={(v) => updatePreference("chat", "autoScroll", v)}
            />
            <Toggle
              label="Typing Indicator"
              description="Show when agents are composing a response"
              checked={preferences.chat.showTypingIndicator}
              onChange={(v) => updatePreference("chat", "showTypingIndicator", v)}
            />
            <Toggle
              label="Mention Notifications"
              description="Get notified when mentioned in chat"
              checked={preferences.chat.notifyOnMention}
              onChange={(v) => updatePreference("chat", "notifyOnMention", v)}
            />
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-2 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        {icon}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white font-medium">{label}</div>
        <div className="text-sm text-slate-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-red-600" : "bg-slate-600"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
