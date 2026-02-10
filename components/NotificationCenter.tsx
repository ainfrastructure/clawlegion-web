"use client";

import { useState, useEffect } from "react";
import { Bell, ExternalLink } from "lucide-react";

interface Notification {
  id: string;
  type: "task" | "mention" | "agent" | "system";
  title: string;
  description: string;
  icon: string;
  priority: "high" | "normal" | "low";
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "task",
    title: "New task: Fix login bug",
    description: "Assigned by human",
    icon: "🎯",
    priority: "high",
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    actionUrl: "/tasks",
    actionLabel: "View"
  },
  {
    id: "2", 
    type: "agent",
    title: "SousChef completed API endpoint",
    description: "Task completed",
    icon: "✅",
    priority: "normal",
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    actionUrl: "/tasks",
    actionLabel: "View"
  },
  {
    id: "3",
    type: "mention",
    title: "drunken_chickenx mentioned you",
    description: "In #development",
    icon: "💬",
    priority: "high",
    read: true,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    actionUrl: "#",
    actionLabel: "Jump"
  }
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "task" | "mention" | "system">("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = notifications.filter(n => 
    filter === "all" || n.type === filter
  );

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-96 bg-slate-800 border border-white/[0.06] rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white">Notifications</h3>
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mark all read
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 px-2 py-2 border-b border-white/[0.06]">
              {(["all", "task", "mention", "system"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                    filter === tab 
                      ? "bg-blue-600 text-white" 
                      : "text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {tab === "all" ? "All" : tab}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  No notifications
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-white/[0.06]/50 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                      !notification.read ? "bg-slate-700/30" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{notification.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${!notification.read ? "font-semibold text-white" : "text-slate-300"}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {notification.description} • {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          {notification.actionLabel}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/[0.06] bg-slate-800/50">
              <a 
                href="/audit?view=activity" 
                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                📜 View all notifications
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
