import { NextRequest, NextResponse } from 'next/server';
import { audit } from '@/lib/audit';
import fs from 'fs';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: string;
  createdBy: string;
  createdAt: string;
  assignedTo?: string;
  assignedAt?: string;
  injected?: boolean;
  priorityOverride?: boolean;
}

function loadTasks(): Task[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading tasks:', e);
  }
  return [];
}

function saveTasks(tasks: Task[]): void {
  const dir = path.dirname(TASKS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();
    
    const { title, description, priority = 'high', priorityOverride = true } = body;
    
    if (!title) {
      return NextResponse.json({
        success: false,
        message: 'Task title is required',
      }, { status: 400 });
    }
    
    // Create the injected task
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      description,
      priority,
      status: 'assigned',
      createdBy: 'CommandCenter',
      createdAt: new Date().toISOString(),
      assignedTo: agentId,
      assignedAt: new Date().toISOString(),
      injected: true,
      priorityOverride,
    };
    
    // Load existing tasks and add the new one
    const tasks = loadTasks();
    
    if (priorityOverride) {
      // Insert at the beginning (highest priority)
      tasks.unshift(task);
    } else {
      // Add based on priority level
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      const insertIndex = tasks.findIndex(t => 
        priorityOrder[t.priority as keyof typeof priorityOrder] > priorityOrder[priority as keyof typeof priorityOrder]
      );
      if (insertIndex === -1) {
        tasks.push(task);
      } else {
        tasks.splice(insertIndex, 0, task);
      }
    }
    
    saveTasks(tasks);
    
    // Audit log: task injected to agent
    audit.taskCreated('CommandCenter', task.id, task.title, {
      assignedTo: agentId,
      injected: true,
      priority,
      priorityOverride,
    });
    
    console.log(`Task injected to agent ${agentId}:`, task);
    
    return NextResponse.json({
      success: true,
      message: `Task "${title}" injected to agent ${agentId}`,
      task,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Inject error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to inject task',
    }, { status: 500 });
  }
}

// GET - Show agent's injected tasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const tasks = loadTasks();
    const agentTasks = tasks.filter(t => t.assignedTo === agentId && t.injected);
    
    return NextResponse.json({
      agentId,
      injectedTasks: agentTasks,
      count: agentTasks.length,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get injected tasks',
    }, { status: 500 });
  }
}
