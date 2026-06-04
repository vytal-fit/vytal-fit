"use client";

import { useState, useCallback, useMemo } from "react";
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  GripVertical,
  Calendar,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  assigneeInitials: string | null;
  dueDate: string;
  dueDateLabel: string;
  overdue: boolean;
}

// ---------------------------------------------------------------------------
// Mock staff
// ---------------------------------------------------------------------------

const staffMembers = [
  { name: "Andre", initials: "AF" },
  { name: "Marine", initials: "ML" },
  { name: "Silvina", initials: "SR" },
  { name: "Ricardo", initials: "RC" },
  { name: "Owner", initials: "OW" },
];

// ---------------------------------------------------------------------------
// Mock tasks
// ---------------------------------------------------------------------------

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Order new jump ropes",
    description: "Current stock running low. Need 20 speed ropes and 10 weighted ropes.",
    status: "todo",
    priority: "high",
    assignee: "Andre",
    assigneeInitials: "AF",
    dueDate: "2026-06-05",
    dueDateLabel: "Tomorrow",
    overdue: false,
  },
  {
    id: "task-2",
    title: "Update class schedule for July",
    description: "Adjust summer schedule with new coaches and time slots.",
    status: "todo",
    priority: "medium",
    assignee: "Andre",
    assigneeInitials: "AF",
    dueDate: "2026-06-07",
    dueDateLabel: "In 3 days",
    overdue: false,
  },
  {
    id: "task-3",
    title: "Fix shower drain",
    description: "Shower in men's changing room draining slowly. Plumber needed.",
    status: "todo",
    priority: "high",
    assignee: null,
    assigneeInitials: null,
    dueDate: "2026-06-01",
    dueDateLabel: "Overdue",
    overdue: true,
  },
  {
    id: "task-4",
    title: "Send monthly newsletter",
    description: "Include summer promotions, new class types and coach spotlight.",
    status: "todo",
    priority: "medium",
    assignee: "Marine",
    assigneeInitials: "ML",
    dueDate: "2026-06-09",
    dueDateLabel: "In 5 days",
    overdue: false,
  },
  {
    id: "task-5",
    title: "Prepare payroll for June",
    description: "Compile hours for all coaches and staff. Submit to accountant.",
    status: "todo",
    priority: "high",
    assignee: "Owner",
    assigneeInitials: "OW",
    dueDate: "2026-06-06",
    dueDateLabel: "In 2 days",
    overdue: false,
  },
  {
    id: "task-6",
    title: "Review insurance renewal",
    description: "Annual insurance renewal due. Compare quotes from 3 providers.",
    status: "todo",
    priority: "low",
    assignee: "Owner",
    assigneeInitials: "OW",
    dueDate: "2026-06-18",
    dueDateLabel: "In 2 weeks",
    overdue: false,
  },
  {
    id: "task-7",
    title: "Clean equipment room",
    description: "Deep clean and reorganize the storage room. Discard damaged items.",
    status: "in_progress",
    priority: "low",
    assignee: "Silvina",
    assigneeInitials: "SR",
    dueDate: "2026-06-04",
    dueDateLabel: "Today",
    overdue: false,
  },
  {
    id: "task-8",
    title: "Upload new exercise videos",
    description: "Record and upload tutorial videos for the new movement library.",
    status: "in_progress",
    priority: "medium",
    assignee: "Ricardo",
    assigneeInitials: "RC",
    dueDate: "2026-06-10",
    dueDateLabel: "In 6 days",
    overdue: false,
  },
  {
    id: "task-9",
    title: "Contact supplier for chalk",
    description: "We are running low on lifting chalk. Order at least 10 blocks.",
    status: "in_progress",
    priority: "low",
    assignee: null,
    assigneeInitials: null,
    dueDate: "2026-06-12",
    dueDateLabel: "In 8 days",
    overdue: false,
  },
  {
    id: "task-10",
    title: "Schedule team meeting",
    description: "Monthly all-hands meeting to discuss Q3 goals and schedule.",
    status: "done",
    priority: "medium",
    assignee: "Owner",
    assigneeInitials: "OW",
    dueDate: "2026-06-02",
    dueDateLabel: "Completed",
    overdue: false,
  },
  {
    id: "task-11",
    title: "Update member waivers",
    description: "New liability waiver template needs to be updated in the system.",
    status: "done",
    priority: "high",
    assignee: "Marine",
    assigneeInitials: "ML",
    dueDate: "2026-06-01",
    dueDateLabel: "Completed",
    overdue: false,
  },
  {
    id: "task-12",
    title: "Order protein shakes stock",
    description: "Restock protein shakes for the store. At least 3 flavors.",
    status: "done",
    priority: "medium",
    assignee: "Silvina",
    assigneeInitials: "SR",
    dueDate: "2026-05-30",
    dueDateLabel: "Completed",
    overdue: false,
  },
  {
    id: "task-13",
    title: "Set up new barbell rack",
    description: "Assemble and install the new barbell rack delivered last week.",
    status: "done",
    priority: "low",
    assignee: "Ricardo",
    assigneeInitials: "RC",
    dueDate: "2026-05-28",
    dueDateLabel: "Completed",
    overdue: false,
  },
  {
    id: "task-14",
    title: "Repair pull-up bar mount",
    description: "Wall mount on station 3 is loose. Needs reinforcement.",
    status: "in_progress",
    priority: "high",
    assignee: "Andre",
    assigneeInitials: "AF",
    dueDate: "2026-06-03",
    dueDateLabel: "Overdue",
    overdue: true,
  },
  {
    id: "task-15",
    title: "Plan community event for June",
    description: "Organize a Saturday community workout. Contact sponsors.",
    status: "done",
    priority: "medium",
    assignee: "Owner",
    assigneeInitials: "OW",
    dueDate: "2026-05-29",
    dueDateLabel: "Completed",
    overdue: false,
  },
];

// ---------------------------------------------------------------------------
// Priority config
// ---------------------------------------------------------------------------

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  high: { label: "High", color: "text-vytal-red", bg: "bg-vytal-red/10" },
  medium: { label: "Medium", color: "text-vytal-amber", bg: "bg-vytal-amber/10" },
  low: { label: "Low", color: "text-vytal-green", bg: "bg-vytal-green/10" },
};

const statusConfig: Record<TaskStatus, { label: string; icon: typeof CheckSquare }> = {
  todo: { label: "To Do", icon: Clock },
  in_progress: { label: "In Progress", icon: AlertTriangle },
  done: { label: "Done", icon: CheckCircle },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TasksPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newDueDate, setNewDueDate] = useState("");

  // Stats
  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter((t) => t.overdue && t.status !== "done").length;
  const dueTodayTasks = tasks.filter((t) => t.dueDateLabel === "Today" && t.status !== "done").length;
  const completedThisWeek = tasks.filter((t) => t.status === "done").length;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterAssignee !== "all" && task.assignee !== filterAssignee) return false;
      if (filterStatus !== "all" && task.status !== filterStatus) return false;
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterAssignee, filterStatus, filterPriority]);

  // Group by status
  const columns: TaskStatus[] = ["todo", "in_progress", "done"];
  const grouped = useMemo(() => {
    const result: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    filteredTasks.forEach((task) => result[task.status].push(task));
    return result;
  }, [filteredTasks]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleDragOver = useCallback((_e: React.DragEvent, status: TaskStatus) => {
    _e.preventDefault();
    _e.dataTransfer.dropEffect = "move";
    setDropTarget(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("text/plain");
      if (taskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: targetStatus, overdue: targetStatus === "done" ? false : t.overdue }
              : t
          )
        );
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          toast(`"${task.title}" moved to ${statusConfig[targetStatus].label}`, "success");
        }
      }
      setDraggingId(null);
      setDropTarget(null);
    },
    [tasks, toast]
  );

  // Add task
  const handleAddTask = useCallback(() => {
    if (!newTitle.trim()) return;
    const staff = staffMembers.find((s) => s.name === newAssignee);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: "todo",
      priority: newPriority,
      assignee: staff?.name ?? null,
      assigneeInitials: staff?.initials ?? null,
      dueDate: newDueDate || "",
      dueDateLabel: newDueDate
        ? new Date(newDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "No date",
      overdue: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setNewAssignee("");
    setNewPriority("medium");
    setNewDueDate("");
    setShowAddForm(false);
    toast(t("tasks.taskCreated"), "success");
  }, [newTitle, newDescription, newAssignee, newPriority, newDueDate, toast, t]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-vytal-text">{t("tasks.title")}</h1>
          <span className="flex h-7 items-center rounded-full bg-vytal-green/10 px-3 text-xs font-semibold text-vytal-green">
            {totalTasks}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("tasks.addTask")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: t("tasks.total"), value: totalTasks, color: "text-vytal-text" },
          { label: t("tasks.overdue"), value: overdueTasks, color: "text-vytal-red" },
          { label: t("tasks.dueToday"), value: dueTodayTasks, color: "text-vytal-amber" },
          { label: t("tasks.completedThisWeek"), value: completedThisWeek, color: "text-vytal-green" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4"
          >
            <p className="text-xs text-vytal-muted">{stat.label}</p>
            <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
        >
          <option value="all">{t("tasks.allAssignees")}</option>
          {staffMembers.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
          <option value="">{t("tasks.unassigned")}</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
        >
          <option value="all">{t("tasks.allStatuses")}</option>
          <option value="todo">{t("tasks.statusTodo")}</option>
          <option value="in_progress">{t("tasks.statusInProgress")}</option>
          <option value="done">{t("tasks.statusDone")}</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
        >
          <option value="all">{t("tasks.allPriorities")}</option>
          <option value="high">{t("tasks.priorityHigh")}</option>
          <option value="medium">{t("tasks.priorityMedium")}</option>
          <option value="low">{t("tasks.priorityLow")}</option>
        </select>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-bg2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vytal-text">{t("tasks.addTask")}</h3>
            <button onClick={() => setShowAddForm(false)} className="text-vytal-muted hover:text-vytal-text">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t("tasks.titlePlaceholder")}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="col-span-2 rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <textarea
              placeholder={t("tasks.descriptionPlaceholder")}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="col-span-2 rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
            >
              <option value="">{t("tasks.unassigned")}</option>
              {staffMembers.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
            >
              <option value="high">{t("tasks.priorityHigh")}</option>
              <option value="medium">{t("tasks.priorityMedium")}</option>
              <option value="low">{t("tasks.priorityLow")}</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTitle.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {t("tasks.addTask")}
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-5">
        {columns.map((status) => {
          const config = statusConfig[status];
          const StatusIcon = config.icon;
          const columnTasks = grouped[status];

          return (
            <div
              key={status}
              className={cn(
                "rounded-xl border bg-vytal-bg2 transition-colors",
                dropTarget === status
                  ? "border-vytal-green/50 bg-vytal-green/5"
                  : "border-vytal-border"
              )}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-vytal-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <StatusIcon
                    className={cn(
                      "h-4 w-4",
                      status === "todo"
                        ? "text-vytal-muted"
                        : status === "in_progress"
                          ? "text-vytal-amber"
                          : "text-vytal-green"
                    )}
                  />
                  <span className="text-sm font-semibold text-vytal-text">{config.label}</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-vytal-bg3 text-[10px] font-bold text-vytal-muted">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3 p-3" style={{ minHeight: 200 }}>
                {columnTasks.map((task) => {
                  const pConfig = priorityConfig[task.priority];
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={cn(
                        "cursor-grab rounded-lg border border-vytal-border bg-vytal-bg p-3 transition-all hover:border-vytal-green/30 active:cursor-grabbing",
                        draggingId === task.id && "opacity-50"
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="h-3.5 w-3.5 shrink-0 text-vytal-muted/50" />
                          <span className="text-sm font-semibold text-vytal-text">{task.title}</span>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            pConfig.bg,
                            pConfig.color
                          )}
                        >
                          {pConfig.label}
                        </span>
                      </div>
                      {task.description && (
                        <p className="mb-2 text-xs text-vytal-muted line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.assigneeInitials ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vytal-green/10 text-[9px] font-bold text-vytal-green">
                              {task.assigneeInitials}
                            </div>
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vytal-bg3">
                              <User className="h-3 w-3 text-vytal-muted" />
                            </div>
                          )}
                          <span className="text-[10px] text-vytal-muted">
                            {task.assignee ?? t("tasks.unassigned")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-vytal-muted" />
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              task.overdue ? "text-vytal-red" : "text-vytal-muted"
                            )}
                          >
                            {task.dueDateLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
